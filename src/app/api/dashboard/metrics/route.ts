import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role

    let metrics = {}

    switch (userRole) {
      case 'ADMIN':
        metrics = await getAdminMetrics()
        break
      case 'TEACHER':
        metrics = await getTeacherMetrics(session.user.id)
        break
      case 'PARENT':
        metrics = await getParentMetrics(session.user.id)
        break
      case 'STUDENT':
        metrics = await getStudentMetrics(session.user.id)
        break
      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 403 })
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function getAdminMetrics() {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalParents,
    totalClasses,
    totalSubjects,
    systemMetrics,
    recentActivity
  ] = await Promise.all([
    prisma.user.count(),
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
    prisma.parentProfile.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.systemMetrics.findFirst({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.message.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } }
      }
    })
  ])

  // Calcular métricas adicionales
  const totalGrades = await prisma.grade.count()
  const averageGrade = await prisma.grade.aggregate({
    _avg: { score: true }
  })

  const attendanceStats = await prisma.attendance.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  const attendanceRate = attendanceStats.reduce((acc, stat) => {
    if (stat.status === 'PRESENT') {
      acc.present = stat._count.status
    } else if (stat.status === 'ABSENT') {
      acc.absent = stat._count.status
    }
    return acc
  }, { present: 0, absent: 0 })

  const totalAttendanceRecords = attendanceRate.present + attendanceRate.absent
  const attendancePercentage = totalAttendanceRecords > 0 
    ? (attendanceRate.present / totalAttendanceRecords) * 100 
    : 0

  return {
    overview: {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      totalSubjects,
      totalGrades,
      averageGrade: averageGrade._avg.score || 0,
      attendanceRate: attendancePercentage,
    },
    systemMetrics: systemMetrics || {
      averageGrade: 0,
      averageAttendance: 0,
      systemUptime: 0,
    },
    recentActivity,
    trends: {
      studentsGrowth: '+5%', // Esto se puede calcular comparando con periodos anteriores
      teachersGrowth: '+2%',
      classesGrowth: '+8%',
      attendanceGrowth: '+3%',
    }
  }
}

async function getTeacherMetrics(userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      classes: {
        include: {
          classStudents: true,
          _count: { select: { classStudents: true } }
        }
      },
      subjects: true,
      grades: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { firstName: true, lastName: true } },
          subject: { select: { name: true } }
        }
      }
    }
  })

  if (!teacherProfile) {
    throw new Error('Teacher profile not found')
  }

  // Calcular métricas del profesor
  const totalStudents = teacherProfile.classes.reduce(
    (acc, cls) => acc + (cls._count?.classStudents || 0), 0
  )

  const averageGrade = teacherProfile.grades.length > 0
    ? teacherProfile.grades.reduce((acc, grade) => acc + grade.score, 0) / teacherProfile.grades.length
    : 0

  // Asistencia promedio de las clases del profesor
  const attendanceData = await prisma.attendance.findMany({
    where: { teacherId: teacherProfile.id },
    select: { status: true }
  })

  const presentCount = attendanceData.filter(a => a.status === 'PRESENT').length
  const attendanceRate = attendanceData.length > 0 
    ? (presentCount / attendanceData.length) * 100 
    : 0

  return {
    overview: {
      totalClasses: teacherProfile.classes.length,
      totalStudents,
      totalSubjects: teacherProfile.subjects.length,
      averageGrade: Number(averageGrade.toFixed(1)),
      attendanceRate: Number(attendanceRate.toFixed(1))
    },
    recentGrades: teacherProfile.grades,
    classes: teacherProfile.classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      studentsCount: cls._count?.classStudents || 0,
      schedule: 'Por definir' // Esto se puede obtener de la tabla Schedule
    })),
    performance: {
      studentsImproving: Math.floor(totalStudents * 0.75), // 75% mejorando
      studentsNeedHelp: Math.floor(totalStudents * 0.15), // 15% necesitan ayuda
      averageClassSize: Math.floor(totalStudents / (teacherProfile.classes.length || 1)),
    }
  }
}

