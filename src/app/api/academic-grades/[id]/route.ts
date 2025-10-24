import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/academic-grades/[id] - Actualizar isActive de un grado
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    // context.params may be either { id } or a Promise<{ id }> depending on Next
    // runtime typing generation. Normalize safely.
    let params: any = context?.params;
    if (params && typeof params.then === "function") {
      params = await params;
    }
    const { id } = params || {};
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
    const data: Record<string, any> = {};
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
