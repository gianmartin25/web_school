import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/cleanup-messages - Limpiar mensajes duplicados
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado - Solo administradores' }, { status: 401 })
    }

    // Encontrar mensajes duplicados (mismo remitente, receptor, asunto, contenido y fecha cercana)
    const duplicateGroups = await prisma.message.groupBy({
      by: ['senderId', 'receiverId', 'subject', 'content'],
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        id: true
      }
    })

    let deletedCount = 0

    for (const group of duplicateGroups) {
      // Obtener todos los mensajes de este grupo
      const duplicateMessages = await prisma.message.findMany({
        where: {
          senderId: group.senderId,
          receiverId: group.receiverId,
          subject: group.subject,
          content: group.content
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Mantener solo el primer mensaje, eliminar los demás
      if (duplicateMessages.length > 1) {
        const messagesToDelete = duplicateMessages.slice(1)
        
        for (const messageToDelete of messagesToDelete) {
          await prisma.message.delete({
            where: { id: messageToDelete.id }
          })
          deletedCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se eliminaron ${deletedCount} mensajes duplicados`,
      duplicateGroups: duplicateGroups.length
    })

  } catch (error) {
    console.error('Error limpiando mensajes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}