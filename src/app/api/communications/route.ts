import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MessageType } from '@prisma/client'

// GET /api/communications - Obtener comunicaciones del sistema
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admins pueden ver todas las comunicaciones del sistema
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Construir filtros para mensajes
    const messageWhere: {
      type?: MessageType
    } = {}
    
    if (type && type !== 'all' && Object.values(MessageType).includes(type as MessageType)) {
      messageWhere.type = type as MessageType
    }

    // Obtener mensajes del sistema
    const messages = await prisma.message.findMany({
      where: messageWhere,
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

    // Obtener usuarios para destinatarios
    const recipients = await prisma.user.findMany({
      where: {
        role: {
          in: ['PARENT', 'TEACHER', 'STUDENT']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Formatear mensajes para la respuesta
    const formattedMessages = messages.map(message => ({
      id: message.id,
      title: message.subject,
      content: message.content,
      type: message.type || 'general',
      recipients: 'custom', // Los mensajes en la BD son individuales
      sentBy: message.sender.name,
      sentAt: message.createdAt.toISOString(),
      status: 'sent',
      readCount: message.isRead ? 1 : 0,
      totalRecipients: 1,
      priority: 'medium', // Por defecto
      recipientsList: [message.receiver.id]
    }))

    // Formatear destinatarios
    const formattedRecipients = recipients.map(user => ({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      role: user.role.toLowerCase(),
      selected: false
    }))

    // Plantillas predefinidas del sistema
    const systemTemplates = [
      {
        id: '1',
        name: 'Reunión de Padres',
        content: 'Estimados padres de familia, se convoca a reunión el día [FECHA] a las [HORA] para tratar temas importantes sobre el desarrollo académico de sus hijos.',
        type: 'announcement',
        category: 'Académico',
        isActive: true
      },
      {
        id: '2',
        name: 'Entrega de Libretas',
        content: 'Se comunica que la entrega de libretas de notas se realizará el día [FECHA] de [HORA_INICIO] a [HORA_FIN]. Es obligatoria la asistencia de los padres.',
        type: 'notification',
        category: 'Evaluación',
        isActive: true
      },
      {
        id: '3',
        name: 'Actividad Especial',
        content: 'Nos complace invitarlos a participar en [ACTIVIDAD] que se realizará el [FECHA]. Favor confirmar asistencia.',
        type: 'general',
        category: 'Eventos',
        isActive: true
      }
    ]

    return NextResponse.json({
      messages: formattedMessages,
      recipients: formattedRecipients,
      templates: systemTemplates,
      stats: {
        totalMessages: formattedMessages.length,
        sentToday: formattedMessages.filter(m => {
          const today = new Date().toDateString()
          return new Date(m.sentAt).toDateString() === today
        }).length,
        totalRecipients: formattedRecipients.length
      }
    })

  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/communications - Crear nueva comunicación/mensaje
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear comunicaciones' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const {
      title,
      content,
      type = 'GENERAL',
      recipients,
      recipientsList,
      priority = 'medium'
    } = data

    // Validaciones
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
      )
    }

    let targetUserIds: string[] = []

    // Determinar destinatarios
    if (recipients === 'all') {
      const allUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ['PARENT', 'TEACHER', 'STUDENT']
          }
        },
        select: { id: true }
      })
      targetUserIds = allUsers.map(u => u.id)
    } else if (recipients === 'parents') {
      const parents = await prisma.user.findMany({
        where: { role: 'PARENT' },
        select: { id: true }
      })
      targetUserIds = parents.map(u => u.id)
    } else if (recipients === 'teachers') {
      const teachers = await prisma.user.findMany({
        where: { role: 'TEACHER' },
        select: { id: true }
      })
      targetUserIds = teachers.map(u => u.id)
    } else if (recipients === 'students') {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true }
      })
      targetUserIds = students.map(u => u.id)
    } else if (recipients === 'custom' && recipientsList) {
      targetUserIds = recipientsList
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { error: 'No se especificaron destinatarios válidos' },
        { status: 400 }
      )
    }

    // Crear mensajes para cada destinatario
    const messages = await Promise.all(
      targetUserIds.map(receiverId =>
        prisma.message.create({
          data: {
            subject: title,
            content,
            type: type as MessageType,
            senderId: session.user.id,
            receiverId,
            isRead: false
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
      )
    )

    return NextResponse.json({
      message: 'Comunicación enviada exitosamente',
      sentCount: messages.length,
      messages: messages.map(msg => ({
        id: msg.id,
        title: msg.subject,
        content: msg.content,
        type: msg.type || 'general',
        recipients: 'custom',
        sentBy: msg.sender.name,
        sentAt: msg.createdAt.toISOString(),
        status: 'sent',
        readCount: 0,
        totalRecipients: 1,
        priority,
        recipientsList: [msg.receiver.id]
      }))
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}