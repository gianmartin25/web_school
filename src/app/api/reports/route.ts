import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo administradores y profesores pueden ver reportes
    if (session.user.role === "PARENT") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const gradeFilter = searchParams.get("grade")
    const subjectFilter = searchParams.get("subject")

    // Construir filtros de fecha
    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {}
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {}
      if (dateFrom) dateFilter.createdAt.gte = new Date(dateFrom)
      if (dateTo) dateFilter.createdAt.lte = new Date(dateTo)
    }

    // Obtener estadísticas generales
    const [totalStudents, totalTeachers, totalSubjects, totalClasses, totalMessages] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.subject.count(),
      prisma.class.count(),
      prisma.message.count()
    ])

    // Calcular promedio general y tasa de asistencia
    const gradesData = await prisma.grade.findMany({
      where: {
        ...dateFilter,
        ...(gradeFilter && gradeFilter !== "all" && { student: { gradeId: gradeFilter } }),
        ...(subjectFilter && subjectFilter !== "all" && { subjectId: subjectFilter })
      },
      include: {
        student: true,
        subject: true
      }
    })

    const attendanceData = await prisma.attendance.findMany({
      where: {
        ...dateFilter,
        ...(gradeFilter && gradeFilter !== "all" && { student: { grade: gradeFilter } })
      },
      include: {
        student: true
      }
    })

    const averageGrade = gradesData.length > 0 
      ? gradesData.reduce((sum, grade) => sum + grade.score, 0) / gradesData.length 
      : 0

    const attendanceRate = attendanceData.length > 0
      ? (attendanceData.filter(a => a.status === "PRESENT").length / attendanceData.length) * 100
      : 0

    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      }
    })

    // Datos académicos
    const academicPerformance = {
      byGrade: [] as Array<{
        grade: string
        average: number
        total: number
        subjects: Array<{
          name: string
          average: number
        }>
      }>,
      bySubject: [] as Array<{
        subject: string
        average: number
        total: number
        grades: Array<{
          grade: string
          count: number
        }>
      }>,
      trends: [] as Array<{
        month: string
        average: number
        students: number
      }>
    }

    // Rendimiento por grado
    const gradeGroups = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
    for (const grade of gradeGroups) {
      const gradeData = gradesData.filter(g => g.student.grade === grade)
      if (gradeData.length > 0) {
        const gradeAverage = gradeData.reduce((sum, g) => sum + g.score, 0) / gradeData.length
        
        // Promedio por materia para este grado
        const subjectGroups = new Map()
        gradeData.forEach(g => {
          if (!subjectGroups.has(g.subject.name)) {
            subjectGroups.set(g.subject.name, [])
          }
          subjectGroups.get(g.subject.name).push(g.score)
        })

        const subjects = Array.from(subjectGroups.entries()).map(([name, values]) => ({
          name,
          average: values.reduce((sum: number, val: number) => sum + val, 0) / values.length
        }))

        academicPerformance.byGrade.push({
          grade: `Grado ${grade}`,
          average: Math.round(gradeAverage * 10) / 10,
          total: gradeData.length,
          subjects
        })
      }
    }

    // Rendimiento por materia
    const subjectGroups = new Map()
    gradesData.forEach(g => {
      if (!subjectGroups.has(g.subject.name)) {
        subjectGroups.set(g.subject.name, [])
      }
      subjectGroups.get(g.subject.name).push(g)
    })

    academicPerformance.bySubject = Array.from(subjectGroups.entries()).map(([subject, gradesList]) => {
      const grades = gradesList as typeof gradesData
      const average = grades.reduce((sum: number, g) => sum + g.score, 0) / grades.length
      
      // Distribución por grado
      const gradeDistribution = new Map()
      grades.forEach((g) => {
        const grade = g.student.grade
        gradeDistribution.set(grade, (gradeDistribution.get(grade) || 0) + 1)
      })

      return {
        subject,
        average: Math.round(average * 10) / 10,
        total: grades.length,
        grades: Array.from(gradeDistribution.entries()).map(([grade, count]) => ({
          grade: `Grado ${grade}`,
          count
        }))
      }
    })

    // Tendencias (últimos 6 meses)
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                       "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.getMonth()
      const year = date.getFullYear()
      
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0)
      
      const monthGrades = gradesData.filter(g => {
        const gradeDate = new Date(g.createdAt)
        return gradeDate >= monthStart && gradeDate <= monthEnd
      })
      
      const monthAverage = monthGrades.length > 0
        ? monthGrades.reduce((sum, g) => sum + g.score, 0) / monthGrades.length
        : 0
      
      const uniqueStudents = new Set(monthGrades.map(g => g.studentId)).size

      academicPerformance.trends.push({
        month: monthNames[month],
        average: Math.round(monthAverage * 10) / 10,
        students: uniqueStudents
      })
    }

    // Datos de asistencia
    const attendance = {
      overall: {
        present: attendanceData.filter(a => a.status === "PRESENT").length,
        absent: attendanceData.filter(a => a.status === "ABSENT").length,
        late: attendanceData.filter(a => a.status === "LATE").length,
        totalRecords: attendanceData.length
      },
      byGrade: [] as Array<{
        grade: string
        present: number
        absent: number
        late: number
        percentage: number
      }>,
      trends: [] as Array<{
        month: string
        percentage: number
        total: number
      }>
    }

    // Asistencia por grado
    for (const grade of gradeGroups) {
      const gradeAttendance = attendanceData.filter(a => a.student.grade === grade)
      if (gradeAttendance.length > 0) {
        const present = gradeAttendance.filter(a => a.status === "PRESENT").length
        const absent = gradeAttendance.filter(a => a.status === "ABSENT").length
        const late = gradeAttendance.filter(a => a.status === "LATE").length
        const percentage = (present / gradeAttendance.length) * 100

        attendance.byGrade.push({
          grade: `Grado ${grade}`,
          present,
          absent,
          late,
          percentage: Math.round(percentage * 10) / 10
        })
      }
    }

    // Tendencias de asistencia
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.getMonth()
      const year = date.getFullYear()
      
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0)
      
      const monthAttendance = attendanceData.filter(a => {
        const attendanceDate = new Date(a.date)
        return attendanceDate >= monthStart && attendanceDate <= monthEnd
      })
      
      const monthPresent = monthAttendance.filter(a => a.status === "PRESENT").length
      const monthPercentage = monthAttendance.length > 0
        ? (monthPresent / monthAttendance.length) * 100
        : 0

      attendance.trends.push({
        month: monthNames[month],
        percentage: Math.round(monthPercentage * 10) / 10,
        total: monthAttendance.length
      })
    }

    const reportData = {
      academicPerformance,
      attendance,
      statistics: {
        totalStudents,
        totalTeachers,
        totalSubjects,
        totalClasses,
        averageGrade: Math.round(averageGrade * 10) / 10,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
        activeUsers,
        totalMessages
      }
    }

    return NextResponse.json(reportData)
    
  } catch (error) {
    console.error("Error generating reports:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}