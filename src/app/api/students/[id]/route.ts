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

    // Validar grado y sección si se proporcionan
    if (grade) {
      const gradeObj = await prisma.academicGrade.findUnique({ where: { id: grade } })
      if (!gradeObj || !gradeObj.isActive) {
        return NextResponse.json(
          { error: 'El grado seleccionado está inactivo o no existe.' },
          { status: 400 }
        )
      }
    }

    if (section) {
      const sectionObj = await prisma.section.findUnique({ where: { id: section } })
      if (!sectionObj || !sectionObj.isActive) {
        return NextResponse.json(
          { error: 'La sección seleccionada está inactiva o no existe.' },
          { status: 400 }
        )
      }
    }

    // Actualizar estudiante
    const updatedStudent = await prisma.studentProfile.update({
      where: { id },
      data: {
        ...(studentId && { studentId }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(enrollmentDate && { enrollmentDate: new Date(enrollmentDate) }),
        ...(grade && { gradeId: grade }),
        ...(section && { sectionId: section }),
        ...(parentId && { parentId }),
        ...(isActive !== undefined && { isActive }),
      },
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
        academicGrade: {
          select: {
            id: true,
            name: true
          }
        },
        academicSection: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Si se cambió el grado o la sección, rematricular automáticamente
    if (grade || section) {
      const finalGrade = grade || existingStudent.gradeId
      const finalSection = section || existingStudent.sectionId

      // Eliminar matriculaciones anteriores
      await prisma.classStudent.deleteMany({
        where: { studentId: id }
      })

      // Matricular en las clases del nuevo grado/sección
      const matchingClasses = await prisma.class.findMany({
        where: {
          gradeId: finalGrade,
          sectionId: finalSection,
          isActive: true
        }
      })

      if (matchingClasses.length > 0) {
        await prisma.classStudent.createMany({
          data: matchingClasses.map(classItem => ({
            classId: classItem.id,
            studentId: id
          })),
          skipDuplicates: true
        })
        console.log(`Student re-enrolled in ${matchingClasses.length} classes after update`)
      }
    }

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