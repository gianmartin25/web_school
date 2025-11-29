import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/academic-grades/[id] - Actualizar isActive de un grado
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    // context.params may be either { id } or a Promise<{ id }> depending on Next
    // runtime typing generation. Normalize safely.
    const params = 'then' in context.params 
      ? await context.params 
      : context.params;
    const { id } = params;
    const body = await request.json();
    // Si se intenta desactivar, validar dependencias
    if (body.isActive === false) {
      const students = await prisma.studentProfile.count({ where: { gradeId: id, isActive: true } });
      const classes = await prisma.class.count({ where: { gradeId: id, isActive: true } });
      if (students > 0 || classes > 0) {
        return NextResponse.json({
          error: "No se puede desactivar el grado porque tiene estudiantes o clases activas asignadas."
        }, { status: 400 });
      }
    }
    // Solo permitir actualizar campos editables
    const allowedFields = ["name", "level", "description", "isActive"];
    const data: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) data[key] = body[key];
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 });
    }
    const updated = await prisma.academicGrade.update({
      where: { id },
      data
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error actualizando grado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE /api/academic-grades/[id] - Eliminar un grado académico
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
    const dependencies = await prisma.academicGrade.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            studentProfiles: true,
            classes: true
          }
        }
      }
    });

    if (!dependencies) {
      return NextResponse.json({ error: "Grado no encontrado" }, { status: 404 });
    }

    // Verificar si hay dependencias
    if (dependencies._count.studentProfiles > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar este grado porque hay estudiantes asignados',
          details: `${dependencies._count.studentProfiles} estudiante(s) asignado(s)`
        }, 
        { status: 400 }
      );
    }

    if (dependencies._count.classes > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar este grado porque hay clases asignadas',
          details: `${dependencies._count.classes} clase(s) asignada(s)`
        }, 
        { status: 400 }
      );
    }

    // Eliminar el grado si no hay dependencias
    await prisma.academicGrade.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Grado eliminado exitosamente' });
  } catch (error) {
    console.error("Error eliminando grado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
