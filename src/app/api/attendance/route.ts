import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let attendanceRecords: any[] = []

    if (session.user.role === 'PARENT') {
      // Parents can only see their children's attendance
      const parentProfile = await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          children: {
            include: {
              attendances: {
                include: {
                  class: {
                    include: {
                      subject: true
                    }
                  },
                  teacher: true,
                  student: true
                },
                orderBy: { date: 'desc' }
              }
            }
          }
        }
      })

      if (!parentProfile) {
        return NextResponse.json({ error: "Parent profile not found" }, { status: 404 })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attendanceRecords = parentProfile.children.flatMap((child: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        child.attendances.map((attendance: any) => ({
          id: attendance.id,
          date: attendance.date,
          status: attendance.status,
          notes: attendance.notes,
          student: {
            id: attendance.student.id,
            studentId: attendance.student.studentId,
            firstName: attendance.student.firstName,
            lastName: attendance.student.lastName,
            grade: attendance.student.grade,
            section: attendance.student.section
          },
          class: {
            id: attendance.class.id,
            subject: {
              name: attendance.class.subject.name,
              code: attendance.class.subject.code
            }
          },
          teacher: {
            id: attendance.teacher.id,
            firstName: attendance.teacher.firstName,
            lastName: attendance.teacher.lastName
          }
        }))
      )
    } else if (session.user.role === 'TEACHER') {
      // Teachers can see attendance for their students
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!teacherProfile) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
      }

      const attendanceData = await prisma.attendance.findMany({
        where: {
          teacherId: teacherProfile.id
        },
        include: {
          class: {
            include: {
              subject: true
            }
          },
          teacher: true,
          student: true
        },
        orderBy: { date: 'desc' }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attendanceRecords = attendanceData.map((attendance: any) => ({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes,
        student: {
          id: attendance.student.id,
          studentId: attendance.student.studentId,
          firstName: attendance.student.firstName,
          lastName: attendance.student.lastName,
          grade: attendance.student.grade,
          section: attendance.student.section
        },
        class: {
          id: attendance.class.id,
          subject: {
            name: attendance.class.subject.name,
            code: attendance.class.subject.code
          }
        },
        teacher: {
          id: attendance.teacher.id,
          firstName: attendance.teacher.firstName,
          lastName: attendance.teacher.lastName
        }
      }))
    } else if (session.user.role === 'ADMIN') {
      // Admins can see all attendance records
      const attendanceData = await prisma.attendance.findMany({
        include: {
          class: {
            include: {
              subject: true
            }
          },
          teacher: true,
          student: true
        },
        orderBy: { date: 'desc' }
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attendanceRecords = attendanceData.map((attendance: any) => ({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes,
        student: {
          id: attendance.student.id,
          studentId: attendance.student.studentId,
          firstName: attendance.student.firstName,
          lastName: attendance.student.lastName,
          grade: attendance.student.grade,
          section: attendance.student.section
        },
        class: {
          id: attendance.class.id,
          subject: {
            name: attendance.class.subject.name,
            code: attendance.class.subject.code
          }
        },
        teacher: {
          id: attendance.teacher.id,
          firstName: attendance.teacher.firstName,
          lastName: attendance.teacher.lastName
        }
      }))
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Calculate statistics
    const stats = {
      totalDays: attendanceRecords.length,
      presentDays: attendanceRecords.filter(r => r.status === 'PRESENT').length,
      absentDays: attendanceRecords.filter(r => r.status === 'ABSENT').length,
      lateDays: attendanceRecords.filter(r => r.status === 'LATE').length,
      excusedDays: attendanceRecords.filter(r => r.status === 'EXCUSED').length,
      attendanceRate: attendanceRecords.length > 0 ? 
        (attendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length / attendanceRecords.length) * 100 : 0
    }

    return NextResponse.json({ records: attendanceRecords, stats })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only teachers and admins can create attendance records
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      studentId,
      classId,
      status,
      date,
      notes
    } = body

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        classId,
        teacherId: teacherProfile.id,
        status,
        date: new Date(date),
        notes
      },
      include: {
        class: {
          include: {
            subject: true
          }
        },
        teacher: true,
        student: true
      }
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error("Error creating attendance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}