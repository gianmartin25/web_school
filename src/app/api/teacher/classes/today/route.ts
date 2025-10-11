import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/teacher/classes/today - Obtener clases del día del profesor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Solo los profesores pueden acceder a esta información' },
        { status: 403 }
      )
    }

    // Obtener perfil del profesor
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Perfil de profesor no encontrado' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    // Usar la fecha proporcionada o la fecha actual
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    const dayOfWeek = targetDate.getDay() // 0 = Domingo, 1 = Lunes, etc.
    
    // Mapear días de la semana
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const currentDay = dayNames[dayOfWeek]

    // Obtener clases del profesor 
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId: teacherProfile.id,
        isActive: true
      },
      include: {
        subject: true,
        academicGrade: true,
        academicSection: true,
        students: {
          include: {
            student: true
          },
          orderBy: {
            student: {
              lastName: 'asc'
            }
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    // Obtener asistencias ya registradas para hoy
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAttendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        class: {
          teacherId: teacherProfile.id
        }
      },
      include: {
        student: true,
        class: true
      }
    })

    // Formatear las clases con información adicional
    const formattedClasses = teacherClasses.map(classItem => {
      // Verificar si ya se registró asistencia para esta clase hoy
      const hasAttendanceToday = existingAttendances.some(
        attendance => attendance.classId === classItem.id
      )

      return {
        id: classItem.id,
        name: classItem.name,
        subject: {
          id: classItem.subject.id,
          name: classItem.subject.name,
          code: classItem.subject.code
        },
        grade: classItem.academicGrade?.name || classItem.grade,
        section: classItem.academicSection?.name || classItem.section,
        academicYear: classItem.academicYear,
        students: classItem.students.map(classStudent => ({
          id: classStudent.student.id,
          studentId: classStudent.student.studentId,
          firstName: classStudent.student.firstName,
          lastName: classStudent.student.lastName
        })),
        totalStudents: classItem._count.students,
        hasAttendanceToday,
        attendanceCount: existingAttendances.filter(a => a.classId === classItem.id).length
      }
    })

    return NextResponse.json({
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek: currentDay,
      classes: formattedClasses,
      totalClasses: formattedClasses.length,
      classesWithAttendance: formattedClasses.filter(c => c.hasAttendanceToday).length
    })

  } catch (error) {
    console.error('Error fetching today classes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}