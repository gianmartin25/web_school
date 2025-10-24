import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const currentUserRole = session.user.role

    let users: { id: string; name: string; email: string; role: string }[] = []

    if (currentUserRole === 'ADMIN') {
      // Los administradores pueden ver todos los usuarios
      const [teachers, students, parents] = await Promise.all([
        prisma.teacherProfile.findMany({
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }),
        prisma.studentProfile.findMany({
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }),
        prisma.parentProfile.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        })
      ])

      users = [
        ...teachers.map(t => ({
          id: t.user.id,
          name: t.user.name || 'Sin nombre',
          email: t.user.email,
          role: t.user.role as string
        })),
        ...students.map(s => ({
          id: s.user.id,
          name: s.user.name || 'Sin nombre',
          email: s.user.email,
          role: s.user.role as string
        })),
        ...parents.map(p => ({
          id: p.user.id,
          name: p.user.name || 'Sin nombre',
          email: p.user.email,
          role: p.user.role as string
        }))
      ]
    } else if (currentUserRole === 'TEACHER') {
      // Los profesores pueden ver estudiantes de sus clases, otros profesores y padres
      const [teachers, students, parents] = await Promise.all([
        prisma.teacherProfile.findMany({
          where: { 
            isActive: true,
            user: { id: { not: currentUserId } }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }),
        prisma.studentProfile.findMany({
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }),
        prisma.parentProfile.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        })
      ])

      users = [
        ...teachers.map(t => ({
          id: t.user.id,
          name: t.user.name || 'Sin nombre',
          email: t.user.email,
          role: t.user.role as string
        })),
        ...students.map(s => ({
          id: s.user.id,
          name: s.user.name || 'Sin nombre',
          email: s.user.email,
          role: s.user.role as string
        })),
        ...parents.map(p => ({
          id: p.user.id,
          name: p.user.name || 'Sin nombre',
          email: p.user.email,
          role: p.user.role as string
        }))
      ]
    } else if (currentUserRole === 'PARENT') {
      // Los padres pueden ver profesores de sus hijos y administradores
      const parentProfile = await prisma.parentProfile.findUnique({
        where: { userId: currentUserId },
        include: {
          children: {
            include: {
              classes: {
                include: {
                  class: {
                    include: {
                      teacher: {
                        include: {
                          user: {
                            select: {
                              id: true,
                              name: true,
                              email: true,
                              role: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Obtener administradores
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })

      const teacherIds = new Set()
      const teachers: { id: string; name: string; email: string; role: string }[] = []

      if (parentProfile) {
        parentProfile.children.forEach(child => {
          child.classes.forEach(enrollment => {
            const teacher = enrollment.class.teacher
            if (teacher && !teacherIds.has(teacher.user.id)) {
              teacherIds.add(teacher.user.id)
              teachers.push({
                id: teacher.user.id,
                name: teacher.user.name || 'Sin nombre',
                email: teacher.user.email,
                role: teacher.user.role as string
              })
            }
          })
        })
      }

      users = [
        ...admins.map(admin => ({
          id: admin.id,
          name: admin.name || 'Sin nombre',
          email: admin.email,
          role: admin.role as string
        })),
        ...teachers
      ]
    } else if (currentUserRole === 'STUDENT') {
      // Los estudiantes pueden ver sus profesores y administradores
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: currentUserId },
        include: {
          classes: {
            include: {
              class: {
                include: {
                  teacher: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          email: true,
                          role: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Obtener administradores
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })

      const teacherIds = new Set()
      const teachers: { id: string; name: string; email: string; role: string }[] = []

      if (studentProfile) {
        studentProfile.classes.forEach(enrollment => {
          const teacher = enrollment.class.teacher
          if (teacher && !teacherIds.has(teacher.user.id)) {
            teacherIds.add(teacher.user.id)
            teachers.push({
              id: teacher.user.id,
              name: teacher.user.name || 'Sin nombre',
              email: teacher.user.email,
              role: teacher.user.role as string
            })
          }
        })
      }

      users = [
        ...admins.map(admin => ({
          id: admin.id,
          name: admin.name || 'Sin nombre',
          email: admin.email,
          role: admin.role as string
        })),
        ...teachers
      ]
    }

    // Filtrar el usuario actual para que no pueda enviarse mensajes a sí mismo
    users = users.filter(user => user.id !== currentUserId)

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching messaging users:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}