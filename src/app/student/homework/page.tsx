"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
} from "lucide-react"

export default function StudentHomework() {
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

  // Tareas de ejemplo
  const homework = [
    {
      id: 1,
      title: "Ejercicios de Álgebra",
      subject: "Matemáticas",
      teacher: "Prof. María García",
      description: "Resolver ejercicios del capítulo 5, páginas 85-90",
      dueDate: new Date("2024-10-10"),
      status: "pending",
      priority: "high",
      estimatedTime: "2 horas",
      attachments: ["ejercicios_algebra.pdf"]
    },
    {
      id: 2,
      title: "Ensayo sobre el Sistema Solar",
      subject: "Ciencias Naturales",
      teacher: "Prof. Ana Rodríguez",
      description: "Escribir un ensayo de 500 palabras sobre los planetas del sistema solar",
      dueDate: new Date("2024-10-12"),
      status: "in-progress",
      priority: "medium",
      estimatedTime: "3 horas",
      attachments: []
    },
    {
      id: 3,
      title: "Lectura Comprensiva",
      subject: "Lengua Española",
      teacher: "Prof. Carlos López",
      description: "Leer el cuento 'El Principito' capítulos 1-5 y responder cuestionario",
      dueDate: new Date("2024-10-08"),
      status: "completed",
      priority: "medium",
      estimatedTime: "1.5 horas",
      attachments: ["cuestionario_principito.pdf"]
    },
    {
      id: 4,
      title: "Investigación sobre la Independencia",
      subject: "Historia",
      teacher: "Prof. Luis Fernández",
      description: "Investigar sobre los héroes de la independencia y crear una presentación",
      dueDate: new Date("2024-10-15"),
      status: "not-started",
      priority: "low",
      estimatedTime: "4 horas",
      attachments: ["guia_investigacion.docx"]
    },
    {
      id: 5,
      title: "Proyecto de Arte",
      subject: "Arte",
      teacher: "Prof. Carmen Silva",
      description: "Crear una pintura usando técnicas de acuarela",
      dueDate: new Date("2024-10-09"),
      status: "pending",
      priority: "high",
      estimatedTime: "2.5 horas",
      attachments: []
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completada</Badge>
      case "in-progress":
        return <Badge variant="secondary" className="bg-blue-600 text-white">En Progreso</Badge>
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-600 text-white">Pendiente</Badge>
      case "not-started":
        return <Badge variant="outline">No Iniciada</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>
      case "medium":
        return <Badge variant="secondary">Media</Badge>
      case "low":
        return <Badge variant="outline">Baja</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const pendingHomework = homework.filter(hw => hw.status !== "completed")
  const completedHomework = homework.filter(hw => hw.status === "completed")

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mis Tareas</h1>
          <p className="text-orange-100">
            Gestiona y consulta todas tus tareas escolares
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tareas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{homework.length}</div>
              <p className="text-xs text-muted-foreground">Asignadas este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingHomework.length}</div>
              <p className="text-xs text-muted-foreground">Por completar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedHomework.length}</div>
              <p className="text-xs text-muted-foreground">Terminadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {homework.filter(hw => isOverdue(hw.dueDate) && hw.status !== "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tareas Urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Tareas Urgentes</span>
            </CardTitle>
            <CardDescription>Tareas que vencen pronto o están atrasadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {homework
                .filter(hw => hw.status !== "completed" && (getDaysUntilDue(hw.dueDate) <= 2 || isOverdue(hw.dueDate)))
                .map((hw) => (
                  <div key={hw.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(hw.status)}
                      <div>
                        <h4 className="font-medium">{hw.title}</h4>
                        <p className="text-sm text-gray-600">{hw.subject} - {hw.teacher}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {isOverdue(hw.dueDate) 
                          ? `Vencida hace ${Math.abs(getDaysUntilDue(hw.dueDate))} días`
                          : `Vence en ${getDaysUntilDue(hw.dueDate)} días`
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              {homework.filter(hw => hw.status !== "completed" && (getDaysUntilDue(hw.dueDate) <= 2 || isOverdue(hw.dueDate))).length === 0 && (
                <p className="text-center text-gray-500 py-4">No tienes tareas urgentes 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista Completa de Tareas */}
        <Card>
          <CardHeader>
            <CardTitle>Todas las Tareas</CardTitle>
            <CardDescription>Lista completa de tareas asignadas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarea</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Profesor</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tiempo Estimado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homework.map((hw) => (
                  <TableRow key={hw.id} className={isOverdue(hw.dueDate) && hw.status !== "completed" ? "bg-red-50" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{hw.title}</p>
                        <p className="text-sm text-gray-600">{hw.description}</p>
                        {hw.attachments.length > 0 && (
                          <div className="flex items-center mt-1 text-xs text-blue-600">
                            <FileText className="h-3 w-3 mr-1" />
                            {hw.attachments.length} archivo(s)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{hw.subject}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {hw.teacher}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {hw.dueDate.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      {getDaysUntilDue(hw.dueDate) >= 0 && hw.status !== "completed" && (
                        <p className="text-xs text-gray-500">
                          {getDaysUntilDue(hw.dueDate) === 0 ? "Hoy" : `${getDaysUntilDue(hw.dueDate)} días`}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{getPriorityBadge(hw.priority)}</TableCell>
                    <TableCell>{getStatusBadge(hw.status)}</TableCell>
                    <TableCell>{hw.estimatedTime}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {hw.status !== "completed" && (
                          <Button size="sm" variant="outline">
                            Marcar Completa
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          Ver Detalles
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}