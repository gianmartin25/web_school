import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gradeId, sectionId, capacity, isActive } = body;

    if (!gradeId || !sectionId || !capacity) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const gradeSection = await prisma.gradeSection.create({
      data: {
        gradeId,
        sectionId,
        capacity,
        isActive,
      },
      include: {
        grade: true,
        section: true,
      },
    });

    return NextResponse.json(gradeSection, { status: 201 });
  } catch (error) {
    console.error('Error al crear combinación grado-sección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const gradeSections = await prisma.gradeSection.findMany({
      include: {
        grade: true,
        section: true,
      },
    });

    return NextResponse.json(gradeSections, { status: 200 });
  } catch (error) {
    console.error('Error al obtener combinaciones grado-sección:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}