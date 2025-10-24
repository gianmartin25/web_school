import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Definir tipos para los registros de asistencia
interface AttendanceRecord {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  notes?: string
}

// POST /api/teacher/attendance/bulk - Registrar asistencia masiva para una clase
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Solo los profesores pueden registrar asistencia' },
        { status: 403 }
      )
    }

    const { classId, date, attendanceRecords }: {
      classId: string
      date: string
      attendanceRecords: AttendanceRecord[]
    } = await request.json()

    if (!classId || !date || !Array.isArray(attendanceRecords)) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: classId, date, attendanceRecords' },
        { status: 400 }
      )
    }

    // Obtener perfil del profesor
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Perfil de profesor no encontrado' }, { status: 404 })
    }

    // Verificar que la clase pertenece al profesor
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacherProfile.id
      },
      include: {
        subject: true,
        grade: true,
        section: true,
        classStudents: {
          include: {
            student: true
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { error: 'Clase no encontrada o no tienes acceso a ella' },
        { status: 404 }
      )
    }

    const attendanceDate = new Date(date)
    const startOfDay = new Date(attendanceDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(attendanceDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Usar una transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Eliminar asistencias existentes para esta clase y fecha
      await tx.attendance.deleteMany({
        where: {
          classId: classId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })

      // Validar que todos los estudiantes pertenecen a la clase
      const studentIds = attendanceRecords.map((record) => record.studentId)
      const validStudents = await tx.studentProfile.findMany({
        where: {
          id: { in: studentIds },
          classes: {
            some: {
              classId: classId
            }
          }
        }
      })

      if (validStudents.length !== studentIds.length) {
        throw new Error('Algunos estudiantes no pertenecen a esta clase')
      }

      // Crear nuevos registros de asistencia
      const attendanceData = attendanceRecords.map((record) => ({
        studentId: record.studentId,
        classId: classId,
        teacherId: teacherProfile.id,
        date: attendanceDate,
        status: record.status,
        notes: record.notes || null
      }))

      const createdAttendances = await tx.attendance.createMany({
        data: attendanceData
      })

      // Obtener los registros creados con información completa
      const fullAttendances = await tx.attendance.findMany({
        where: {
          classId: classId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          student: true
        }
      })

      return {
        count: createdAttendances.count,
        attendances: fullAttendances
      }
    })

    // Calcular estadísticas
    const stats = {
      total: result.count,
      present: result.attendances.filter(a => a.status === 'PRESENT').length,
      absent: result.attendances.filter(a => a.status === 'ABSENT').length,
      late: result.attendances.filter(a => a.status === 'LATE').length,
      excused: result.attendances.filter(a => a.status === 'EXCUSED').length
    }

      return NextResponse.json({
      message: 'Asistencia registrada exitosamente',
      class: {
        id: classData.id,
        subject: classData.subject.name,
        grade: classData.grade?.name || '',
        section: classData.section?.name || ''
      },
      date: attendanceDate.toISOString().split('T')[0],
      stats,
      attendances: result.attendances
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating bulk attendance:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET /api/teacher/attendance/bulk - Obtener asistencia de una clase para una fecha
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

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const date = searchParams.get('date')

    if (!classId || !date) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: classId, date' },
        { status: 400 }
      )
    }

    // Obtener perfil del profesor
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Perfil de profesor no encontrado' }, { status: 404 })
    }

    // Verificar que la clase pertenece al profesor
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacherProfile.id
      },
      include: {
        subject: true,
        grade: true,
        section: true,
        classStudents: {
          include: {
            student: true
          },
          orderBy: {
            student: {
              lastName: 'asc'
            }
          }
        }
      }
    })

    if (!classData) {
      return NextResponse.json(
        { error: 'Clase no encontrada o no tienes acceso a ella' },
        { status: 404 }
      )
    }

    const attendanceDate = new Date(date)
    const startOfDay = new Date(attendanceDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(attendanceDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Obtener asistencias existentes
    const existingAttendances = await prisma.attendance.findMany({
      where: {
        classId: classId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        student: true
      }
    })

    // Crear mapa de asistencias por estudiante
    const attendanceMap = new Map()
    existingAttendances.forEach(attendance => {
      attendanceMap.set(attendance.studentId, attendance)
    })

    // Formatear respuesta con todos los estudiantes
    const studentsWithAttendance = classData.classStudents.map(classStudent => {
      const student = classStudent.student
      const attendance = attendanceMap.get(student.id)
      return {
        student: {
          id: student.id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName
        },
        attendance: attendance ? {
          id: attendance.id,
          status: attendance.status,
          notes: attendance.notes,
          createdAt: attendance.createdAt
        } : null
      }
    })

    return NextResponse.json({
      class: {
        id: classData.id,
        subject: classData.subject.name,
        grade: classData.grade?.name || '',
        section: classData.section?.name || ''
      },
      date: attendanceDate.toISOString().split('T')[0],
      students: studentsWithAttendance,
      hasAttendance: existingAttendances.length > 0
    })

  } catch (error) {
    console.error('Error fetching class attendance:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}