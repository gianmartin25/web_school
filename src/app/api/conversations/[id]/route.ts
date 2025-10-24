import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/conversations/[id] - Obtener conversación completa
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
    const messageId = id
    const userId = session.user.id

    // Primero, obtener el mensaje original para determinar el threadId
    const originalMessage = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true }
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    if (!originalMessage) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    // Verificar que el usuario tiene acceso al mensaje
    const hasAccess = originalMessage.senderId === userId || 
                     originalMessage.receiverId === userId ||
                     originalMessage.isBroadcast

    if (!hasAccess) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Determinar el threadId - si el mensaje tiene threadId, usarlo, sino usar su propio id
    let conversationMessages = [];
    if (originalMessage.threadId) {
      // Mensaje de grupo: obtener todos los mensajes del hilo
  let messages = await prisma.message.findMany({
        where: {
          OR: [
            { id: originalMessage.threadId }, // Mensaje original del hilo
            { threadId: originalMessage.threadId }
          ]
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, role: true }
          },
          receiver: {
            select: { id: true, name: true, email: true, role: true }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      // Filtrar mensajes iniciales duplicados (mismo sender, subject, content, threadId, sin replyToId)
      const seenInitial = new Set();
      conversationMessages = messages.filter(msg => {
        if (!msg.replyToId && msg.threadId && msg.senderId) {
          const key = `${msg.threadId}|${msg.senderId}|${msg.subject}|${msg.content}`;
          if (seenInitial.has(key)) return false;
          seenInitial.add(key);
          return true;
        }
        return true;
      });
    } else {
      // Mensaje directo 1 a 1: solo mostrar ese mensaje
      conversationMessages = [originalMessage];
    }

    return NextResponse.json({
      success: true,
      threadId: originalMessage.threadId || originalMessage.id,
      messages: conversationMessages,
      originalMessage
    })

  } catch (error) {
    console.error('Error obteniendo conversación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para obtener cadena de respuestas
async function getReplyChain(threadId: string): Promise<string[]> {
  const replies = await prisma.message.findMany({
    where: { 
      OR: [
        { threadId: threadId },
        { id: threadId }
      ]
    },
    select: { id: true }
  })
  
  return replies.map(reply => reply.id)
}