import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/classes/[id] - Get a specific class
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const classItem = await prisma.class.findUnique({
      where: { id },
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
        academicGrade: true,
        academicSection: true,
        students: {
          include: {
            student: {
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
                }
              }
            }
          }
        },
        grades: {
          include: {
            student: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attendances: {
          include: {
            student: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    })

    if (!classItem) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === 'TEACHER') {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })
      
      if (!teacherProfile || classItem.teacherId !== teacherProfile.id) {
        return NextResponse.json(
          { error: 'No tienes permisos para acceder a esta clase' },
          { status: 403 }
        )
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      )
    }

    // Calculate average grade and attendance rate
    const avgGrade = classItem.grades.length > 0 
      ? classItem.grades.reduce((sum: number, grade: { score: number }) => sum + grade.score, 0) / classItem.grades.length
      : 0

    const totalAttendance = classItem.attendances.length
    const presentCount = classItem.attendances.filter((att: { status: string }) => att.status === 'PRESENT').length
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0

    return NextResponse.json({
      class: {
        id: classItem.id,
        name: classItem.name,
        grade: classItem.academicGrade?.name || classItem.grade || 'No asignado',
        section: classItem.academicSection?.name || classItem.section || 'No asignado',
        capacity: classItem.maxStudents,
        isActive: classItem.isActive,
        academicYear: classItem.academicYear,
        subject: {
          id: classItem.subject.id,
          name: classItem.subject.name,
          code: classItem.subject.code
        },
        teacher: classItem.teacher ? {
          id: classItem.teacher.id,
          name: classItem.teacher.user.name,
          email: classItem.teacher.user.email
        } : null,
        students: classItem.students.map((cs: { student: { id: string, firstName: string, lastName: string, studentId: string, parent: { user: { email: string } } } }) => ({
          id: cs.student.id,
          name: `${cs.student.firstName} ${cs.student.lastName}`,
          email: cs.student.parent.user.email,
          studentId: cs.student.studentId
        })),
        stats: {
          studentCount: classItem.students.length,
          averageGrade: Math.round(avgGrade * 100) / 100,
          attendanceRate: Math.round(attendanceRate * 100) / 100
        },
        createdAt: classItem.createdAt,
        updatedAt: classItem.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/classes/[id] - Update a class
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para editar clases' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { 
      name, 
      subjectId, 
      teacherId, 
      gradeId,
      sectionId, 
      maxStudents, 
      academicYear,
      isActive 
    } = body

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id }
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
    }

    // Validate teacher if provided
    if (teacherId) {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: teacherId }
      })
      if (!teacher) {
        return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 })
      }
    }

    // Validate subject if provided
    if (subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId }
      })
      if (!subject) {
        return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })
      }
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subjectId && { subjectId }),
        ...(teacherId && { teacherId }),
        ...(gradeId && { gradeId }),
        ...(sectionId && { sectionId }),
        ...(maxStudents !== undefined && { maxStudents }),
        ...(academicYear && { academicYear }),
        ...(isActive !== undefined && { isActive })
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
        academicGrade: true,
        academicSection: true
      }
    })

    return NextResponse.json({
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
        grade: updatedClass.academicGrade?.name || updatedClass.grade || 'No asignado',
        section: updatedClass.academicSection?.name || updatedClass.section || 'No asignado',
        capacity: updatedClass.maxStudents,
        academicYear: updatedClass.academicYear,
        isActive: updatedClass.isActive,
        subject: {
          id: updatedClass.subject.id,
          name: updatedClass.subject.name,
          code: updatedClass.subject.code
        },
        teacher: updatedClass.teacher ? {
          id: updatedClass.teacher.id,
          name: updatedClass.teacher.user.name,
          email: updatedClass.teacher.user.email
        } : null,
        createdAt: updatedClass.createdAt,
        updatedAt: updatedClass.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/classes/[id] - Delete a class
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar clases' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            grades: true,
            attendances: true
          }
        }
      }
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
    }

    // Check if class has students, grades, or attendance records
    if (existingClass._count.students > 0 || existingClass._count.grades > 0 || existingClass._count.attendances > 0) {
      // Instead of deleting, mark as inactive
      await prisma.class.update({
        where: { id },
        data: { isActive: false }
      })

      return NextResponse.json({
        message: 'La clase tiene datos asociados y ha sido marcada como inactiva en lugar de eliminada'
      })
    } else {
      // Safe to delete if no associated data
      await prisma.class.delete({
        where: { id }
      })

      return NextResponse.json({
        message: 'Clase eliminada exitosamente'
      })
    }

  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
