import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/teachers/[id] - Obtener profesor específico
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      )
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
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

    if (!teacher) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(teacher)

  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/teachers/[id] - Actualizar profesor
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    const { 
      name, 
      email, 
      employeeId, 
      firstName, 
      lastName, 
      phone, 
      address, 
      dateOfBirth, 
      salary,
      isActive,
      subjectIds = []
    } = await request.json()

    // Verificar que el profesor existe
    const existingTeacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar email único (excepto el actual)
    if (email !== existingTeacher.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        )
      }
    }

    // Verificar employeeId único (excepto el actual)
    if (employeeId !== existingTeacher.employeeId) {
      const existingEmployee = await prisma.teacherProfile.findUnique({
        where: { employeeId }
      })

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'El ID de empleado ya está registrado' },
          { status: 400 }
        )
      }
    }

    // Actualizar en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar usuario
      await tx.user.update({
        where: { id: existingTeacher.userId },
        data: {
          name,
          email
        }
      })

      // Actualizar perfil de profesor
      await tx.teacherProfile.update({
        where: { id },
        data: {
          employeeId,
          firstName,
          lastName,
          phone: phone || null,
          address: address || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          salary: salary ? parseFloat(salary) : null,
          isActive: isActive !== undefined ? isActive : existingTeacher.isActive
        }
      })

      // Desasignar todas las materias actuales del profesor
      await tx.subject.updateMany({
        where: { teacherId: id },
        data: { teacherId: null }
      })

      // Asignar nuevas materias
      if (subjectIds.length > 0) {
        await tx.subject.updateMany({
          where: {
            id: {
              in: subjectIds
            }
          },
          data: {
            teacherId: id
          }
        })
      }

      // Recargar el profesor con toda la información
      return await tx.teacherProfile.findUnique({
        where: { id },
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
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/teachers/[id] - Eliminar profesor
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    // Verificar que el profesor existe
    const existingTeacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar en una transacción
    await prisma.$transaction(async (tx) => {
      // Desasignar materias
      await tx.subject.updateMany({
        where: { teacherId: id },
        data: { teacherId: null }
      })

      // Eliminar perfil de profesor
      await tx.teacherProfile.delete({
        where: { id }
      })

      // Eliminar usuario
      await tx.user.delete({
        where: { id: existingTeacher.userId }
      })
    })

    return NextResponse.json({ message: 'Profesor eliminado exitosamente' })

  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}