async function getParentMetrics(userId: string) {
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId },
    include: {
      children: {
        include: {
          grades: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              subject: { select: { name: true } },
              class: { select: { name: true } }
            }
          },
          attendances: {
            take: 30,
            orderBy: { date: 'desc' }
          },
          grade: { select: { name: true, level: true } },
          section: { select: { name: true } }
        }
      }
    }
  })

  if (!parentProfile) {
    throw new Error('Parent profile not found')
  }

  const childrenMetrics = parentProfile.children.map(child => {
    // GPA del estudiante
    const gpa = child.grades.length > 0
      ? child.grades.reduce((acc, grade) => acc + grade.score, 0) / child.grades.length
      : 0

    // Porcentaje de asistencia
    const presentCount = child.attendances.filter(a => a.status === 'PRESENT').length
    const attendanceRate = child.attendances.length > 0
      ? (presentCount / child.attendances.length) * 100
      : 0

    return {
      id: child.id,
      name: `${child.firstName} ${child.lastName}`,
  grade: child.grade?.name || 'N/A',
  section: child.section?.name || 'N/A',
      gpa: Number(gpa.toFixed(1)),
      attendanceRate: Number(attendanceRate.toFixed(1)),
      currentGPA: child.currentGPA || gpa,
  attendanceRate: child.attendanceRate || attendanceRate,
      behaviorScore: child.behaviorScore,
      recentGrades: child.grades.slice(0, 5),
      upcomingEvents: [], // Esto se puede obtener de asignaciones próximas
    }
  })

  return {
    children: childrenMetrics,
    overview: {
      totalChildren: parentProfile.children.length,
      averageGPA: childrenMetrics.length > 0
        ? childrenMetrics.reduce((acc, child) => acc + child.gpa, 0) / childrenMetrics.length
        : 0,
      averageAttendance: childrenMetrics.length > 0
        ? childrenMetrics.reduce((acc, child) => acc + child.attendanceRate, 0) / childrenMetrics.length
        : 0,
    },
    notifications: [], // Esto se puede obtener de la tabla notifications
  }
}

async function getStudentMetrics(userId: string) {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      grades: {
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true } },
          academicPeriod: { select: { name: true, type: true } }
        }
      },
      attendances: {
        take: 30,
        orderBy: { date: 'desc' },
        include: {
          class: {
            include: {
              subject: { select: { name: true } }
            }
          }
        }
      },
      classStudents: {
        include: {
          class: {
            include: {
              subject: { select: { name: true } },
              teacher: {
                include: {
                  user: { select: { name: true } }
                }
              }
            }
          }
        }
      },
      grade: { select: { name: true, level: true } },
      section: { select: { name: true } }
    }
  })

  if (!studentProfile) {
    throw new Error('Student profile not found')
  }

  // GPA del estudiante
  const gpa = studentProfile.grades.length > 0
    ? studentProfile.grades.reduce((acc, grade) => acc + grade.score, 0) / studentProfile.grades.length
    : 0

  // Porcentaje de asistencia
  const presentCount = studentProfile.attendances.filter(a => a.status === 'PRESENT').length
  const attendanceRate = studentProfile.attendances.length > 0
    ? (presentCount / studentProfile.attendances.length) * 100
    : 0

  // Próximas asignaciones (esto se puede mejorar con la tabla assignments)
  const upcomingAssignments = await prisma.assignment.findMany({
    where: {
      class: {
        classStudents: {
          some: { studentId: studentProfile.id }
        }
      },
      dueDate: {
        gte: new Date()
      }
    },
    take: 5,
    orderBy: { dueDate: 'asc' },
    include: {
      class: {
        include: {
          subject: { select: { name: true } }
        }
      }
    }
  })

  return {
    overview: {
      gpa: Number(gpa.toFixed(1)),
      attendanceRate: Number(attendanceRate.toFixed(1)),
      behaviorScore: studentProfile.behaviorScore,
      currentGPA: studentProfile.currentGPA || gpa,
      attendanceRate: studentProfile.attendanceRate || attendanceRate,
      totalCredits: studentProfile.totalCredits,
      academicStatus: studentProfile.academicStatus,
    },
    academic: {
      grade: studentProfile.academicGrade?.name || 'N/A',
      section: studentProfile.academicSection?.name || 'N/A',
      totalClasses: studentProfile.classes.length,
    },
    recentGrades: studentProfile.grades.slice(0, 10),
    recentAttendance: studentProfile.attendances.slice(0, 10),
    upcomingAssignments,
    performance: {
      trend: gpa > 14 ? 'improving' : gpa > 12 ? 'stable' : 'needs_attention',
      strongSubjects: [], // Se puede calcular basado en las mejores calificaciones
      needsImprovement: [], // Se puede calcular basado en las calificaciones más bajas
    }
  }
}