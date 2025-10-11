"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BookOpen,
  Calendar,
  MessageSquare,
  Eye,
  Award,
  TrendingUp,
  CheckCircle,
  Clock,
  Bell,
} from "lucide-react"

export default function ParentChildren() {
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

  if (!session || session.user.role !== "PARENT") {
    redirect("/auth/signin")
  }

  // Datos de ejemplo
  const children = [
    {
      id: 1,
      studentId: "S2024001",
      firstName: "Pedro",
      lastName: "Pérez",
      grade: "5to",
      section: "A",
      age: 10,
      enrollmentDate: "2024-09-01",
      overallGrade: 8.7,
      attendanceRate: 96,
      behaviorScore: 9,
      subjects: [
        { name: "Matemáticas", grade: 8.9, teacher: "Prof. María García" },
        { name: "Lengua Española", grade: 8.5, teacher: "Prof. Carlos López" },
        { name: "Ciencias Naturales", grade: 8.8, teacher: "Prof. Ana Rodríguez" },
        { name: "Historia", grade: 8.6, teacher: "Prof. Luis Martínez" },
        { name: "Inglés", grade: 8.7, teacher: "Prof. Sarah Johnson" }
      ],
      recentActivities: [
        { type: "grade", description: "Nueva calificación en Matemáticas: 9.2", date: "2024-10-07", icon: BookOpen },
        { type: "attendance", description: "Asistió a todas las clases", date: "2024-10-07", icon: CheckCircle },
        { type: "message", description: "Mensaje de Prof. María García", date: "2024-10-06", icon: MessageSquare }
      ],
      upcomingEvents: [
        { event: "Examen de Ciencias", date: "2024-10-10", type: "exam" },
        { event: "Entrega proyecto Historia", date: "2024-10-12", type: "project" },
        { event: "Reunión de padres", date: "2024-10-15", type: "meeting" }
      ],
      status: "excellent"
    },
    {
      id: 2,
      studentId: "S2024002",
      firstName: "Ana",
      lastName: "Pérez",
      grade: "4to",
      section: "B",
      age: 9,
      enrollmentDate: "2024-09-01",
      overallGrade: 8.3,
      attendanceRate: 94,
      behaviorScore: 8,
      subjects: [
        { name: "Matemáticas", grade: 8.2, teacher: "Prof. Elena Ruiz" },
        { name: "Lengua Española", grade: 8.4, teacher: "Prof. Pedro Sánchez" },
        { name: "Ciencias Naturales", grade: 8.1, teacher: "Prof. Isabel Torres" },
        { name: "Historia", grade: 8.5, teacher: "Prof. Mario Vega" },
        { name: "Inglés", grade: 8.3, teacher: "Prof. Jennifer Brown" }
      ],
      recentActivities: [
        { type: "grade", description: "Calificación en Lengua Española: 8.6", date: "2024-10-06", icon: BookOpen },
        { type: "behavior", description: "Reconocimiento por ayudar a compañeros", date: "2024-10-05", icon: Award },
        { type: "attendance", description: "Llegó tarde el lunes", date: "2024-10-05", icon: Clock }
      ],
      upcomingEvents: [
        { event: "Presentación de lectura", date: "2024-10-09", type: "presentation" },
        { event: "Examen de Matemáticas", date: "2024-10-11", type: "exam" },
        { event: "Obra de teatro escolar", date: "2024-10-18", type: "event" }
      ],
      status: "good"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800">Excelente</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800">Bueno</Badge>
      case "needs_attention":
        return <Badge className="bg-yellow-100 text-yellow-800">Necesita atención</Badge>
      case "concern":
        return <Badge className="bg-red-100 text-red-800">Preocupante</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-600"
    if (grade >= 8) return "text-blue-600"
    if (grade >= 7) return "text-yellow-600"
    return "text-red-600"
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-red-100 text-red-800"
      case "project":
        return "bg-blue-100 text-blue-800"
      case "meeting":
        return "bg-purple-100 text-purple-800"
      case "presentation":
        return "bg-orange-100 text-orange-800"
      case "event":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "grade":
        return BookOpen
      case "attendance":
        return CheckCircle
      case "message":
        return MessageSquare
      case "behavior":
        return Award
      default:
        return Bell
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mis Hijos</h1>
          <p className="text-purple-100">
            Supervisa el progreso académico y desarrollo de tus hijos
          </p>
        </div>

        {/* Children Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" alt={`${child.firstName} ${child.lastName}`} />
                    <AvatarFallback className="text-xl">
                      {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{child.firstName} {child.lastName}</h3>
                      {getStatusBadge(child.status)}
                    </div>
                    <p className="text-gray-600">{child.grade} - Sección {child.section}</p>
                    <p className="text-sm text-gray-500">ID: {child.studentId}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Academic Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getGradeColor(child.overallGrade)}`}>
                      {child.overallGrade}
                    </div>
                    <div className="text-xs text-gray-500">Promedio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{child.attendanceRate}%</div>
                    <div className="text-xs text-gray-500">Asistencia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{child.behaviorScore}/10</div>
                    <div className="text-xs text-gray-500">Comportamiento</div>
                  </div>
                </div>

                {/* Subjects Performance */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Rendimiento por Materia</h4>
                  <div className="space-y-2">
                    {child.subjects.slice(0, 3).map((subject, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{subject.name}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={subject.grade * 10} className="w-20 h-2" />
                          <span className={`font-semibold ${getGradeColor(subject.grade)}`}>
                            {subject.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                    {child.subjects.length > 3 && (
                      <div className="text-center pt-2">
                        <Button variant="link" size="sm">
                          Ver todas las materias ({child.subjects.length})
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Actividad Reciente</h4>
                  <div className="space-y-2">
                    {child.recentActivities.slice(0, 3).map((activity, index) => {
                      const IconComponent = getActivityIcon(activity.type)
                      return (
                        <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                          <IconComponent className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Próximos Eventos</h4>
                  <div className="space-y-2">
                    {child.upcomingEvents.slice(0, 2).map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{event.event}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mensajes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Subjects Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento Detallado por Materias</CardTitle>
            <CardDescription>
              Calificaciones detalladas de todas las materias de tus hijos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Profesor</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Tendencia</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.flatMap(child =>
                  child.subjects.map((subject, index) => (
                    <TableRow key={`${child.id}-${index}`}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {child.firstName.charAt(0)}{child.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{child.firstName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.teacher}</TableCell>
                      <TableCell>
                        <span className={`text-lg font-semibold ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className={`h-4 w-4 ${subject.grade >= 8.5 ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className="text-sm text-gray-600">Estable</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comunicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensajes con Profesores
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Solicitar Reunión
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Configurar Alertas
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reportes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                Reporte de Calificaciones
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Reporte de Asistencia
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Reporte de Comportamiento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alertas Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Buen rendimiento</p>
                    <p className="text-xs text-gray-600">Pedro mantiene excelentes notas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Evento próximo</p>
                    <p className="text-xs text-gray-600">Reunión de padres el 15 de octubre</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}