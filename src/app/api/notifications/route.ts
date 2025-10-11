import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

// GET /api/notifications - Obtener notificaciones del sistema
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isRead = searchParams.get('isRead')
    const type = searchParams.get('type')

    // Solo admins pueden ver todas las notificaciones del sistema
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      )
    }

    // Construir filtros  
    const where: {
      userId?: string
      isRead?: boolean
      type?: NotificationType
    } = {}
    
    if (userId && userId !== 'ALL') {
      where.userId = userId
    }
    
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true'
    }
    
    if (type && Object.values(NotificationType).includes(type as NotificationType)) {
      where.type = type as NotificationType
    }

    // Obtener notificaciones del sistema
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // Obtener estadísticas
    const stats = await prisma.notification.groupBy({
      by: ['isRead'],
      _count: {
        id: true
      }
    })

    const totalNotifications = notifications.length
    const unreadCount = stats.find(s => s.isRead === false)?._count.id || 0
    const readCount = stats.find(s => s.isRead === true)?._count.id || 0

    return NextResponse.json({
      notifications,
      stats: {
        total: totalNotifications,
        unread: unreadCount,
        read: readCount
      }
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear notificaciones' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const {
      title,
      message,
      type,
      userId,
      actionUrl
    } = data

    // Validaciones
    if (!title || !message || !type || !userId) {
      return NextResponse.json(
        { error: 'Título, mensaje, tipo y usuario son requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo de notificación
    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de notificación inválido' },
        { status: 400 }
      )
    }

    // Crear notificación
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
        actionUrl,
        isRead: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(notification, { status: 201 })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Marcar notificaciones como leídas
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar notificaciones' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { notificationIds, markAsRead = true } = data

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'IDs de notificaciones requeridos' },
        { status: 400 }
      )
    }

    // Actualizar notificaciones
    const updatedNotifications = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        }
      },
      data: {
        isRead: markAsRead
      }
    })

    return NextResponse.json({
      message: `${updatedNotifications.count} notificaciones actualizadas`,
      count: updatedNotifications.count
    })

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Eliminar notificaciones
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar notificaciones' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const notificationIds = searchParams.get('ids')?.split(',') || []

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de notificaciones requeridos' },
        { status: 400 }
      )
    }

    // Eliminar notificaciones
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationIds
        }
      }
    })

    return NextResponse.json({
      message: `${deletedNotifications.count} notificaciones eliminadas`,
      count: deletedNotifications.count
    })

  } catch (error) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}