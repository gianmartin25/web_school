"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Users,
  GraduationCap,
  Award,
} from "lucide-react"

export default function StudentProfile() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "STUDENT") {
    redirect("/auth/signin")
  }

  // Datos de ejemplo del estudiante
  const studentData = {
    name: session.user.name || "Andrea Pérez López",
    email: session.user.email || "andrea.perez@student.school.com",
    studentId: "STU001",
    grade: "5° Grado",
    section: "A",
    age: 10,
    dateOfBirth: "2014-03-15",
    address: "Calle Principal 123, Ciudad Ejemplo",
    phone: "+1234567890",
    enrollmentDate: "2020-08-15",
    parent: {
      name: "Carmen López",
      email: "carmen.lopez@parent.school.com",
      phone: "+1234567891"
    },
    academicInfo: {
      overallAverage: 90.5,
      ranking: 3,
      totalStudents: 25,
      attendanceRate: 96.0,
      behavior: "Excelente"
    },
    achievements: [
      { title: "Estudiante del Mes", date: "Septiembre 2024", description: "Reconocimiento por excelencia académica" },
      { title: "Mejor Proyecto de Ciencias", date: "Agosto 2024", description: "Primer lugar en feria de ciencias" },
      { title: "Participación Destacada", date: "Julio 2024", description: "Participación en obra de teatro escolar" }
    ],
    subjects: [
      { name: "Matemáticas", teacher: "Prof. María González", grade: 95 },
      { name: "Español", teacher: "Prof. Ana Martínez", grade: 88 },
      { name: "Ciencias", teacher: "Prof. Carlos Rodríguez", grade: 92 },
      { name: "Historia", teacher: "Prof. Luis Fernández", grade: 85 },
      { name: "Arte", teacher: "Prof. Carmen Silva", grade: 96 }
    ]
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mi Perfil</h1>
          <p className="text-purple-100">
            Información personal y académica
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={session.user.image || ""} alt={studentData.name} />
                  <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
                    {studentData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{studentData.name}</CardTitle>
                <CardDescription>Estudiante · {studentData.studentId}</CardDescription>
                <div className="flex justify-center space-x-2 mt-2">
                  <Badge variant="default">{studentData.grade}</Badge>
                  <Badge variant="secondary">Sección {studentData.section}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{studentData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {new Date(studentData.dateOfBirth).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} ({studentData.age} años)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{studentData.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Inscrito desde {new Date(studentData.enrollmentDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Información del Padre/Tutor */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Padre/Tutor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{studentData.parent.name}</p>
                  <p className="text-sm text-gray-600">{studentData.parent.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{studentData.parent.phone}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información Académica */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rendimiento Académico */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento Académico</CardTitle>
                <CardDescription>Estadísticas de tu desempeño escolar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {studentData.academicInfo.overallAverage}
                    </div>
                    <p className="text-sm text-gray-600">Promedio General</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      #{studentData.academicInfo.ranking}
                    </div>
                    <p className="text-sm text-gray-600">Posición en Clase</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {studentData.academicInfo.attendanceRate}%
                    </div>
                    <p className="text-sm text-gray-600">Asistencia</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">
                      {studentData.academicInfo.behavior}
                    </div>
                    <p className="text-sm text-gray-600">Comportamiento</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Materias */}
            <Card>
              <CardHeader>
                <CardTitle>Mis Materias</CardTitle>
                <CardDescription>Calificaciones actuales por materia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-gray-600">{subject.teacher}</p>
                      </div>
                      <Badge 
                        variant={subject.grade >= 90 ? "default" : subject.grade >= 80 ? "secondary" : "destructive"}
                        className="text-lg px-3 py-1"
                      >
                        {subject.grade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Logros y Reconocimientos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Logros y Reconocimientos</span>
                </CardTitle>
                <CardDescription>Tus logros más destacados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Award className="h-5 w-5 text-yellow-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-yellow-800">{achievement.title}</h4>
                        <p className="text-sm text-yellow-700">{achievement.description}</p>
                        <p className="text-xs text-yellow-600 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}