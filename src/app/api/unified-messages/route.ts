import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MessageType, Priority, UserRole } from '@prisma/client'
import type { Prisma } from '@prisma/client'

// GET /api/unified-messages - Obtener mensajes unificados (directos + broadcasts)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role as UserRole

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'direct', 'broadcast', 'all'
    const view = searchParams.get('view') // 'inbox', 'sent', 'all'

    // Construcción de filtros basados en el tipo y rol
    let messageFilter: Prisma.MessageWhereInput = {
      OR: []
    }

    // Mensajes directos
    if (type === 'direct' || type === 'all' || !type) {
      messageFilter.OR!.push({
        AND: [
          { isBroadcast: false },
          {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ]
          }
        ]
      })
    }

    // Mensajes broadcast (comunicaciones)
    if (type === 'broadcast' || type === 'all' || !type) {
      messageFilter.OR!.push({
        AND: [
          { isBroadcast: true },
          {
            OR: [
              { senderId: userId }, // Mensajes enviados por mí
              { targetRole: userRole }, // Mensajes para mi rol
              { targetRole: null } // Mensajes para todos
            ]
          }
        ]
      })
    }

    // Filtros adicionales por vista
    if (view === 'inbox') {
      messageFilter = {
        AND: [
          messageFilter,
          {
            OR: [
              { receiverId: userId }, // Mensajes directos recibidos
              { 
                AND: [
                  { isBroadcast: true },
                  { 
                    OR: [
                      { targetRole: userRole },
                      { targetRole: null }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    } else if (view === 'sent') {
      messageFilter = {
        AND: [
          messageFilter,
          { senderId: userId }
        ]
      }
    }

    // Obtener mensajes base
    const allMessages = await prisma.message.findMany({
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
        },
        replyTo: {
          select: {
            id: true,
            subject: true,
            sender: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Agrupar mensajes por conversación y filtrar según la vista
    let messages = allMessages
    
    if (view === 'inbox') {
      // Mostrar solo el mensaje más reciente de cada conversación, sin duplicados por id
      const conversationMap = new Map();
      const usedMessageIds = new Set();
      for (const message of allMessages) {
        const conversationId = message.threadId || message.id;
        // Solo incluir si el usuario es el receptor o es un broadcast
        if ((message.receiverId === userId || message.isBroadcast)) {
          // Si ya existe un mensaje para este conversationId, comparar fechas
          const existing = conversationMap.get(conversationId);
          if (!existing || new Date(message.createdAt) > new Date(existing.createdAt)) {
            conversationMap.set(conversationId, message);
          }
        }
      }
      // Eliminar cualquier duplicado por id (por si dos conversationId apuntan al mismo mensaje)
      const uniqueMessages = [];
      for (const msg of conversationMap.values()) {
        if (!usedMessageIds.has(msg.id)) {
          uniqueMessages.push(msg);
          usedMessageIds.add(msg.id);
        }
      }
      messages = uniqueMessages.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (view === 'sent') {
      // Para enviados: mostrar solo el primer mensaje de cada conversación que inició el usuario
      const conversationMap = new Map()
      
      for (const message of allMessages) {
        if (message.senderId === userId) {
          const conversationId = message.threadId || message.id
          
          // Solo tomar el primer mensaje de la conversación (sin replyToId)
          if (!message.replyToId) {
            conversationMap.set(conversationId, message)
          }
        }
      }
      
      messages = Array.from(conversationMap.values()).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
    } else if (view === 'broadcasts') {
      // Para comunicados: mostrar solo broadcasts sin agrupar
      messages = allMessages.filter(message => message.isBroadcast)
    }

    // Agregar conteo de respuestas y participantes para cada mensaje mostrado
    const messagesWithCounts = await Promise.all(messages.map(async (message) => {
      const conversationId = message.threadId || message.id
      
      // Contar todos los mensajes en esta conversación
      const totalInConversation = await prisma.message.count({
        where: {
          OR: [
            { id: conversationId },
            { threadId: conversationId }
          ]
        }
      })

      // Obtener participantes únicos de la conversación (solo para mensajes directos)
      let participants: Array<{id: string; name: string; email: string; role: string}> = []
      if (!message.isBroadcast) {
        const conversationMessages = await prisma.message.findMany({
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

        const participantsMap = new Map()
        
        for (const msg of conversationMessages) {
          if (msg.sender) {
            participantsMap.set(msg.sender.id, msg.sender)
          }
          if (msg.receiver) {
            participantsMap.set(msg.receiver.id, msg.receiver)
          }
        }
        
        participants = Array.from(participantsMap.values())
      }
      
      return {
        ...message,
        _count: {
          ...message._count,
          replies: Math.max(0, totalInConversation - 1) // Restar 1 para no contar el mensaje original
        },
        participants: participants.length > 0 ? participants : undefined
      }
    }))

    // Calcular estadísticas
    const stats = {
      total: messagesWithCounts.length,
      unread: messagesWithCounts.filter(m => 
        (m.receiverId === userId || (m.isBroadcast && (m.targetRole === userRole || !m.targetRole))) && 
        !m.isRead
      ).length,
      sent: messagesWithCounts.filter(m => m.senderId === userId).length,
      received: messagesWithCounts.filter(m => 
        m.receiverId === userId || 
        (m.isBroadcast && (m.targetRole === userRole || !m.targetRole))
      ).length,
      broadcasts: messagesWithCounts.filter(m => m.isBroadcast).length,
      direct: messagesWithCounts.filter(m => !m.isBroadcast).length
    }

    return NextResponse.json({
      success: true,
      messages: messagesWithCounts,
      stats
    })

  } catch (error) {
    console.error('Error obteniendo mensajes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/unified-messages - Crear mensaje (directo o broadcast)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    // Debug: log incoming payload and user for troubleshooting
    try {
      console.log('[unified-messages] POST payload:', JSON.stringify(body))
    } catch {
      console.log('[unified-messages] POST payload (non-serializable)')
    }
    
    const {
      receiverId, // Para compatibilidad con respuestas
      receiverIds, // Para múltiples destinatarios
      subject,
      content,
      type = 'GENERAL',
      priority = 'MEDIUM',
      isBroadcast = false,
      targetRole,
      replyToId,
      threadId
    } = body

    // Validación básica
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Asunto y contenido son requeridos' },
        { status: 400 }
      )
    }

    // Para mensajes broadcast, solo ADMINs y TEACHERs pueden crearlos
    if (isBroadcast && !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Solo los administradores y profesores pueden enviar comunicados' },
        { status: 403 }
      )
    }

    // Debug: log session user
    console.log('[unified-messages] user:', { id: session.user.id, role: session.user.role })

    // Normalizar destinatarios - soportar tanto receiverId (respuestas) como receiverIds (nuevos mensajes)
    let targetReceiverIds: string[] = []
    if (receiverId) {
      targetReceiverIds = [receiverId]
    } else if (receiverIds && Array.isArray(receiverIds)) {
      targetReceiverIds = receiverIds
    }

    // Para mensajes directos, al menos un destinatario es requerido
    if (!isBroadcast && targetReceiverIds.length === 0) {
      return NextResponse.json(
        { error: 'Al menos un destinatario es requerido para mensajes directos' },
        { status: 400 }
      )
    }

    // Validate that all targetReceiverIds exist in the database to avoid Prisma connect failures
    if (!isBroadcast && targetReceiverIds.length > 0) {
      try {
        const existingUsers = await prisma.user.findMany({ where: { id: { in: targetReceiverIds } }, select: { id: true } })
        const existingIds = new Set(existingUsers.map(u => u.id))
        const missing = targetReceiverIds.filter(id => !existingIds.has(id))
        if (missing.length > 0) {
          console.warn('[unified-messages] missing recipient ids:', missing)
          return NextResponse.json({ error: `Algunos destinatarios no existen: ${missing.join(',')}` }, { status: 400 })
        }
      } catch (e) {
        console.error('[unified-messages] error checking recipient ids:', e)
        return NextResponse.json({ error: 'Error validando destinatarios' }, { status: 500 })
      }
    }

    if (isBroadcast) {
      // Para mensajes broadcast - crear un solo mensaje
      const messageData: Prisma.MessageCreateInput = {
        sender: { connect: { id: session.user.id } },
        subject,
        content,
        type: type as MessageType,
        priority: priority as Priority,
        isBroadcast: true,
        targetRole: (targetRole && targetRole !== "ALL") ? targetRole : null,
        threadId: threadId || null
      }

      // Agregar relación de respuesta si existe
      if (replyToId) {
        messageData.replyTo = { connect: { id: replyToId } }
      }

      const message = await prisma.message.create({
        data: messageData,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message
      })
      
    } else {
      // Separar lógica: Respuestas vs Mensajes nuevos
      if (replyToId) {
        // RESPUESTAS: Crear solo un mensaje dirigido al remitente original
        const originalMessage = await prisma.message.findUnique({
          where: { id: replyToId }
        })

        if (!originalMessage) {
          return NextResponse.json(
            { error: 'Mensaje original no encontrado' },
            { status: 404 }
          )
        }

        const messageData: Prisma.MessageCreateInput = {
          sender: { connect: { id: session.user.id } },
          receiver: { connect: { id: originalMessage.senderId } },
          subject,
          content,
          type: type as MessageType,
          priority: priority as Priority,
          isBroadcast: false,
          threadId: threadId || originalMessage.threadId || originalMessage.id,
          replyTo: { connect: { id: replyToId } }
        }

        const message = await prisma.message.create({
          data: messageData,
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

        return NextResponse.json({
          success: true,
          message
        })

      } else {
        // MENSAJES NUEVOS
        if (targetReceiverIds.length === 1) {
          // Solo un destinatario: crear un solo mensaje, sin threadId
          const messageData: Prisma.MessageCreateInput = {
            sender: { connect: { id: session.user.id } },
            receiver: { connect: { id: targetReceiverIds[0] } },
            subject,
            content,
            type: type as MessageType,
            priority: priority as Priority,
            isBroadcast: false
          }
          const message = await prisma.message.create({
            data: messageData,
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
          return NextResponse.json({
            success: true,
            message
          })
        } else {
          // Varios destinatarios: crear un mensaje por destinatario, con threadId compartido
          const sharedThreadId = crypto.randomUUID()
          const messages = []
          for (const receiverId of targetReceiverIds) {
            const messageData: Prisma.MessageCreateInput = {
              sender: { connect: { id: session.user.id } },
              receiver: { connect: { id: receiverId } },
              subject,
              content,
              type: type as MessageType,
              priority: priority as Priority,
              isBroadcast: false,
              threadId: sharedThreadId
            }
            const message = await prisma.message.create({
              data: messageData,
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
            messages.push(message)
          }
          return NextResponse.json({
            success: true,
            messages,
            conversationId: sharedThreadId || messages[0]?.id
          })
        }
      }
    }

  } catch (error) {
    console.error('Error creando mensaje:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/unified-messages - Marcar mensaje como leído
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, isRead = true } = body

    // Verificar que el usuario puede marcar este mensaje
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      )
    }

    // Solo el destinatario puede marcar como leído
    const canMarkAsRead = message.receiverId === session.user.id || 
                         (message.isBroadcast && 
                          (message.targetRole === session.user.role || !message.targetRole))

    if (!canMarkAsRead) {
      return NextResponse.json(
        { error: 'No tienes permisos para marcar este mensaje' },
        { status: 403 }
      )
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead }
    })

    return NextResponse.json({
      success: true,
      message: updatedMessage
    })

  } catch (error) {
    console.error('Error actualizando mensaje:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}