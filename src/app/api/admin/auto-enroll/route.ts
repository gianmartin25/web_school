import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Endpoint temporal para matricular automáticamente estudiantes en clases
// según su grado y sección
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Obtener todas las clases activas
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      include: {
        classStudents: true
      }
    })

    let totalEnrolled = 0
    const enrollmentDetails = []

    for (const classItem of classes) {
      // Obtener estudiantes que coincidan con el grado y sección de la clase
      const matchingStudents = await prisma.studentProfile.findMany({
        where: {
          gradeId: classItem.gradeId,
          sectionId: classItem.sectionId,
          isActive: true
        }
      })

      // Obtener IDs de estudiantes ya matriculados en esta clase
      const alreadyEnrolledIds = classItem.classStudents.map(cs => cs.studentId)

      // Filtrar estudiantes que no están matriculados
      const studentsToEnroll = matchingStudents.filter(
        student => !alreadyEnrolledIds.includes(student.id)
      )

      if (studentsToEnroll.length > 0) {
        // Matricular estudiantes en la clase
        await prisma.classStudent.createMany({
          data: studentsToEnroll.map(student => ({
            classId: classItem.id,
            studentId: student.id
          }))
        })

        totalEnrolled += studentsToEnroll.length
        enrollmentDetails.push({
          className: classItem.name,
          classId: classItem.id,
          studentsEnrolled: studentsToEnroll.length,
          studentNames: studentsToEnroll.map(s => `${s.firstName} ${s.lastName}`)
        })
      }
    }

    return NextResponse.json({
      message: 'Matriculación automática completada',
      totalEnrolled,
      classesUpdated: enrollmentDetails.length,
      details: enrollmentDetails
    })

  } catch (error) {
    console.error('Error en matriculación automática:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
