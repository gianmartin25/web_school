import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/grade-sections/[id] - Actualizar combinación grado-sección
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const params = 'then' in context.params 
      ? await context.params 
      : context.params;
    const { id } = params;
    const body = await request.json();

    // Primero obtener los datos de la combinación
    const gradeSection = await prisma.gradeSection.findUnique({
      where: { id },
      include: { grade: true, section: true }
    });

    if (!gradeSection) {
      return NextResponse.json({ error: "Combinación no encontrada" }, { status: 404 });
    }

    // Si se intenta desactivar, validar dependencias
    if (body.isActive === false) {
      const students = await prisma.studentProfile.count({ 
        where: { 
          gradeId: gradeSection.gradeId,
          sectionId: gradeSection.sectionId,
          isActive: true 
        } 
      });
      
      if (students > 0) {
        return NextResponse.json({
          error: "No se puede desactivar la combinación porque tiene estudiantes asignados.",
          details: `${students} estudiante(s) asignado(s) en ${gradeSection.grade.name} - ${gradeSection.section.name}`
        }, { status: 400 });
      }
    }

    // Actualizar la combinación
    const updated = await prisma.gradeSection.update({
      where: { id },
      data: { isActive: body.isActive },
      include: {
        grade: true,
        section: true
      }
    });

    // Contar estudiantes actuales en esta combinación
    const currentStudents = await prisma.studentProfile.count({
      where: {
        gradeId: updated.gradeId,
        sectionId: updated.sectionId,
        isActive: true
      }
    });

    return NextResponse.json({
      ...updated,
      currentStudents
    });
  } catch (error) {
    console.error("Error actualizando combinación grado-sección:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE /api/grade-sections/[id] - Eliminar combinación grado-sección
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const params = 'then' in context.params 
      ? await context.params 
      : context.params;
    const { id } = params;

    // Verificar dependencias antes de eliminar
    const gradeSection = await prisma.gradeSection.findUnique({
      where: { id },
      include: { grade: true, section: true }
    });

    if (!gradeSection) {
      return NextResponse.json({ error: "Combinación no encontrada" }, { status: 404 });
    }

    // Verificar si hay estudiantes en esta combinación
    const studentsCount = await prisma.studentProfile.count({
      where: {
        gradeId: gradeSection.gradeId,
        sectionId: gradeSection.sectionId,
        isActive: true
      }
    });

    // Verificar si hay dependencias
    if (studentsCount > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar esta combinación porque hay estudiantes asignados',
          details: `${studentsCount} estudiante(s) asignado(s) en ${gradeSection.grade.name} - ${gradeSection.section.name}`
        }, 
        { status: 400 }
      );
    }

    // Soft delete - marcar como inactiva en lugar de eliminar
    const updated = await prisma.gradeSection.update({
      where: { id },
      data: { isActive: false },
      include: {
        grade: true,
        section: true
      }
    });

    // Contar estudiantes actuales después de la actualización
    const currentStudents = await prisma.studentProfile.count({
      where: {
        gradeId: updated.gradeId,
        sectionId: updated.sectionId,
        isActive: true
      }
    });

    return NextResponse.json({ 
      message: 'Combinación desactivada exitosamente',
      gradeSection: {
        ...updated,
        currentStudents
      }
    });
  } catch (error) {
    console.error("Error eliminando combinación grado-sección:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}