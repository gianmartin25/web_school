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

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const subjectId = searchParams.get('subjectId')
    const classId = searchParams.get('classId')

    let grades: Array<{
      id: string
      score: number
      maxScore: number
      percentage: number | null
      letterGrade: string | null
      comments: string | null
      gradeDate: Date
      gradeType: string
      subject: { name: string }
      teacher: { user: { name: string | null, email: string } }
      student: { id: string, firstName: string, lastName: string }
      class: { id: string, name: string } | null
    }> = []

    if (session.user.role === 'PARENT') {
      // Parents can only see their children's grades
      const parentProfile = await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          children: {
            include: {
              grades: {
                where: {
                  ...(subjectId && { subjectId }),
                  ...(classId && { classId })
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
                  student: true,
                  class: true
                },
                orderBy: { gradeDate: 'desc' }
              }
            }
          }
        }
      })

      if (parentProfile) {
        grades = parentProfile.children.flatMap(child => child.grades)
      }
    } else if (session.user.role === 'STUDENT') {
      // Students can only see their own grades
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (studentProfile) {
        grades = await prisma.grade.findMany({
          where: {
            studentId: studentProfile.id,
            ...(subjectId && { subjectId }),
            ...(classId && { classId })
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
            student: true,
            class: true
          },
          orderBy: { gradeDate: 'desc' }
        })
      }
    } else if (session.user.role === 'TEACHER') {
      // Teachers can see grades for their students
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (teacherProfile) {
        grades = await prisma.grade.findMany({
          where: {
            teacherId: teacherProfile.id,
            ...(studentId && { studentId }),
            ...(subjectId && { subjectId }),
            ...(classId && { classId })
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
            student: true,
            class: true
          },
          orderBy: { gradeDate: 'desc' }
        })
      }
    } else if (session.user.role === 'ADMIN') {
      // Admins can see all grades
      grades = await prisma.grade.findMany({
        where: {
          ...(studentId && { studentId }),
          ...(subjectId && { subjectId }),
          ...(classId && { classId })
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
          student: true,
          class: true
        },
        orderBy: { gradeDate: 'desc' }
      })
    }

    return NextResponse.json({ grades })
  } catch (error) {
    console.error('Error fetching grades:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const {
      studentId,
      subjectId,
      classId,
      gradeType,
      score,
      maxScore = 100,
      comments,
      gradeDate,
      academicPeriodId
    } = body

    // Validate required fields
    if (!studentId || !subjectId || !gradeType || score === undefined || !academicPeriodId) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Calculate percentage
    const percentage = (score / maxScore) * 100

    // Determine letter grade
    let letterGrade = 'F'
    if (percentage >= 90) letterGrade = 'A'
    else if (percentage >= 80) letterGrade = 'B'
    else if (percentage >= 70) letterGrade = 'C'
    else if (percentage >= 60) letterGrade = 'D'

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        teacherId: teacherProfile.id,
        classId,
        academicPeriodId,
        gradeType,
        score,
        maxScore,
        percentage,
        letterGrade,
        comments,
        gradeDate: gradeDate ? new Date(gradeDate) : new Date()
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
        student: true,
        class: true
      }
    })

    return NextResponse.json({ grade }, { status: 201 })
  } catch (error) {
    console.error('Error creating grade:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const gradeId = searchParams.get('id')

    if (!gradeId) {
      return NextResponse.json({ error: "ID de calificación requerido" }, { status: 400 })
    }

    const body = await request.json()
    const {
      score,
      maxScore,
      comments,
      gradeDate
    } = body

    // Verify the grade belongs to this teacher
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId }
    })

    if (!existingGrade || existingGrade.teacherId !== teacherProfile.id) {
      return NextResponse.json({ error: "Calificación no encontrada o no autorizada" }, { status: 404 })
    }

    // Calculate new percentage if score or maxScore changed
    const newScore = score !== undefined ? score : existingGrade.score
    const newMaxScore = maxScore !== undefined ? maxScore : existingGrade.maxScore
    const percentage = (newScore / newMaxScore) * 100

    // Determine letter grade
    let letterGrade = 'F'
    if (percentage >= 90) letterGrade = 'A'
    else if (percentage >= 80) letterGrade = 'B'
    else if (percentage >= 70) letterGrade = 'C'
    else if (percentage >= 60) letterGrade = 'D'

    const updatedGrade = await prisma.grade.update({
      where: { id: gradeId },
      data: {
        ...(score !== undefined && { score }),
        ...(maxScore !== undefined && { maxScore }),
        percentage,
        letterGrade,
        ...(comments !== undefined && { comments }),
        ...(gradeDate && { gradeDate: new Date(gradeDate) })
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
        student: true,
        class: true
      }
    })

    return NextResponse.json({ grade: updatedGrade })
  } catch (error) {
    console.error('Error updating grade:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "Perfil de profesor no encontrado" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const gradeId = searchParams.get('id')

    if (!gradeId) {
      return NextResponse.json({ error: "ID de calificación requerido" }, { status: 400 })
    }

    // Verify the grade belongs to this teacher
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId }
    })

    if (!existingGrade || existingGrade.teacherId !== teacherProfile.id) {
      return NextResponse.json({ error: "Calificación no encontrada o no autorizada" }, { status: 404 })
    }

    await prisma.grade.delete({
      where: { id: gradeId }
    })

    return NextResponse.json({ message: "Calificación eliminada exitosamente" })
  } catch (error) {
    console.error('Error deleting grade:', error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}