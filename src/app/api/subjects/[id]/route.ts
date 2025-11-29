import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/subjects/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { teacherSubjects: { include: { teacher: true } } }
    })

    if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

    const mapped = {
      ...subject,
      teacherIds: subject.teacherSubjects ? subject.teacherSubjects.map(ts => ts.teacherId) : [],
      teacherId: subject.teacherSubjects && subject.teacherSubjects.length > 0 ? subject.teacherSubjects[0].teacherId : null,
    }

    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Error fetching subject:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/subjects/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { name, code, description, credits = 1, isActive = true, teacherIds = [] } = await request.json()

    // Actualizar materia
    await prisma.subject.update({ where: { id }, data: { name, code, description, credits: Number(credits), isActive } })

    // Actualizar tabla de unión: borrar antiguos y crear nuevos
    await prisma.teacherSubject.deleteMany({ where: { subjectId: id } })
    if (Array.isArray(teacherIds) && teacherIds.length > 0) {
      const data = teacherIds.map((tid: string) => ({ teacherId: tid, subjectId: id }))
      await prisma.teacherSubject.createMany({ data, skipDuplicates: true })
    }

    const result = await prisma.subject.findUnique({ where: { id }, include: { teacherSubjects: { include: { teacher: true } } } })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/subjects/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar dependencias antes de eliminar
    const dependencies = await prisma.subject.findUnique({
      where: { id },
      include: {
        teacherSubjects: true,
        classes: true,
        _count: {
          select: {
            teacherSubjects: true,
            classes: true
          }
        }
      }
    })

    if (!dependencies) {
      return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })
    }

    // Verificar si hay dependencias
    if (dependencies._count.teacherSubjects > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar esta materia porque hay profesores asignados a ella',
          details: `${dependencies._count.teacherSubjects} profesor(es) asignado(s)`
        }, 
        { status: 400 }
      )
    }

    if (dependencies._count.classes > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar esta materia porque hay clases asociadas a ella',
          details: `${dependencies._count.classes} clase(s) asociada(s)`
        }, 
        { status: 400 }
      )
    }

    // Borrar subject (las filas en teacherSubjects eliminarán por cascade)
    await prisma.subject.delete({ where: { id } })
    return NextResponse.json({ message: 'Materia eliminada' })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
