import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/student/grades - Obtener calificaciones del estudiante
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Solo los estudiantes pueden acceder a esta información' },
        { status: 403 }
      )
    }

    // Obtener perfil del estudiante
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true
      }
    })

    if (!studentProfile) {
      return NextResponse.json({ error: 'Perfil de estudiante no encontrado' }, { status: 404 })
    }

    // Obtener todas las calificaciones del estudiante
    const grades = await prisma.grade.findMany({
      where: {
        studentId: studentProfile.id
      },
      include: {
        subject: true,
        teacher: {
          include: {
            user: true
          }
        },
        class: {
          include: {
            grade: true,
            section: true
          }
        },
        academicPeriod: true
      },
      orderBy: [
        { academicPeriod: { order: 'desc' } },
        { subject: { name: 'asc' } }
      ]
    })

    // Agrupar calificaciones por período académico
    type GradesByPeriodType = Record<string, {
      period: typeof grades[0]['academicPeriod']
      subjects: Array<{
        subjectId: string
        subjectName: string
        subjectCode: string
        class: { id: string; name: string; grade: string; section: string } | null
        grades: Array<{
          id: string
          type: string
          score: number
          maxScore: number
          percentage: number | null
          letterGrade: string | null
          comments: string | null
          gradeDate: Date
          teacher: { id: string; name: string; email: string }
        }>
        average?: number
        isPassing?: boolean
      }>
      periodAverage?: number
    }>

    const gradesByPeriod = grades.reduce<GradesByPeriodType>((acc, grade) => {
      const periodId = grade.academicPeriod?.id || 'unknown'
      if (!acc[periodId]) {
        acc[periodId] = {
          period: grade.academicPeriod,
          subjects: []
        }
      }
      
      // Buscar si ya existe la materia en este período
      const existingSubject = acc[periodId].subjects.find(
        s => s.subjectId === grade.subjectId
      )
      
      if (existingSubject) {
        existingSubject.grades.push({
          id: grade.id,
          type: grade.gradeType,
          score: grade.score,
          maxScore: grade.maxScore,
          percentage: grade.percentage,
          letterGrade: grade.letterGrade,
          comments: grade.comments,
          gradeDate: grade.gradeDate,
          teacher: {
            id: grade.teacher.id,
            name: `${grade.teacher.firstName} ${grade.teacher.lastName}`,
            email: grade.teacher.user.email
          }
        })
      } else {
        acc[periodId].subjects.push({
          subjectId: grade.subjectId,
          subjectName: grade.subject.name,
          subjectCode: grade.subject.code,
          class: grade.class ? {
            id: grade.class.id,
            name: grade.class.name,
            grade: grade.class.grade?.name || '',
            section: grade.class.section?.name || ''
          } : null,
          grades: [{
            id: grade.id,
            type: grade.gradeType,
            score: grade.score,
            maxScore: grade.maxScore,
            percentage: grade.percentage,
            letterGrade: grade.letterGrade,
            comments: grade.comments,
            gradeDate: grade.gradeDate,
            teacher: {
              id: grade.teacher.id,
              name: `${grade.teacher.firstName} ${grade.teacher.lastName}`,
              email: grade.teacher.user.email
            }
          }]
        })
      }
      
      return acc
    }, {})

    // Calcular promedios por materia y período
    Object.keys(gradesByPeriod).forEach(periodId => {
      gradesByPeriod[periodId].subjects.forEach(subject => {
        const scores = subject.grades.map(g => g.score)
        subject.average = scores.reduce((a, b) => a + b, 0) / scores.length
        
        // Determinar si aprueba o no (nota mínima 11)
        const minPassingGrade = gradesByPeriod[periodId].period?.minPassingGrade || 11
        subject.isPassing = subject.average >= minPassingGrade
      })
      
      // Calcular promedio general del período
      const allScores = gradesByPeriod[periodId].subjects.flatMap(
        s => s.grades.map(g => g.score)
      )
      gradesByPeriod[periodId].periodAverage = allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0
    })

    // Convertir a array y ordenar por período
    const periodsArray = Object.values(gradesByPeriod).sort((a, b) => {
      return (b.period?.order || 0) - (a.period?.order || 0)
    })

    return NextResponse.json({
      student: {
        id: studentProfile.id,
        studentId: studentProfile.studentId,
        firstName: studentProfile.firstName,
        lastName: studentProfile.lastName,
        email: studentProfile.user.email
      },
      periods: periodsArray,
      totalGrades: grades.length
    })

  } catch (error) {
    console.error('Error fetching student grades:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
