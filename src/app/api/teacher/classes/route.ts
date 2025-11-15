import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Obtener todas las clases del profesor
    const classes = await prisma.class.findMany({
      where: {
        teacherId: teacherProfile.id,
        isActive: true
      },
      include: {
        subject: true,
        teacher: true,
        classStudents: {
          include: {
            student: true
          }
        },
        grades: {
          include: {
            student: true
          }
        },
        attendances: {
          include: {
            student: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 30 // Últimas asistencias para calcular estadísticas
        },
        grade: true,
        section: true
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { grade: { name: 'asc' } }
      ]
    })

    // Procesar datos para el frontend - formato simplificado para el selector de calificaciones
    const simpleClasses = classes.map(classItem => ({
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
      totalStudents: classItem.classStudents?.length || 0
    }))

    // Procesar datos para el dashboard - formato completo
    const processedClasses = classes.map(classItem => {
      const enrolledStudents = classItem.classStudents?.length || 0
      const maxStudents = classItem.maxStudents
      
      // Calcular promedio de calificaciones de la clase
      const grades = classItem.grades || []
      const averageGrade = grades.length > 0 
        ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length 
        : 0

      // Calcular tasa de asistencia de la clase
      const totalAttendances = classItem.attendances?.length || 0
      const presentAttendances = (classItem.attendances || []).filter(att => att.status === 'PRESENT').length
      const attendanceRate = totalAttendances > 0 
        ? (presentAttendances / totalAttendances) * 100 
        : 100

      // Obtener próxima clase (simplificado - en la realidad necesitarías un sistema de horarios)
      const today = new Date()
      const nextClass = new Date(today)
      nextClass.setDate(today.getDate() + 1)
      nextClass.setHours(8, 0, 0, 0) // 8:00 AM por defecto

      return {
        id: classItem.id,
        name: classItem.name,
        subject: classItem.subject.name,
        grade: classItem.grade?.name || '',
        section: classItem.section?.name || '',
        enrolledStudents,
        maxStudents,
        schedule: 'Lunes, Miércoles, Viernes 8:00-9:00', // Simplificado
        room: 'Aula 101', // Simplificado - podrías agregar esto al modelo
        academicYear: classItem.academicYear,
        nextClass: nextClass.toISOString(),
        attendanceRate: Number(attendanceRate.toFixed(0)),
        averageGrade: Number(averageGrade.toFixed(1)),
        status: classItem.isActive ? 'active' : 'inactive'
      }
    })

    // Obtener próximas clases para hoy y mañana (simplificado)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const upcomingClasses = processedClasses.slice(0, 3).map((classItem, index) => ({
      className: `${classItem.subject} ${classItem.grade} ${classItem.section}`,
      time: index === 0 ? '14:00 - 15:00' : '08:00 - 09:00',
      room: `Aula ${101 + index}`,
      date: index === 0 ? 'Hoy' : 'Mañana',
      topic: index === 0 ? 'Fracciones equivalentes' : 'Ecuaciones lineales'
    }))

    return NextResponse.json({
      classes: simpleClasses, // Formato simplificado para selectores
      detailedClasses: processedClasses, // Formato completo para dashboard
      upcomingClasses,
      total: simpleClasses.length
    })

  } catch (error) {
    console.error('Error fetching teacher classes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}