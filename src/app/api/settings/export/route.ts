import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo administradores pueden exportar datos
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener todos los datos del sistema (excluyendo contraseñas)
    const [
      users,
      teacherProfiles,
      parentProfiles,
      studentProfiles,
      students,
      subjects,
      classes,
      grades,
      attendance,
      messages,
      notifications
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.teacherProfile.findMany(),
      prisma.parentProfile.findMany(),
      prisma.studentProfile.findMany(),
      prisma.student.findMany(),
      prisma.subject.findMany(),
      prisma.class.findMany(),
      prisma.grade.findMany(),
      prisma.attendance.findMany(),
      prisma.message.findMany(),
      prisma.notification.findMany()
    ])

    // Obtener configuraciones por separado
    const schoolSettings = await prisma.schoolSettings.findMany()
    const userSettings = await prisma.userSettings.findMany()

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: session.user.email,
        version: "1.0",
        totalRecords: {
          users: users.length,
          teachers: teacherProfiles.length,
          parents: parentProfiles.length,
          studentProfiles: studentProfiles.length,
          students: students.length,
          subjects: subjects.length,
          classes: classes.length,
          grades: grades.length,
          attendance: attendance.length,
          messages: messages.length,
          notifications: notifications.length
        }
      },
      data: {
        users,
        teacherProfiles,
        parentProfiles,
        studentProfiles,
        students,
        subjects,
        classes,
        grades,
        attendance,
        messages,
        notifications,
        schoolSettings,
        userSettings
      }
    }

    const jsonData = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="school-data-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
    
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}