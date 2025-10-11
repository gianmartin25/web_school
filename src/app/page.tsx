"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, MessageSquare, Bell, GraduationCap } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [session, status, router])

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

  if (session) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Sistema de Gestión Escolar
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Plataforma completa para la gestión de notas, asistencia, comunicación 
            entre padres y profesores, y seguimiento académico de estudiantes.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/signin">
                Iniciar Sesión
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/auth/signup">
                Registrarse
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                Gestión de Notas
              </CardTitle>
              <CardDescription>
                Sistema completo de calificaciones y seguimiento académico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Los profesores pueden registrar notas y los padres pueden ver 
                el progreso académico de sus hijos en tiempo real.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                Control de Asistencia
              </CardTitle>
              <CardDescription>
                Seguimiento detallado de la asistencia estudiantil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Registro diario de asistencia con notificaciones automáticas 
                a los padres sobre ausencias o tardanzas.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-purple-600" />
                Comunicación
              </CardTitle>
              <CardDescription>
                Mensajería directa entre padres y profesores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Sistema de mensajería integrado para mantener una comunicación 
                fluida sobre el progreso y comportamiento de los estudiantes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-orange-600" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Alertas automáticas para padres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Recibe notificaciones instantáneas sobre nuevas calificaciones, 
                ausencias, tareas y eventos importantes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-red-600" />
                Observaciones
              </CardTitle>
              <CardDescription>
                Seguimiento del comportamiento estudiantil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Los profesores pueden registrar observaciones sobre el 
                comportamiento y desempeño de los estudiantes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-indigo-600" />
                Roles de Usuario
              </CardTitle>
              <CardDescription>
                Acceso personalizado según el tipo de usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Diferentes niveles de acceso para administradores, profesores, 
                padres y estudiantes con funcionalidades específicas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            ¿Listo para comenzar?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Únete a nuestra plataforma y mejora la comunicación escolar
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/auth/signin">
                Acceder al Sistema
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}