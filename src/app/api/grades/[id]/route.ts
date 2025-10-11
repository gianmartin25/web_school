import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/grades/[id] - Update a grade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Only teachers and admins can update grades
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar calificaciones' },
        { status: 403 }
      )
    }

    const { value, gradeType, description, gradeDate } = await request.json()

    // Verify the grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id },
      include: { teacher: true }
    })

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Calificación no encontrada' },
        { status: 404 }
      )
    }

    // For teachers, verify they own this grade
    if (session.user.role === 'TEACHER') {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!teacherProfile || existingGrade.teacherId !== teacherProfile.id) {
        return NextResponse.json(
          { error: 'No tienes permisos para actualizar esta calificación' },
          { status: 403 }
        )
      }
    }

    // Update the grade
    const updatedGrade = await prisma.grade.update({
      where: { id },
      data: {
        score: parseFloat(value),
        gradeType,
        comments: description || null,
        gradeDate: new Date(gradeDate)
      },
      include: {
        subject: true,
        student: true,
        teacher: true
      }
    })

    return NextResponse.json(updatedGrade)

  } catch (error) {
    console.error('Error updating grade:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/grades/[id] - Delete a grade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Only teachers and admins can delete grades
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar calificaciones' },
        { status: 403 }
      )
    }

    // Verify the grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id },
      include: { teacher: true }
    })

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Calificación no encontrada' },
        { status: 404 }
      )
    }

    // For teachers, verify they own this grade
    if (session.user.role === 'TEACHER') {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!teacherProfile || existingGrade.teacherId !== teacherProfile.id) {
        return NextResponse.json(
          { error: 'No tienes permisos para eliminar esta calificación' },
          { status: 403 }
        )
      }
    }

    // Delete the grade
    await prisma.grade.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Calificación eliminada exitosamente' })

  } catch (error) {
    console.error('Error deleting grade:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}