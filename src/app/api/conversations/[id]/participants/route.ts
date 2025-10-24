import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/conversations/[id]/participants - Obtener participantes de una conversación
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const conversationId = id

    // Obtener todos los mensajes de la conversación
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { id: conversationId },
          { threadId: conversationId }
        ]
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

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Conversación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario tenga acceso a esta conversación
    const hasAccess = messages.some(message => 
      message.senderId === session.user.id || 
      message.receiverId === session.user.id ||
      message.isBroadcast
    )

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta conversación' },
        { status: 403 }
      )
    }

    // Extraer participantes únicos
    const participantsMap = new Map()
    
    for (const message of messages) {
      // Agregar remitente
      if (message.sender) {
        participantsMap.set(message.sender.id, message.sender)
      }
      
      // Agregar receptor si no es broadcast
      if (message.receiver && !message.isBroadcast) {
        participantsMap.set(message.receiver.id, message.receiver)
      }
    }

    const participants = Array.from(participantsMap.values())

    return NextResponse.json({
      success: true,
      participants,
      totalMessages: messages.length
    })

  } catch (error) {
    console.error('Error obteniendo participantes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}