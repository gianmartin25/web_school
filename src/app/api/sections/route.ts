import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/sections - Listar solo secciones activas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    // Solo admins y teachers pueden ver secciones
    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }
    const sections = await prisma.section.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error listando secciones:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/sections - Crear sección
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }
    const section = await prisma.section.create({
      data: {
        name,
        description: description || '',
        isActive: true
      }
    });
    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Error creando sección:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
