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

    // Solo administradores pueden ver configuración escolar
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    let schoolSettings = await prisma.schoolSettings.findFirst()

    // Si no existe configuración, crear una por defecto
    if (!schoolSettings) {
      schoolSettings = await prisma.schoolSettings.create({
        data: {
          schoolName: "Mi Escuela",
          schoolAddress: "",
          schoolPhone: "",
          schoolEmail: "",
          schoolWebsite: "",
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
          academicYearStart: new Date().getFullYear() + "-01-01",
          academicYearEnd: new Date().getFullYear() + "-12-31",
          gradeSystem: "numeric",
          maxGrade: 100,
          passingGrade: 60,
          attendanceRequired: 80,
          timezone: "America/Mexico_City",
          language: "es",
          enableNotifications: true,
          enableEmailNotifications: true,
          enableSMSNotifications: false,
          enableParentPortal: true,
          enableStudentPortal: true,
          enableOnlineGrades: true,
          enableAttendanceTracking: true,
          enableMessaging: true,
          autoBackup: false,
          backupFrequency: "weekly",
          dataRetentionDays: 365,
          maintenanceMode: false
        }
      })
    }

    return NextResponse.json(schoolSettings)
    
  } catch (error) {
    console.error("Error fetching school settings:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo administradores pueden modificar configuración escolar
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const data = await request.json()

    // Validaciones básicas
    if (data.maxGrade && data.maxGrade < 1) {
      return NextResponse.json({ error: "La calificación máxima debe ser mayor a 0" }, { status: 400 })
    }

    if (data.passingGrade && data.passingGrade < 1) {
      return NextResponse.json({ error: "La calificación mínima debe ser mayor a 0" }, { status: 400 })
    }

    if (data.attendanceRequired && (data.attendanceRequired < 0 || data.attendanceRequired > 100)) {
      return NextResponse.json({ error: "La asistencia requerida debe estar entre 0 y 100" }, { status: 400 })
    }

    let schoolSettings = await prisma.schoolSettings.findFirst()

    if (schoolSettings) {
      // Actualizar configuración existente
      schoolSettings = await prisma.schoolSettings.update({
        where: { id: schoolSettings.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } else {
      // Crear nueva configuración
      schoolSettings = await prisma.schoolSettings.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(schoolSettings)
    
  } catch (error) {
    console.error("Error updating school settings:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}