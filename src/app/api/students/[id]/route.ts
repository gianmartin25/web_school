import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/students/[id] - Obtener estudiante por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        parent: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        grades: {
          include: {
            subject: true,
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        attendances: true,
        classes: {
          include: {
            class: {
              include: {
                subject: true,
                teacher: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Actualizar estudiante
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      studentId,
      firstName,
      lastName,
      dateOfBirth,
      enrollmentDate,
      grade,
      section,
      parentFirstName,
      parentLastName,
      parentPhone,
      parentEmail,
      isActive
    } = body

    // Verificar si el estudiante existe
    const existingStudent = await prisma.studentProfile.findUnique({
      where: { id },
      include: { 
        parent: {
          include: {
            user: true
          }
        }
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar o crear el padre si es necesario
    let parentId = existingStudent.parentId
    
    if (parentFirstName && parentLastName) {
      if (existingStudent.parent) {
        // Actualizar padre existente
        await prisma.parentProfile.update({
          where: { id: existingStudent.parent.id },
          data: {
            firstName: parentFirstName,
            lastName: parentLastName,
            phone: parentPhone || '',
            address: 'Lima, Perú',
            occupation: 'No especificado',
          }
        })
        
        // Actualizar el usuario asociado al padre si existe
        if (existingStudent.parent.userId) {
          await prisma.user.update({
            where: { id: existingStudent.parent.userId },
            data: {
              name: `${parentFirstName} ${parentLastName}`,
              email: parentEmail || `${parentFirstName.toLowerCase()}.${parentLastName.toLowerCase()}@parent.school.com`,
            }
          })
        }
      } else {
        // Crear nuevo usuario para el padre
        const parentUser = await prisma.user.create({
          data: {
            email: parentEmail || `${parentFirstName.toLowerCase()}.${parentLastName.toLowerCase()}@parent.school.com`,
            name: `${parentFirstName} ${parentLastName}`,
            password: 'defaultpassword123', // En producción, debería generar una contraseña segura
            role: 'PARENT',
          }
        })
        
        // Crear nuevo padre
        const newParent = await prisma.parentProfile.create({
          data: {
            userId: parentUser.id,
            firstName: parentFirstName,
            lastName: parentLastName,
            phone: parentPhone || '',
            address: 'Lima, Perú',
            occupation: 'No especificado',
          }
        })
        parentId = newParent.id
      }
    }

    // Actualizar estudiante
    const updatedStudent = await prisma.studentProfile.update({
      where: { id },
      data: {
        studentId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        enrollmentDate: new Date(enrollmentDate),
        gradeId: grade, // Asumiendo que grade contiene el ID del grado
        sectionId: section, // Asumiendo que section contiene el ID de la sección
        parentId,
        isActive,
      },
      include: {
        parent: true,
      }
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Eliminar estudiante
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Verificar si el estudiante existe
    const existingStudent = await prisma.studentProfile.findUnique({
      where: { id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar relaciones dependientes primero
    await prisma.classStudent.deleteMany({
      where: { studentId: id }
    })

    await prisma.grade.deleteMany({
      where: { studentId: id }
    })

    await prisma.attendance.deleteMany({
      where: { studentId: id }
    })

    await prisma.observation.deleteMany({
      where: { studentId: id }
    })

    // Finalmente eliminar el estudiante
    await prisma.studentProfile.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Estudiante eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}