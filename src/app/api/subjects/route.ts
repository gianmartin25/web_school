import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/subjects - Obtener todas las materias
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener todas las materias activas incluyendo profesores asignados (vía tabla de unión)
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        teacherSubjects: {
          include: {
            teacher: { include: { user: { select: { id: true, name: true, email: true } } } }
          }
        }
      }
    })

    // Compatibilidad hacia atrás: mapear teacherId/teacher al primer registro si existe y exponer teacherIds
    const mapped = subjects.map(s => {
      const first = s.teacherSubjects && s.teacherSubjects.length > 0 ? s.teacherSubjects[0] : null
      return {
        ...s,
        teacherIds: s.teacherSubjects ? s.teacherSubjects.map(ts => ts.teacherId) : [],
        teacherId: first ? first.teacherId : null,
        teacher: first ? { id: first.teacher.id, firstName: first.teacher.firstName, lastName: first.teacher.lastName, user: first.teacher.user } : null,
      }
    })

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/subjects - Crear nueva materia (acepta teacherIds para asignaciones)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, code, description, credits = 1, isActive = true, teacherIds = [] } = body

    if (!name || !code) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const subject = await prisma.subject.create({
      data: { name, code, description, credits: Number(credits), isActive },
    })

    if (Array.isArray(teacherIds) && teacherIds.length > 0) {
      const data = teacherIds.map((tid: string) => ({ teacherId: tid, subjectId: subject.id }))
      await prisma.teacherSubject.createMany({ data, skipDuplicates: true })
    }

    // Devolver subject con relaciones
    const result = await prisma.subject.findUnique({
      where: { id: subject.id },
      include: { teacherSubjects: { include: { teacher: true } } }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}