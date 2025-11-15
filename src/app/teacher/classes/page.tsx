"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Users,
  Clock,
  Plus,
  Eye,
  Edit,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface ClassItem {
  id: string
  name: string
  subject: string
  grade: string
  section: string
  enrolledStudents: number
  maxStudents: number
  schedule: string
  room: string
  academicYear: string
  nextClass: string
  attendanceRate: number
  averageGrade: number
  status: string
}

interface UpcomingClass {
  className: string
  time: string
  room: string
  date: string
  topic: string
}

export default function TeacherClasses() {
  const { data: session, status } = useSession()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
        setUpcomingClasses(data.upcomingClasses || [])
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las clases',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast({
        title: 'Error',
        description: 'Error de conexión al cargar clases',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.role === 'TEACHER') {
      fetchClasses()
    }
  }, [session, fetchClasses])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activa</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completada</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clases...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "TEACHER") {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Acceso denegado. Solo profesores pueden acceder a esta página.</p>
        </div>
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Acceso denegado. Solo profesores pueden acceder a esta página.</p>
      </div>
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mis Clases</h1>
          <p className="text-blue-100">
            Administra todas tus clases y revisa el progreso académico
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clases</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Clases activas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.reduce((sum, cls) => sum + cls.enrolledStudents, 0)}
              </div>
              <p className="text-xs text-muted-foreground">En todas las clases</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.length > 0
                  ? (classes.reduce((sum, cls) => sum + cls.averageGrade, 0) / classes.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-xs text-muted-foreground">Todas las clases</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.length > 0
                  ? Math.round(classes.reduce((sum, cls) => sum + cls.attendanceRate, 0) / classes.length)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">Promedio general</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Classes */}
        {upcomingClasses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Clases
              </CardTitle>
              <CardDescription>
                Clases programadas para hoy y mañana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.map((upcomingClass, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg bg-blue-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          {upcomingClass.className}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {upcomingClass.topic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-900">
                        {upcomingClass.time}
                      </div>
                      <div className="text-sm text-blue-700">
                        {upcomingClass.room} • {upcomingClass.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Lista de Clases
              </CardTitle>
              <Button asChild>
                <Link href="/teacher/attendance">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Asistencia
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases asignadas</h3>
                <p className="text-gray-600">
                  No tienes clases asignadas aún. Contacta al administrador para más información.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clase</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Promedio</TableHead>
                      <TableHead>Asistencia</TableHead>
                      <TableHead>Próxima Clase</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{classItem.name}</div>
                            <div className="text-sm text-gray-500">
                              {classItem.subject} • {classItem.grade} {classItem.section}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{classItem.enrolledStudents}/{classItem.maxStudents}</span>
                          </div>
                          <Progress 
                            value={(classItem.enrolledStudents / classItem.maxStudents) * 100} 
                            className="w-20 mt-1"
                          />
                        </TableCell>
                        <TableCell>
                          <div className={`font-bold ${getGradeColor(classItem.averageGrade)}`}>
                            {classItem.averageGrade.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {classItem.attendanceRate >= 90 ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> :
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            }
                            <span className="font-medium">{classItem.attendanceRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(classItem.nextClass).toLocaleDateString('es-PE', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(classItem.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/teacher/attendance?classId=${classItem.id}`}>
                                <CheckCircle className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Performance Summary */}
        {classes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rendimiento por Clase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classes.slice(0, 5).map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{classItem.name}</div>
                        <div className="text-sm text-gray-500">
                          {classItem.enrolledStudents} estudiantes
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getGradeColor(classItem.averageGrade)}`}>
                          {classItem.averageGrade.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {classItem.attendanceRate}% asistencia
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximas Actividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Registrar asistencia diaria</div>
                      <div className="text-sm text-gray-500">Pendiente para hoy</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Revisar calificaciones</div>
                      <div className="text-sm text-gray-500">Evaluaciones pendientes</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">Comunicarse con padres</div>
                      <div className="text-sm text-gray-500">Estudiantes con bajo rendimiento</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
}