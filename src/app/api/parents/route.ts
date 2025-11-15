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

    // Only allow admins and teachers to fetch all parents
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const parents = await prisma.parentProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
            academicGrade: true,
            academicSection: true
          }
        }
      }
    })

    const formattedParents = parents.map(parent => ({
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.user.email,
      phone: parent.phone,
      address: parent.address,
      occupation: parent.occupation,
      children: parent.children
    }))

    return NextResponse.json(formattedParents)
  } catch (error) {
    console.error("Error fetching parents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can create parents
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, address, occupation, password } = body

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Create user first
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: password || 'temp123456', // Should be hashed in production
        role: 'PARENT'
      }
    })

    // Create parent profile
    const parent = await prisma.parentProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        phone,
        address: address || '',
        occupation: occupation || ''
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.user.email,
      phone: parent.phone,
      address: parent.address,
      occupation: parent.occupation
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating parent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}