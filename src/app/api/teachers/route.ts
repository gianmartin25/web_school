import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/teachers - Obtener profesores con estadísticas
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo los administradores pueden ver todos los profesores
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a esta información' },
        { status: 403 }
      )
    }

    // Obtener profesores con información completa (incluyendo materias vía la tabla de unión)
    const teachers = await prisma.teacherProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        teacherSubjects: {
          include: {
            subject: true
          }
        },
        classes: true,
        _count: {
          select: {
            grades: true,
            attendances: true,
            observations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular estadísticas
    const totalTeachers = teachers.length
    const activeTeachers = teachers.filter(t => t.isActive).length
    const inactiveTeachers = teachers.filter(t => !t.isActive).length
    
    // Obtener número total de materias y estudiantes
    const totalSubjects = await prisma.subject.count()
    const totalStudents = await prisma.studentProfile.count()
    
    // Calcular salario promedio
    const teachersWithSalary = teachers.filter(t => t.salary && t.salary > 0)
    const averageSalary = teachersWithSalary.length > 0 
      ? teachersWithSalary.reduce((acc, t) => acc + (t.salary || 0), 0) / teachersWithSalary.length 
      : 0

    const stats = {
      totalTeachers,
      activeTeachers,
      inactiveTeachers,
      totalSubjects,
      totalStudents,
      averageSalary
    }

    return NextResponse.json({
      teachers,
      stats
    })

  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/teachers - Crear nuevo profesor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo los administradores pueden crear profesores
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Request body received:', body)

    const { 
      name, 
      email, 
      employeeId, 
      firstName, 
      lastName, 
      phone, 
      address, 
      dateOfBirth, 
      salary,
      subjectIds = []
    } = body

    console.log('Extracted fields:', {
      name, email, employeeId, firstName, lastName, phone, address, dateOfBirth, salary
    })

    // Validar datos requeridos (employeeId es opcional)
    if (!name || !email || !firstName || !lastName) {
      console.log('Missing required fields:', { name, email, firstName, lastName })
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Generar employeeId automáticamente si no se proporciona
    let finalEmployeeId = employeeId
    if (!finalEmployeeId) {
      // Obtener el último número de empleado
      const lastTeacher = await prisma.teacherProfile.findFirst({
        where: {
          employeeId: {
            startsWith: 'EMP'
          }
        },
        orderBy: {
          employeeId: 'desc'
        }
      })
      
      let nextNumber = 1
      if (lastTeacher?.employeeId) {
        const match = lastTeacher.employeeId.match(/EMP(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1]) + 1
        }
      }
      
      finalEmployeeId = `EMP${nextNumber.toString().padStart(3, '0')}`
    }

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar que el employeeId no exista
    const existingEmployee = await prisma.teacherProfile.findUnique({
      where: { employeeId: finalEmployeeId }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'El ID de empleado ya está registrado' },
        { status: 400 }
      )
    }

    // Generar contraseña temporal
    const tempPassword = `temp${finalEmployeeId}123`
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Crear usuario y profesor en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'TEACHER'
        }
      })

      // Crear perfil de profesor
      const teacher = await tx.teacherProfile.create({
        data: {
          userId: user.id,
          employeeId: finalEmployeeId,
          firstName,
          lastName,
          phone: phone || null,
          address: address || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          salary: salary ? parseFloat(salary) : null,
          isActive: true
        },
        include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            teacherSubjects: {
              include: { subject: true }
            },
            classes: true,
            _count: {
              select: {
                grades: true,
                attendances: true,
                observations: true
              }
            }
          }
      })

      // Asignar materias si se proporcionaron
      if (subjectIds.length > 0) {
        // Crear registros en la tabla de unión
        const createData = subjectIds.map((sid: string) => ({ teacherId: teacher.id, subjectId: sid }))
        await tx.teacherSubject.createMany({ data: createData, skipDuplicates: true })

        // Recargar el profesor con las materias asignadas via teacherSubjects
        return await tx.teacherProfile.findUnique({
          where: { id: teacher.id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            teacherSubjects: { include: { subject: true } },
            classes: true,
            _count: {
              select: {
                grades: true,
                attendances: true,
                observations: true
              }
            }
          }
        })
      }

      return teacher
    })

    return NextResponse.json({
      teacher: result,
      tempPassword // Enviar contraseña temporal para que el admin la comunique al profesor
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}