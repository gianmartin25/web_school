"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InstitutionLogo } from "@/components/institution-logo"
import Link from "next/link"
import {
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  Activity,
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
    <SidebarLayout>
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
    </SidebarLayout>
  )
}

function ParentDashboard() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Mis Hijos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">2</div>
            <p className="text-xs text-blue-600 mt-1">
              Estudiantes activos
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">8.5</div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.3 este mes
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Asistencia</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">95%</div>
            <p className="text-xs text-emerald-600 mt-1">
              Este mes
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">3</div>
            <p className="text-xs text-purple-600 mt-1">
              Sin leer
            </p>
          </CardContent>
        </Card>
      </div>

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
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 card-hover animate-scaleIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Estudiantes</CardTitle>
            <div className="p-2 bg-blue-200 rounded-lg">
              <Users className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">45</div>
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              En mis clases
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 card-hover animate-scaleIn" style={{animationDelay: '0.1s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Clases</CardTitle>
            <div className="p-2 bg-green-200 rounded-lg">
              <BookOpen className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">3</div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              Asignaturas activas
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 card-hover animate-scaleIn" style={{animationDelay: '0.2s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Pendientes</CardTitle>
            <div className="p-2 bg-orange-200 rounded-lg">
              <Clock className="h-4 w-4 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">12</div>
            <p className="text-xs text-orange-600 mt-1 flex items-center">
              Tareas por calificar
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 card-hover animate-scaleIn" style={{animationDelay: '0.3s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Asistencia Hoy</CardTitle>
            <div className="p-2 bg-emerald-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">92%</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center">
              Estudiantes presentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Clases de Hoy
            </CardTitle>
            <CardDescription>Tu agenda del día</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Matemáticas - 5to A</p>
                  <p className="text-sm text-green-600">8:00 - 9:00 AM</p>
                </div>
              </div>
              <Badge className="bg-green-600">En curso</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Matemáticas - 5to B</p>
                  <p className="text-sm text-blue-600">10:00 - 11:00 AM</p>
                </div>
              </div>
              <Badge variant="outline">Próxima</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-purple-600" />
              Tareas Pendientes
            </CardTitle>
            <CardDescription>Actividades por completar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-red-50 to-red-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-red-700" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Calificar exámenes</p>
                  <p className="text-sm text-red-600">Matemáticas 5to A</p>
                </div>
              </div>
              <Badge variant="destructive">12 pendientes</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-yellow-200 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-yellow-700" />
                </div>
                <div>
                  <p className="font-medium text-yellow-900">Registrar asistencia</p>
                  <p className="text-sm text-yellow-600">Clase de hoy</p>
                </div>
              </div>
              <Badge className="bg-yellow-600">2 clases</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">342</div>
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12 este mes
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Profesores</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">24</div>
            <p className="text-xs text-purple-600 mt-1">Activos</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Asistencia General</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">94%</div>
            <p className="text-xs text-green-600 mt-1">Esta semana</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">8.2</div>
            <p className="text-xs text-orange-600 mt-1">Todas las materias</p>
          </CardContent>
        </Card>
      </div>

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Mis Calificaciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mis Calificaciones</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Matemáticas</span>
              <Badge variant="default">95</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Español</span>
              <Badge variant="default">88</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Ciencias</span>
              <Badge variant="default">92</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Historia</span>
              <Badge variant="secondary">85</Badge>
            </div>
          </div>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/student/grades">Ver todas las calificaciones</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Mi Asistencia */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mi Asistencia</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Asistencia Total</span>
              <Badge variant="default">96%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Días Presentes</span>
              <span className="text-sm font-medium">142</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Faltas</span>
              <span className="text-sm text-red-600">6</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tardanzas</span>
              <span className="text-sm text-yellow-600">3</span>
            </div>
          </div>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/student/attendance">Ver detalle de asistencia</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Próximas Actividades */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximas Actividades</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Examen de Matemáticas</p>
              <p className="text-xs text-gray-600">Mañana - 10:00 AM</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium">Proyecto de Ciencias</p>
              <p className="text-xs text-gray-600">Viernes - Entrega</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium">Presentación Historia</p>
              <p className="text-xs text-gray-600">Lunes - 2:00 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensajes Recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Prof. María González</p>
              <p className="text-xs text-gray-600">Recordatorio: Tarea de matemáticas para mañana</p>
              <p className="text-xs text-blue-600 mt-1">Hace 2 horas</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium">Prof. Carlos Rodríguez</p>
              <p className="text-xs text-gray-600">Excelente trabajo en el proyecto</p>
              <p className="text-xs text-blue-600 mt-1">Ayer</p>
            </div>
          </div>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/student/messages">Ver todos los mensajes</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Mi Rendimiento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mi Rendimiento</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Promedio General</span>
              <Badge variant="default" className="bg-green-600">90.0</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mejor Materia</span>
              <span className="text-sm text-green-600">Matemáticas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mejorar en</span>
              <span className="text-sm text-yellow-600">Historia</span>
            </div>
            <div className="p-2 bg-green-50 rounded text-center">
              <Award className="h-4 w-4 mx-auto text-green-600 mb-1" />
              <p className="text-xs text-green-600">¡Estudiante Destacado!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Acciones Rápidas</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/student/schedule">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Horario</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/student/homework">
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Tareas</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/student/profile">
                <Users className="h-6 w-6" />
                <span className="text-sm">Mi Perfil</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col space-y-2">
              <Link href="/student/resources">
                <Target className="h-6 w-6" />
                <span className="text-sm">Recursos</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}