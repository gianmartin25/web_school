import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    interface ClassWithDetails {
      id: string
      name: string
      academicYear: string
      maxStudents: number
      isActive: boolean
      createdAt: Date
      subject?: { id: string, name: string, code: string } | null
      teacher?: { 
        id: string, 
        firstName: string, 
        lastName: string, 
        user?: { name: string | null, email: string } | null
      } | null
      schedules?: { id: string, dayOfWeek: string, startTime: Date, endTime: Date, room?: string | null, notes?: string | null }[]
      grade?: { name: string } | null
      section?: { name: string } | null
      _count?: { classStudents: number }
    }

    let classes: ClassWithDetails[] = []

    if (session.user.role === 'TEACHER') {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!teacherProfile) {
        return NextResponse.json({ error: 'Perfil de profesor no encontrado' }, { status: 404 })
      }

      classes = await prisma.class.findMany({
        where: {
          teacherId: teacherProfile.id
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
            schedules: true,
            grade: true,
            section: true,
            _count: {
              select: {
                classStudents: true
              }
            }
          },
        orderBy: {
          name: 'asc'
        }
  })
    } else if (session.user.role === 'ADMIN') {
      // Admins can see all classes
      classes = await prisma.class.findMany({
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
            schedules: true,
            grade: true,
            section: true,
            _count: {
              select: {
                classStudents: true
              }
            }
          },
        orderBy: {
          name: 'asc'
        }
  })
    }

    // Helper to format schedules
    const dayNames: Record<string, string> = { 
      'MONDAY': 'Lun', 
      'TUESDAY': 'Mar', 
      'WEDNESDAY': 'Mie', 
      'THURSDAY': 'Jue', 
      'FRIDAY': 'Vie', 
      'SATURDAY': 'Sab', 
      'SUNDAY': 'Dom',
      // También soportar números por si acaso
      '1': 'Lun', 
      '2': 'Mar', 
      '3': 'Mie', 
      '4': 'Jue', 
      '5': 'Vie', 
      '6': 'Sab', 
      '7': 'Dom', 
      '0': 'Dom' 
    }

    // Transform the data for frontend
    const formattedClasses = classes.map((classItem: ClassWithDetails) => ({
      id: classItem.id,
      name: classItem.name,
      subject: {
        id: classItem.subject?.id || null,
        name: classItem.subject?.name || '',
        code: classItem.subject?.code || ''
      },
      teacher: {
        id: classItem.teacher?.id || null,
        firstName: classItem.teacher?.firstName || '',
        lastName: classItem.teacher?.lastName || '',
        email: classItem.teacher?.user?.email || ''
      },
  grade: classItem.grade?.name || 'No asignado',
  section: classItem.section?.name || 'No asignado',
      academicYear: classItem.academicYear,
      maxStudents: classItem.maxStudents,
  enrolledStudents: classItem._count?.classStudents || 0,
  schedulesDisplay: (classItem.schedules || []).map(s => {
    const dayLabel = dayNames[s.dayOfWeek] || s.dayOfWeek
    const start = new Date(s.startTime).toISOString().slice(11,16)
    const end = new Date(s.endTime).toISOString().slice(11,16)
    return `${dayLabel} ${start}–${end}${s.room ? ` (${s.room})` : ''}`
  }),
  schedules: (classItem.schedules || []).map(s => ({
    dayOfWeek: s.dayOfWeek,
    startTime: new Date(s.startTime).toISOString().slice(11,16),
    endTime: new Date(s.endTime).toISOString().slice(11,16),
    room: s.room || ''
  })),
      isActive: classItem.isActive,
      createdAt: classItem.createdAt
    }))

    return NextResponse.json({ 
      classes: formattedClasses,
      total: formattedClasses.length 
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json();
    const {
      name,
      subjectId,
      teacherId,
      gradeId,
      sectionId,
      academicYear,
      maxStudents = 30
    } = body;
    const schedulesFromBody: Array<{ dayOfWeek: string, startTime: string, endTime: string, room?: string | null }> = body.schedules || [];

    if (!name || !subjectId || !teacherId || !gradeId || !sectionId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, subjectId, teacherId, gradeId, sectionId' },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: teacherId } });
    if (!teacher) {
      return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 });
    }

    // Validar grado y sección activos
    const gradeObj = await prisma.academicGrade.findUnique({ where: { id: gradeId } });
    if (!gradeObj || !gradeObj.isActive) {
      return NextResponse.json({ error: 'El grado seleccionado está inactivo o no existe.' }, { status: 400 });
    }
    const sectionObj = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!sectionObj || !sectionObj.isActive) {
      return NextResponse.json({ error: 'La sección seleccionada está inactiva o no existe.' }, { status: 400 });
    }

        // find current academic period for schedules (if any)
        const currentPeriod = await prisma.academicPeriod.findFirst({ where: { isCurrent: true } })
        const academicPeriodId = currentPeriod?.id

        const newClass = await prisma.class.create({
          data: {
            name,
            subjectId,
            teacherId,
            gradeId,
            sectionId,
            academicYear: academicYear || new Date().getFullYear().toString(),
            maxStudents,
            // if schedules provided and we have an academic period, create them
            ...(schedulesFromBody.length > 0 && academicPeriodId ? {
              schedules: {
                create: schedulesFromBody.map(s => ({
                  academicPeriodId,
                  dayOfWeek: s.dayOfWeek,
                  // Use fixed date (1970-01-01) with UTC to avoid timezone conversion issues
                  startTime: new Date(`1970-01-01T${s.startTime}:00.000Z`),
                  endTime: new Date(`1970-01-01T${s.endTime}:00.000Z`),
                  room: s.room || null
                }))
              }
            } : {})
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
        });

        const formattedClass = {
          id: newClass.id,
          name: newClass.name,
          subject: {
            id: newClass.subject.id,
            name: newClass.subject.name,
            code: newClass.subject.code
          },
          teacher: {
            id: newClass.teacher.id,
            firstName: newClass.teacher.firstName,
            lastName: newClass.teacher.lastName,
            email: newClass.teacher.user.email
          },
          grade: newClass.grade?.name || '',
          section: newClass.section?.name || '',
          academicYear: newClass.academicYear,
          maxStudents: newClass.maxStudents,
      enrolledStudents: newClass._count.classStudents,
      schedules: (newClass.schedules || []).map(s => {
        const dayNames: Record<string, string> = { '1': 'Lun', '2': 'Mar', '3': 'Mie', '4': 'Jue', '5': 'Vie', '6': 'Sab', '7': 'Dom', '0': 'Dom' }
        const dayLabel = dayNames[s.dayOfWeek] || s.dayOfWeek
        const start = new Date(s.startTime).toISOString().slice(11,16)
        const end = new Date(s.endTime).toISOString().slice(11,16)
        return `${dayLabel} ${start}–${end}${s.room ? ` (${s.room})` : ''}`
      }),
          isActive: newClass.isActive,
          createdAt: newClass.createdAt
        };

    return NextResponse.json({ class: formattedClass }, { status: 201 });
  } catch (error) {
    // Improved logging for debugging create failures
    console.error('Error creating class:', error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error);

    // If possible, return the underlying error message to the frontend to aid debugging
    const message = error instanceof Error ? error.message : 'Error interno del servidor';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}