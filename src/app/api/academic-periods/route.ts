import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/academic-periods - Obtener períodos académicos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const currentOnly = searchParams.get('currentOnly') === 'true'

    const periods = await prisma.academicPeriod.findMany({
      where: {
        ...(activeOnly && { isActive: true }),
        ...(currentOnly && { isCurrent: true })
      },
      orderBy: [
        { academicYear: 'desc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json({
      periods,
      total: periods.length
    })

  } catch (error) {
    console.error('Error fetching academic periods:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
