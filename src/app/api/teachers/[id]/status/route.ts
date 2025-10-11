import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/teachers/[id]/status - Cambiar estado del profesor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    const { isActive } = await request.json()

    // Verificar que el profesor existe
    const existingTeacher = await prisma.teacherProfile.findUnique({
      where: { id }
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar estado
    const updatedTeacher = await prisma.teacherProfile.update({
      where: { id },
      data: { isActive },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        subjects: true,
        classes: true,
        _count: {
          select: {
            grades: true,
            attendances: true,
            observations: true
          }
        }
      }
    })

    return NextResponse.json(updatedTeacher)

  } catch (error) {
    console.error('Error updating teacher status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}