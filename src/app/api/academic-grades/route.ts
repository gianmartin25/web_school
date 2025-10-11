import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admins and teachers to fetch academic grades
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const academicGrades = await prisma.academicGrade.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        level: 'asc'
      }
    })

    return NextResponse.json(academicGrades)
  } catch (error) {
    console.error("Error fetching academic grades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can create academic grades
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, level, description } = body

    if (!name || !level) {
      return NextResponse.json({ error: "Name and level are required" }, { status: 400 })
    }

    const academicGrade = await prisma.academicGrade.create({
      data: {
        name,
        level,
        description: description || `Grado ${name}`,
        isActive: true
      }
    })

    return NextResponse.json(academicGrade, { status: 201 })
  } catch (error) {
    console.error("Error creating academic grade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}