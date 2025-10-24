import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role === 'PARENT') {
      // Parents can only see their own children
      const parentProfile = await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          children: {
            include: {
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
              },
              parent: {
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
      })

      if (!parentProfile) {
        return NextResponse.json({ error: "Parent profile not found" }, { status: 404 })
      }

      // Transform children data to match expected format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentsData = parentProfile.children.map((child: any) => ({
        id: child.id,
        studentId: child.studentId,
        firstName: child.firstName,
        lastName: child.lastName,
        email: child.email,
        phone: child.phone,
        dateOfBirth: child.dateOfBirth,
        grade: child.grade,
        section: child.section,
        enrollmentDate: child.enrollmentDate,
        isActive: child.isActive,
        class: child.classes[0]?.class ? {
          id: child.classes[0].class.id,
          name: child.classes[0].class.subject.name,
          grade: child.grade,
          section: child.section || ""
        } : null,
        parents: [{
          id: parentProfile.id,
          firstName: parentProfile.firstName,
          lastName: parentProfile.lastName,
          email: child.parent.user.email
        }]
      }))

      return NextResponse.json(studentsData)
    }

    if (session.user.role === 'TEACHER') {
      // Teachers can see students in their classes
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          classes: {
            include: {
              classStudents: {
                include: {
                  student: {
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
                      classes: {
                        include: {
                          class: {
                            include: {
                              subject: true
                            }
                          }
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

      if (!teacherProfile) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const students = teacherProfile.classes.flatMap((c: any) => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        c.classStudents.map((cs: any) => ({
          id: cs.student.id,
          studentId: cs.student.studentId,
          firstName: cs.student.firstName,
          lastName: cs.student.lastName,
          email: cs.student.email,
          phone: cs.student.phone,
          dateOfBirth: cs.student.dateOfBirth,
          grade: cs.student.grade,
          section: cs.student.section,
          enrollmentDate: cs.student.enrollmentDate,
          isActive: cs.student.isActive,
          class: cs.student.classes[0]?.class ? {
            id: cs.student.classes[0].class.id,
            name: cs.student.classes[0].class.subject.name,
            grade: cs.student.grade,
            section: cs.student.section || ""
          } : null,
          parents: cs.student.parent ? [{
            id: cs.student.parent.id,
            firstName: cs.student.parent.firstName,
            lastName: cs.student.parent.lastName,
            email: cs.student.parent.user.email
          }] : []
        }))
      )

      return NextResponse.json(students)
    }

    if (session.user.role === 'ADMIN') {
      // Admins can see all students
      const students = await prisma.studentProfile.findMany({
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
              name: true,
              level: true
            }
          },
          academicSection: {
            select: {
              id: true,
              name: true
            }
          },
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Transform data to match expected format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentsData = students.map((student: any) => ({
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        grade: student.grade,
        section: student.section,
        enrollmentDate: student.enrollmentDate,
        isActive: student.isActive,
        class: student.classes[0]?.class ? {
          id: student.classes[0].class.id,
          name: student.classes[0].class.subject.name,
          grade: student.grade,
          section: student.section || ""
        } : null,
        parents: student.parent ? [{
          id: student.parent.id,
          firstName: student.parent.firstName,
          lastName: student.parent.lastName,
          email: student.parent.user.email
        }] : []
      }))

      return NextResponse.json(studentsData)
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins and teachers can create students
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }


    const body = await request.json()
    const {
      firstName,
      lastName,
      dateOfBirth,
      grade,
      section,
      parentId,
      parentFirstName,
      parentLastName,
      parentEmail,
      parentPhone
    } = body

    console.log('Received student data:', body)

    // Validar que el grado y la sección estén activos
    const [gradeObj, sectionObj] = await Promise.all([
      prisma.academicGrade.findUnique({ where: { id: grade } }),
      prisma.section.findUnique({ where: { id: section } })
    ])
    if (!gradeObj || !gradeObj.isActive) {
      return NextResponse.json({ error: "El grado seleccionado está inactivo o no existe." }, { status: 400 })
    }
    if (!sectionObj || !sectionObj.isActive) {
      return NextResponse.json({ error: "La sección seleccionada está inactiva o no existe." }, { status: 400 })
    }

    let finalParentId = parentId

    // Si no se proporciona parentId pero sí datos del padre, crear el padre primero
    if (!parentId && parentEmail) {
      try {
        // Verificar si el usuario/padre ya existe
        let parentUser = await prisma.user.findUnique({
          where: { email: parentEmail }
        })

        // Si no existe, crear el usuario padre
        if (!parentUser) {
          const hashedPassword = await bcrypt.hash('parent123', 10) // Contraseña temporal
          parentUser = await prisma.user.create({
            data: {
              email: parentEmail,
              name: `${parentFirstName} ${parentLastName}`,
              role: 'PARENT',
              password: hashedPassword,
              emailVerified: new Date()
            }
          })
        }

        // Verificar si el perfil de padre ya existe
        let parentProfile = await prisma.parentProfile.findUnique({
          where: { userId: parentUser.id }
        })

        // Si no existe, crear el perfil de padre
        if (!parentProfile) {
          parentProfile = await prisma.parentProfile.create({
            data: {
              userId: parentUser.id,
              firstName: parentFirstName || parentFirstName,
              lastName: parentLastName || parentLastName,
              phone: parentPhone || '',
              address: '',
              occupation: ''
            }
          })
        }

        finalParentId = parentProfile.id
        console.log('Created/found parent with ID:', finalParentId)
      } catch (parentError) {
        console.error('Error creating parent:', parentError)
        return NextResponse.json({ 
          error: "Error al crear el perfil del padre",
          details: parentError 
        }, { status: 400 })
      }
    }

    if (!finalParentId) {
      return NextResponse.json({ 
        error: "Se requiere un padre existente o información completa para crear uno nuevo" 
      }, { status: 400 })
    }

    // Generate student ID
    const studentCount = await prisma.studentProfile.count()
    const studentId = `STU${String(studentCount + 1).padStart(4, '0')}`

    // Create user for student
    const studentEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@estudiante.ie3024.edu.pe`
    const hashedPassword = await bcrypt.hash('student123', 10) // Contraseña temporal
    
    const studentUser = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: studentEmail,
        password: hashedPassword,
        role: 'STUDENT'
      }
    })

    const student = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        studentId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gradeId: grade, // Usar gradeId en lugar de grade
        sectionId: section, // Usar sectionId en lugar de section
        parentId: finalParentId,
        enrollmentDate: new Date(),
        isActive: true
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
        }
      }
    })

    console.log('Student created successfully:', student.id)
    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error("Error creating student:", error)
    
    // Devolver más información sobre el error
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Error al crear estudiante",
        message: error.message,
        details: error
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}