import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Endpoint temporal para corregir las horas de los horarios existentes
// GET /api/admin/fix-schedules
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Obtener todos los horarios
    const schedules = await prisma.schedule.findMany({
      include: {
        class: {
          select: {
            name: true
          }
        }
      }
    })

    const updates = []

    for (const schedule of schedules) {
      const startTime = new Date(schedule.startTime)
      const endTime = new Date(schedule.endTime)

      // Extraer solo la hora en formato HH:MM
      const startHour = startTime.getUTCHours().toString().padStart(2, '0')
      const startMin = startTime.getUTCMinutes().toString().padStart(2, '0')
      const endHour = endTime.getUTCHours().toString().padStart(2, '0')
      const endMin = endTime.getUTCMinutes().toString().padStart(2, '0')

      const startTimeStr = `${startHour}:${startMin}`
      const endTimeStr = `${endHour}:${endMin}`

      // Recrear con fecha fija UTC
      const newStartTime = new Date(`1970-01-01T${startTimeStr}:00.000Z`)
      const newEndTime = new Date(`1970-01-01T${endTimeStr}:00.000Z`)

      // Actualizar en la BD
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          startTime: newStartTime,
          endTime: newEndTime
        }
      })

      updates.push({
        class: schedule.class.name,
        day: schedule.dayOfWeek,
        old: {
          start: schedule.startTime.toISOString(),
          end: schedule.endTime.toISOString()
        },
        new: {
          start: newStartTime.toISOString(),
          end: newEndTime.toISOString()
        },
        display: `${startTimeStr}-${endTimeStr}`
      })
    }

    return NextResponse.json({
      message: 'Horarios corregidos exitosamente',
      totalUpdated: updates.length,
      updates
    })

  } catch (error) {
    console.error('Error fixing schedules:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
