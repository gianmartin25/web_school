import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    interface ClassWithDetails {
      id: string
      name: string
      grade: string
      section: string
      academicYear: string
      maxStudents: number
      isActive: boolean
      createdAt: Date
      subject: { id: string, name: string, code: string }
      teacher: { 
        id: string, 
        firstName: string, 
        lastName: string, 
        user: { email: string } 
      }
      academicGrade: { name: string } | null
      academicSection: { name: string } | null
      _count: { students: number }
    }

    let classes: ClassWithDetails[] = []

    if (session.user.role === 'TEACHER') {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!teacherProfile) {
        return NextResponse.json({ error: 'Perfil de profesor no encontrado' }, { status: 404 })
      }

      classes = await prisma.class.findMany({
        where: {
          teacherId: teacherProfile.id
        },
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
          },
          academicGrade: true,
          academicSection: true,
          _count: {
            select: {
              students: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    } else if (session.user.role === 'ADMIN') {
      // Admins can see all classes
      classes = await prisma.class.findMany({
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
          },
          academicGrade: true,
          academicSection: true,
          _count: {
            select: {
              students: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    }

    // Transform the data for frontend
    const formattedClasses = classes.map((classItem: ClassWithDetails) => ({
      id: classItem.id,
      name: classItem.name,
      subject: {
        id: classItem.subject.id,
        name: classItem.subject.name,
        code: classItem.subject.code
      },
      teacher: {
        id: classItem.teacher.id,
        firstName: classItem.teacher.firstName,
        lastName: classItem.teacher.lastName,
        email: classItem.teacher.user.email
      },
      grade: classItem.academicGrade?.name || classItem.grade || 'No asignado',
      section: classItem.academicSection?.name || classItem.section || 'No asignado',
      academicYear: classItem.academicYear,
      maxStudents: classItem.maxStudents,
      enrolledStudents: classItem._count.students,
      isActive: classItem.isActive,
      createdAt: classItem.createdAt
    }))

    return NextResponse.json({ 
      classes: formattedClasses,
      total: formattedClasses.length 
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      subjectId,
      teacherId,
      grade,
      section,
      academicYear,
      maxStudents = 30
    } = body

    if (!name || !subjectId || !teacherId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, subjectId, teacherId' },
        { status: 400 }
      )
    }

    // Verify teacher exists
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      )
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    })

    if (!subject) {
      return NextResponse.json(
        { error: 'Materia no encontrada' },
        { status: 404 }
      )
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        subjectId,
        teacherId,
        grade: grade || 'No definido',
        section: section || 'No definido',
        academicYear: academicYear || new Date().getFullYear().toString(),
        maxStudents
      },
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
        },
        academicGrade: true,
        academicSection: true
      }
    })

    const formattedClass = {
      id: newClass.id,
      name: newClass.name,
      subject: {
        id: newClass.subject.id,
        name: newClass.subject.name,
        code: newClass.subject.code
      },
      teacher: {
        id: newClass.teacher.id,
        firstName: newClass.teacher.firstName,
        lastName: newClass.teacher.lastName,
        email: newClass.teacher.user.email
      },
      grade: newClass.academicGrade?.name || newClass.grade,
      section: newClass.academicSection?.name || newClass.section,
      academicYear: newClass.academicYear,
      maxStudents: newClass.maxStudents,
      enrolledStudents: 0,
      isActive: newClass.isActive,
      createdAt: newClass.createdAt
    }

    return NextResponse.json({ class: formattedClass }, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}