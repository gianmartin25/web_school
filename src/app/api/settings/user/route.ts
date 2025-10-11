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

    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    })

    // Si no existe configuración, crear una por defecto
    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          theme: "light",
          language: "es",
          timezone: "America/Mexico_City",
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          digestFrequency: "weekly",
          showFullName: true,
          showEmail: false,
          showPhone: false,
          twoFactorEnabled: false
        }
      })
    }

    return NextResponse.json(userSettings)
    
  } catch (error) {
    console.error("Error fetching user settings:", error)
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

    const data = await request.json()

    // Validaciones básicas
    const allowedThemes = ["light", "dark", "auto"]
    if (data.theme && !allowedThemes.includes(data.theme)) {
      return NextResponse.json({ error: "Tema no válido" }, { status: 400 })
    }

    const allowedLanguages = ["es", "en"]
    if (data.language && !allowedLanguages.includes(data.language)) {
      return NextResponse.json({ error: "Idioma no válido" }, { status: 400 })
    }

    const allowedFrequencies = ["daily", "weekly", "monthly", "never"]
    if (data.digestFrequency && !allowedFrequencies.includes(data.digestFrequency)) {
      return NextResponse.json({ error: "Frecuencia no válida" }, { status: 400 })
    }

    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (userSettings) {
      // Actualizar configuración existente
      userSettings = await prisma.userSettings.update({
        where: { userId: session.user.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } else {
      // Crear nueva configuración
      userSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(userSettings)
    
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}