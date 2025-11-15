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
  grade: true,
  section: true,
        classStudents: {
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
        },
        schedules: true
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
  grade: classItem.grade?.name || classItem.grade || 'No asignado',
  section: classItem.section?.name || classItem.section || 'No asignado',
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
        students: classItem.classStudents.map((cs: { student: { id: string, firstName: string, lastName: string, studentId: string, parent: { user: { email: string } } } }) => ({
          id: cs.student.id,
          name: `${cs.student.firstName} ${cs.student.lastName}`,
          email: cs.student.parent.user.email,
          studentId: cs.student.studentId
        })),
        stats: {
          studentCount: classItem.classStudents.length,
          averageGrade: Math.round(avgGrade * 100) / 100,
          attendanceRate: Math.round(attendanceRate * 100) / 100
        },
        schedules: classItem.schedules.map(s => ({
          id: s.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime instanceof Date ? s.startTime.toISOString().slice(11,16) : String(s.startTime),
          endTime: s.endTime instanceof Date ? s.endTime.toISOString().slice(11,16) : String(s.endTime),
          room: s.room,
          notes: s.notes
        })),
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

// PATCH /api/classes/[id] - Update a class (includes schedules)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
      isActive,
      schedules = []
    } = body

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        schedules: true
      }
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

    // Use transaction to update class and schedules
    const result = await prisma.$transaction(async (tx) => {
      // Update the class
      const updatedClass = await tx.class.update({
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
          grade: true,
          section: true,
          schedules: true,
          _count: {
            select: {
              classStudents: true
            }
          }
        }
      })

      // Update schedules if provided
      if (schedules.length >= 0) {
        // Delete existing schedules
        await tx.schedule.deleteMany({
          where: { classId: id }
        })

        // Create new schedules if any
        if (schedules.length > 0) {
          // Get academic period (assuming there's an active one)
          const activePeriod = await tx.academicPeriod.findFirst({
            where: { isActive: true },
            orderBy: { startDate: 'desc' }
          })

          if (!activePeriod) {
            throw new Error('No se encontró un período académico activo')
          }

          for (const schedule of schedules) {
            // Convert day of week string to proper format
            const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
            const dayIndex = parseInt(schedule.dayOfWeek) % 7
            const dayName = dayNames[dayIndex]

            // Create time strings using UTC to avoid timezone conversion issues
            // Use a fixed date (1970-01-01) since we only care about the time
            const startDateTime = new Date(`1970-01-01T${schedule.startTime}:00.000Z`)
            const endDateTime = new Date(`1970-01-01T${schedule.endTime}:00.000Z`)

            await tx.schedule.create({
              data: {
                classId: id,
                academicPeriodId: activePeriod.id,
                dayOfWeek: dayName,
                startTime: startDateTime,
                endTime: endDateTime,
                room: schedule.room || null,
                notes: null
              }
            })
          }
        }
      }

      return updatedClass
    })

    // Helper to format schedules
    const dayNames: Record<string, string> = { 
      'MONDAY': 'Lun', 
      'TUESDAY': 'Mar', 
      'WEDNESDAY': 'Mie', 
      'THURSDAY': 'Jue', 
      'FRIDAY': 'Vie', 
      'SATURDAY': 'Sab', 
      'SUNDAY': 'Dom' 
    }

    return NextResponse.json({
      class: {
        id: result.id,
        name: result.name,
        grade: result.grade?.name || result.grade || 'No asignado',
        section: result.section?.name || result.section || 'No asignado',
        capacity: result.maxStudents,
        currentStudents: result._count.classStudents,
        enrolledStudents: result._count.classStudents,
        maxStudents: result.maxStudents,
        academicYear: result.academicYear,
        isActive: result.isActive,
        subject: result.subject ? {
          id: result.subject.id,
          name: result.subject.name,
          code: result.subject.code
        } : null,
        subjectId: result.subjectId,
        teacher: result.teacher ? {
          id: result.teacher.id,
          name: result.teacher.user.name,
          email: result.teacher.user.email
        } : null,
        teacherId: result.teacherId,
        gradeId: result.gradeId,
        sectionId: result.sectionId,
        schedulesDisplay: (result.schedules || []).map(s => {
          const dayLabel = dayNames[s.dayOfWeek] || s.dayOfWeek
          const start = new Date(s.startTime).toISOString().slice(11,16)
          const end = new Date(s.endTime).toISOString().slice(11,16)
          return `${dayLabel} ${start}–${end}${s.room ? ` (${s.room})` : ''}`
        }),
        schedules: (result.schedules || []).map(s => ({
          dayOfWeek: s.dayOfWeek,
          startTime: new Date(s.startTime).toISOString().slice(11,16),
          endTime: new Date(s.endTime).toISOString().slice(11,16),
          room: s.room || ''
        })),
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
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
        grade: true,
        section: true
      }
    })

    return NextResponse.json({
      class: {
        id: updatedClass.id,
        name: updatedClass.name,
  grade: updatedClass.grade?.name || updatedClass.grade || 'No asignado',
  section: updatedClass.section?.name || updatedClass.section || 'No asignado',
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
            classStudents: true,
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
  if (existingClass._count.classStudents > 0 || existingClass._count.grades > 0 || existingClass._count.attendances > 0) {
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
