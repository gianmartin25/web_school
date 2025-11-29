import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/sections/[id] - Actualizar isActive de una sección
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Normalize params (may be Promise in generated types)
    const params = 'then' in context.params 
      ? await context.params 
      : context.params;
    const { id } = params;
    const body = await request.json();

    // Validar que el ID sea válido
    if (!id) {
      return NextResponse.json({ error: "ID de sección no proporcionado" }, { status: 400 });
    }

    // Si se intenta desactivar, validar dependencias
    if (body.isActive === false) {
      const students = await prisma.studentProfile.count({ where: { sectionId: id, isActive: true } });
      const classes = await prisma.class.count({ where: { sectionId: id, isActive: true } });
      if (students > 0 || classes > 0) {
        return NextResponse.json({
          error: "No se puede desactivar la sección porque tiene estudiantes o clases activas asignadas."
        }, { status: 400 });
      }
    }

    // Solo permitir actualizar campos editables
    const allowedFields = ["name", "description", "isActive"];
    const data: Record<string, string | boolean | undefined> = {};
    for (const key of allowedFields) {
      if (key in body) data[key] = body[key];
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 });
    }

    // Validar que la sección exista antes de actualizar
    const exists = await prisma.section.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "La sección no existe" }, { status: 404 });
    }

    try {
      const updated = await prisma.section.update({
        where: { id },
        data
      });
      return NextResponse.json(updated);
    } catch (err) {
      console.error("Error en prisma.section.update:", err);
      return NextResponse.json({ error: "Error al actualizar la sección" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error en PATCH /api/sections/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE /api/sections/[id] - Eliminar una sección
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
    const dependencies = await prisma.section.findUnique({
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
      return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 });
    }

    // Verificar si hay dependencias
    if (dependencies._count.studentProfiles > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar esta sección porque hay estudiantes asignados',
          details: `${dependencies._count.studentProfiles} estudiante(s) asignado(s)`
        }, 
        { status: 400 }
      );
    }

    if (dependencies._count.classes > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar esta sección porque hay clases asignadas',
          details: `${dependencies._count.classes} clase(s) asignada(s)`
        }, 
        { status: 400 }
      );
    }

    // Eliminar la sección si no hay dependencias
    await prisma.section.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Sección eliminada exitosamente' });
  } catch (error) {
    console.error("Error eliminando sección:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
