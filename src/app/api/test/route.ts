import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      session: {
        user: session?.user || null,
        authenticated: !!session?.user
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json(
      { 
        error: 'Test API Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    
    // Verificar si los usuarios existen
    const { prisma } = await import('@/lib/prisma')
    
    let senderExists = null
    let receiverExists = null
    
    if (session?.user?.id) {
      senderExists = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true }
      })
    }
    
    if (body.receiverId) {
      receiverExists = await prisma.user.findUnique({
        where: { id: body.receiverId },
        select: { id: true, name: true, email: true }
      })
    }
    
    return NextResponse.json({
      success: true,
      receivedData: body,
      session: {
        user: session?.user || null,
        authenticated: !!session?.user
      },
      userValidation: {
        senderExists,
        receiverExists,
        senderIdFromSession: session?.user?.id,
        receiverIdFromBody: body.receiverId
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test API POST Error:', error)
    return NextResponse.json(
      { 
        error: 'Test API POST Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}