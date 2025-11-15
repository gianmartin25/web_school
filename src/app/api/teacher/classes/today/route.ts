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
    // Agregar 'T00:00:00' para evitar problemas de zona horaria
    const targetDate = dateParam ? new Date(dateParam + 'T00:00:00') : new Date()
    const dayOfWeek = targetDate.getDay() // 0 = Domingo, 1 = Lunes, etc.
    
    // Mapear días de la semana
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const currentDay = dayNames[dayOfWeek]

    console.log('Date requested:', dateParam)
    console.log('Target date:', targetDate)
    console.log('Day of week:', dayOfWeek, currentDay)

    // Obtener clases del profesor 
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId: teacherProfile.id,
        isActive: true
      },
      include: {
        subject: true,
        grade: true,
        section: true,
        schedules: {
          where: {
            dayOfWeek: currentDay
          },
          orderBy: {
            startTime: 'asc'
          }
        },
        classStudents: {
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
            classStudents: true
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

    console.log('Total classes found:', teacherClasses.length)
    console.log('Classes with schedules for', currentDay, ':', teacherClasses.filter(c => c.schedules.length > 0).length)

    // Formatear las clases con información adicional
    const formattedClasses = teacherClasses
      .filter(classItem => classItem.schedules.length > 0) // Solo clases que tienen horario hoy
      .map(classItem => {
        // Verificar si ya se registró asistencia para esta clase hoy
        const hasAttendanceToday = existingAttendances.some(
          attendance => attendance.classId === classItem.id
        )

        const schedule = classItem.schedules[0] // Ya está filtrado por dayOfWeek y ordenado

        return {
          id: classItem.id,
          name: classItem.name,
          subject: {
            id: classItem.subject.id,
            name: classItem.subject.name,
            code: classItem.subject.code
          },
          grade: classItem.grade?.name || '',
          section: classItem.section?.name || '',
          academicYear: classItem.academicYear,
          schedule: {
            startTime: schedule.startTime.toISOString(),
            endTime: schedule.endTime.toISOString(),
            room: schedule.room || null,
            dayOfWeek: schedule.dayOfWeek
          },
          students: classItem.classStudents.map(classStudent => ({
            id: classStudent.student.id,
            studentId: classStudent.student.studentId,
            firstName: classStudent.student.firstName,
            lastName: classStudent.student.lastName
          })),
          totalStudents: classItem._count.classStudents,
          hasAttendanceToday,
          attendanceCount: existingAttendances.filter(a => a.classId === classItem.id).length
        }
      })
      .sort((a, b) => new Date(a.schedule.startTime).getTime() - new Date(b.schedule.startTime).getTime())

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