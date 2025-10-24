import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface GradeWithDetails {
  score: number
  createdAt: Date
  class: {
    subject: {
      name: string
    }
  }
}

interface AttendanceWithDetails {
  status: string
  date: Date
  class: {
    id: string
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener el usuario y luego el perfil del profesor
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      include: { user: true }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Perfil de profesor no encontrado' }, { status: 404 })
    }

    // Obtener todos los estudiantes de las clases del profesor
    const students = await prisma.studentProfile.findMany({
      where: {
        classes: {
          some: {
            class: {
              teacherId: teacherProfile.id
            }
          }
        }
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
          where: {
            class: {
              teacherId: teacherProfile.id
            }
          },
          include: {
            class: {
              include: {
                subject: true
              }
            }
          }
        },
        grades: {
          where: {
            teacherId: teacherProfile.id
          },
          include: {
            class: {
              include: {
                subject: true
              }
            }
          }
        },
        attendances: {
          where: {
            teacherId: teacherProfile.id
          },
          include: {
            class: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 10 // Últimas 10 asistencias
        }
      }
    })

    // Procesar datos para el frontend
    const processedStudents = students.map(student => {
      // Calcular promedio de calificaciones
      const grades = student.grades as GradeWithDetails[]
      const averageGrade = grades.length > 0 
        ? grades.reduce((sum: number, grade: GradeWithDetails) => sum + grade.score, 0) / grades.length 
        : 0

      // Calcular tasa de asistencia
      const attendances = student.attendances as AttendanceWithDetails[]
      const totalAttendances = attendances.length
      const presentAttendances = attendances.filter((att: AttendanceWithDetails) => att.status === 'PRESENT').length
      const attendanceRate = totalAttendances > 0 
        ? (presentAttendances / totalAttendances) * 100 
        : 100

      // Obtener clases del estudiante con este profesor
      const classes = student.classes.map((cs) => 
        `${cs.class.subject.name} ${student.academicGrade?.name || ''} ${student.academicSection?.name || ''}`
      )

      // Última actividad (última asistencia o calificación)
      const lastAttendance = attendances[0]
      const lastGrade = grades[0]
      let lastActivity = student.updatedAt

      if (lastAttendance && lastGrade) {
        lastActivity = lastAttendance.date > lastGrade.createdAt 
          ? lastAttendance.date 
          : lastGrade.createdAt
      } else if (lastAttendance) {
        lastActivity = lastAttendance.date
      } else if (lastGrade) {
        lastActivity = lastGrade.createdAt
      }

      return {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: '', // Los estudiantes no tienen email en este modelo
        grade: student.academicGrade?.name || '',
        section: student.academicSection?.name || '',
        classes,
        currentGrade: Number(averageGrade.toFixed(1)),
        attendanceRate: Number(attendanceRate.toFixed(0)),
        lastActivity: lastActivity.toISOString(),
        status: student.isActive ? 'active' : 'inactive',
        parentName: `${student.parent.firstName} ${student.parent.lastName}`,
        parentEmail: student.parent.user?.email || '',
        enrollmentDate: student.enrollmentDate.toISOString(),
        notes: '',
        behaviorScore: student.behaviorScore || 100,
        homeworkCompletion: 90 // Por defecto, esto podría calcularse desde tareas
      }
    })

    return NextResponse.json({
      students: processedStudents,
      total: processedStudents.length
    })

  } catch (error) {
    console.error('Error fetching teacher students:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}