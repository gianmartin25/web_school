"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InstitutionLogo } from "@/components/institution-logo"
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"
// import { 
//   ParentMetricsOverview, 
//   AdminMetricsOverview, 
//   TeacherMetricsOverview, 
//   StudentMetricsOverview 
// } from "@/components/dashboard/metrics-cards"
import Link from "next/link"
import {
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  AlertTriangle,
  Clock,
  Target,
  Award,
  Settings
} from "lucide-react"

export default function Dashboard() {
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

  if (!session) {
    redirect("/auth/signin")
  }

  const getDashboardContent = () => {
    switch (session.user.role) {
      case "PARENT":
        return <ParentDashboard />
      case "TEACHER":
        return <TeacherDashboard />
      case "ADMIN":
        return <AdminDashboard />
      case "STUDENT":
        return <StudentDashboard />
      default:
        return <div>Rol no reconocido</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome header with institution branding */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="absolute top-0 right-0 opacity-10 animate-pulse">
          <InstitutionLogo width={120} height={120} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="animate-fadeIn">
            <InstitutionLogo width={80} height={80} className="flex-shrink-0 hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="animate-slideInLeft">
            <h1 className="text-2xl font-bold mb-2">
              I.E. 3024 José Antonio Encinas
            </h1>
            <h2 className="text-xl font-semibold mb-1">
              ¡Bienvenido, {session.user.name?.split(' ')[0] || 'Usuario'}!
            </h2>
            <p className="text-blue-100">
              {session.user.role === "PARENT" ? "Mantente al día con el progreso académico de tus hijos" : 
               session.user.role === "TEACHER" ? "Gestiona tus clases y estudiantes de manera eficiente" : 
               session.user.role === "STUDENT" ? "Accede a tus calificaciones, horarios y comunicaciones" :
               "Supervisa y administra todo el sistema escolar"}
            </p>
            <div className="mt-2 text-sm text-blue-200">
              <span className="font-medium">Honradez • Disciplina • Estudio • Trabajo</span>
            </div>
          </div>
        </div>
      </div>
      
      {getDashboardContent()}
    </div>
  )
}

function ParentDashboard() {
  const { loading, error } = useDashboardMetrics()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error cargando métricas: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      {/* TODO: Implementar ParentMetricsOverview con tipos correctos */}
      
      {/* Información detallada de hijos */}
      {/* TODO: Implementar información de hijos */}
      <Card>
        <CardHeader>
          <CardTitle>Información de mis hijos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Funcionalidad en desarrollo...</p>
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Latest grades - spans 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
              Últimas Calificaciones
            </CardTitle>
            <CardDescription>
              Calificaciones recientes de tus hijos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Pedro - Matemáticas</p>
                  <p className="text-sm text-green-600">Examen parcial • Hace 2 días</p>
                </div>
              </div>
              <Badge className="bg-green-600">9.0</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Ana - Historia</p>
                  <p className="text-sm text-blue-600">Tarea • Hace 3 días</p>
                </div>
              </div>
              <Badge className="bg-blue-600">8.5</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="font-medium text-purple-900">Pedro - Ciencias</p>
                  <p className="text-sm text-purple-600">Proyecto • Hace 5 días</p>
                </div>
              </div>
              <Badge className="bg-purple-600">9.5</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications and alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-orange-600" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Actualizaciones importantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 text-sm">Nueva calificación</p>
                <p className="text-xs text-blue-600 mt-1">Pedro recibió nota en Matemáticas</p>
                <p className="text-xs text-blue-500 mt-1">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 text-sm">Ausencia registrada</p>
                <p className="text-xs text-yellow-600 mt-1">Ana faltó a Historia ayer</p>
                <p className="text-xs text-yellow-500 mt-1">Ayer</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 text-sm">Mensaje del profesor</p>
                <p className="text-xs text-green-600 mt-1">Prof. García envió un mensaje</p>
                <p className="text-xs text-green-500 mt-1">Hace 1 día</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5 text-indigo-600" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/students">
                <Users className="h-6 w-6" />
                <span className="text-sm">Ver Hijos</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/grades">
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Calificaciones</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/attendance">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Asistencia</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/messages">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Mensajes</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TeacherDashboard() {
  const { loading, error } = useDashboardMetrics()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error cargando métricas: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      {/* TODO: Implementar TeacherMetricsOverview */}
      
      {/* Calificaciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Calificaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Funcionalidad en desarrollo...</p>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminDashboard() {
  const { loading, error } = useDashboardMetrics()
  
  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }
  
  if (error) {
    return <div className="text-red-500 text-center">Error cargando métricas</div>
  }
  
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      {/* TODO: Implementar AdminMetricsOverview */}

      {/* Admin content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
              Alertas del Sistema
            </CardTitle>
            <CardDescription>Notificaciones importantes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Ausencias elevadas</p>
                <p className="text-sm text-red-600 mt-1">5 estudiantes con más de 3 faltas esta semana</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">Tareas sin calificar</p>
                <p className="text-sm text-yellow-600 mt-1">45 evaluaciones pendientes en el sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-indigo-600" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>Gestión administrativa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
                <Link href="/students">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Estudiantes</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
                <Link href="/teachers">
                  <Award className="h-6 w-6" />
                  <span className="text-sm">Profesores</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
                <Link href="/reports">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Reportes</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 flex-col space-y-2">
                <Link href="/settings">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Configuración</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente para dashboard de estudiantes
function StudentDashboard() {
  const { loading, error } = useDashboardMetrics()
  
  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  }
  
  if (error) {
    return <div className="text-red-500 text-center">Error cargando métricas</div>
  }
  
  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      {/* TODO: Implementar StudentMetricsOverview */}
      
      {/* Calificaciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Calificaciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Funcionalidad en desarrollo...</p>
        </CardContent>
      </Card>
    </div>
  )
}