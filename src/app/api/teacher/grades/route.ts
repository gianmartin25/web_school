import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/teacher/grades - Obtener calificaciones de una clase
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
    const academicPeriodId = searchParams.get('academicPeriodId')

    if (!classId || !academicPeriodId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: classId, academicPeriodId' },
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
            student: {
              include: {
                user: true
              }
            }
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

    // Obtener período académico
    const academicPeriod = await prisma.academicPeriod.findUnique({
      where: { id: academicPeriodId }
    })

    if (!academicPeriod) {
      return NextResponse.json({ error: 'Período académico no encontrado' }, { status: 404 })
    }

    // Obtener calificaciones existentes
    const existingGrades = await prisma.grade.findMany({
      where: {
        classId: classId,
        academicPeriodId: academicPeriodId,
        teacherId: teacherProfile.id
      },
      include: {
        student: true
      }
    })

    // Crear un mapa de calificaciones por estudiante
    const gradesMap = new Map(
      existingGrades.map(grade => [grade.studentId, grade])
    )

    // Construir respuesta con estudiantes y sus calificaciones
    const studentsWithGrades = classData.classStudents.map(classStudent => ({
      id: classStudent.student.id,
      studentId: classStudent.student.studentId,
      firstName: classStudent.student.firstName,
      lastName: classStudent.student.lastName,
      email: classStudent.student.user.email,
      grade: gradesMap.get(classStudent.student.id) || null
    }))

    return NextResponse.json({
      class: {
        id: classData.id,
        name: classData.name,
        subject: {
          id: classData.subject.id,
          name: classData.subject.name,
          code: classData.subject.code
        },
        grade: classData.grade?.name || '',
        section: classData.section?.name || '',
        academicYear: classData.academicYear
      },
      academicPeriod: {
        id: academicPeriod.id,
        name: academicPeriod.name,
        type: academicPeriod.type,
        minPassingGrade: academicPeriod.minPassingGrade,
        maxGrade: academicPeriod.maxGrade
      },
      students: studentsWithGrades,
      totalStudents: studentsWithGrades.length
    })

  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/teacher/grades - Crear o actualizar calificaciones
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Solo los profesores pueden registrar calificaciones' },
        { status: 403 }
      )
    }

    const { 
      classId, 
      academicPeriodId, 
      grades 
    }: {
      classId: string
      academicPeriodId: string
      grades: Array<{
        studentId: string
        score: number
        comments?: string
        gradeType: string
      }>
    } = await request.json()

    if (!classId || !academicPeriodId || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: classId, academicPeriodId, grades' },
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
        subject: true
      }
    })

    if (!classData) {
      return NextResponse.json(
        { error: 'Clase no encontrada o no tienes acceso a ella' },
        { status: 404 }
      )
    }

    // Obtener período académico para validaciones
    const academicPeriod = await prisma.academicPeriod.findUnique({
      where: { id: academicPeriodId }
    })

    if (!academicPeriod) {
      return NextResponse.json({ error: 'Período académico no encontrado' }, { status: 404 })
    }

    // Función para calcular letra de calificación y porcentaje
    const calculateGradeDetails = (score: number, maxScore: number = 20) => {
      const percentage = (score / maxScore) * 100
      let letterGrade = 'F'
      
      if (score >= 18) letterGrade = 'A'
      else if (score >= 15) letterGrade = 'B'
      else if (score >= 11) letterGrade = 'C'
      else if (score >= 0) letterGrade = 'D'

      return { percentage, letterGrade }
    }

    // Usar transacción para crear/actualizar todas las calificaciones
    const result = await prisma.$transaction(async (tx) => {
      const createdGrades = []

      for (const gradeData of grades) {
        // Validar que el score esté en el rango permitido
        if (gradeData.score < 0 || gradeData.score > academicPeriod.maxGrade) {
          throw new Error(
            `La calificación debe estar entre 0 y ${academicPeriod.maxGrade}`
          )
        }

        const { percentage, letterGrade } = calculateGradeDetails(
          gradeData.score,
          academicPeriod.maxGrade
        )

        // Buscar si ya existe una calificación para este estudiante
        const existingGrade = await tx.grade.findFirst({
          where: {
            studentId: gradeData.studentId,
            classId: classId,
            academicPeriodId: academicPeriodId,
            teacherId: teacherProfile.id,
            gradeType: gradeData.gradeType as 'FIRST_PERIOD' | 'SECOND_PERIOD' | 'THIRD_PERIOD' | 'FOURTH_PERIOD'
          }
        })

        if (existingGrade) {
          // Actualizar calificación existente
          const updated = await tx.grade.update({
            where: { id: existingGrade.id },
            data: {
              score: gradeData.score,
              percentage,
              letterGrade,
              comments: gradeData.comments || null,
              updatedAt: new Date()
            },
            include: {
              student: true
            }
          })
          createdGrades.push(updated)
        } else {
          // Crear nueva calificación
          const created = await tx.grade.create({
            data: {
              studentId: gradeData.studentId,
              subjectId: classData.subjectId,
              teacherId: teacherProfile.id,
              classId: classId,
              academicPeriodId: academicPeriodId,
              gradeType: gradeData.gradeType as 'FINAL' | 'MIDTERM' | 'QUIZ' | 'HOMEWORK' | 'PARTICIPATION' | 'PROJECT',
              score: gradeData.score,
              maxScore: academicPeriod.maxGrade,
              percentage,
              letterGrade,
              comments: gradeData.comments || null,
              term: academicPeriod.name
            },
            include: {
              student: true
            }
          })
          createdGrades.push(created)
        }
      }

      return createdGrades
    })

    // Calcular estadísticas
    const stats = {
      total: result.length,
      passing: result.filter(g => g.score >= academicPeriod.minPassingGrade).length,
      failing: result.filter(g => g.score < academicPeriod.minPassingGrade).length,
      average: result.reduce((sum, g) => sum + g.score, 0) / result.length
    }

    return NextResponse.json({
      message: 'Calificaciones registradas exitosamente',
      grades: result,
      stats
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating grades:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
