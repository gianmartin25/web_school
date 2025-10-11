import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages - Obtener mensajes con estadísticas
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Construcción de filtros basados en el rol
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let messageFilter: any = {}

    if (userRole === 'ADMIN') {
      // Los administradores ven todos los mensajes
      messageFilter = {}
    } else if (userRole === 'TEACHER') {
      // Los profesores ven mensajes donde son remitente o destinatario
      messageFilter = {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    } else if (userRole === 'PARENT') {
      // Los padres solo ven mensajes donde son destinatarios o remitentes
      messageFilter = {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    }

    // Obtener mensajes con información del remitente y destinatario
    const messages = await prisma.message.findMany({
      where: messageFilter,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular estadísticas
    const totalMessages = messages.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unreadMessages = messages.filter((m: any) => 
      m.receiverId === userId && !m.isRead
    ).length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sentMessages = messages.filter((m: any) => m.senderId === userId).length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const receivedMessages = messages.filter((m: any) => m.receiverId === userId).length

    const stats = {
      totalMessages,
      unreadMessages,
      sentMessages,
      receivedMessages
    }

    // Mapear mensajes al formato esperado por el frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      subject: message.subject,
      content: message.content,
      priority: message.type || 'MEDIUM', // Mapear type a priority
      isRead: message.isRead,
      sentAt: message.createdAt.toISOString(), // Mapear createdAt a sentAt
      sender: {
        id: message.sender.id,
        name: message.sender.name || message.sender.email,
        email: message.sender.email,
        role: message.sender.role
      },
      receiver: {
        id: message.receiver.id,
        name: message.receiver.name || message.receiver.email,
        email: message.receiver.email,
        role: message.receiver.role
      }
    }))

    return NextResponse.json({
      messages: formattedMessages,
      stats
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Crear nuevo mensaje
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { recipient, subject, content, messageType } = await request.json()

    // Validar datos requeridos
    if (!recipient || !subject || !content || !messageType) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Verificar permisos para enviar mensajes
    const userRole = session.user.role
    if (userRole !== 'ADMIN' && userRole !== 'TEACHER') {
      return NextResponse.json(
        { error: 'No tienes permisos para enviar mensajes' },
        { status: 403 }
      )
    }

    // Buscar el destinatario por email o ID
    let recipientUser
    if (recipient.includes('@')) {
      recipientUser = await prisma.user.findUnique({
        where: { email: recipient }
      })
    } else {
      recipientUser = await prisma.user.findUnique({
        where: { id: recipient }
      })
    }

    if (!recipientUser) {
      return NextResponse.json(
        { error: 'Destinatario no encontrado' },
        { status: 404 }
      )
    }

    // Crear el mensaje
    const message = await prisma.message.create({
      data: {
        subject,
        content,
        type: messageType,
        senderId: session.user.id,
        receiverId: recipientUser.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(message, { status: 201 })

  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}