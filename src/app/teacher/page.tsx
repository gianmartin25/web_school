'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SidebarLayout } from '@/components/sidebar-layout'
import { 
  BookOpen, 
  Users, 
  Calendar,
  ClipboardCheck,
  Clock,
  UserCheck,
  UserX,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface ClassSummary {
  id: string
  name: string
  subject: {
    id: string
    name: string
    code: string
  }
  grade: string
  section: string
  academicYear: string
  totalStudents: number
  hasAttendanceToday: boolean
  attendanceCount: number
}

interface DashboardStats {
  totalClasses: number
  totalStudents: number
  classesWithAttendance: number
  pendingAttendance: number
}

export default function TeacherDashboard() {
  const { data: session } = useSession()
  const [todayClasses, setTodayClasses] = useState<ClassSummary[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    classesWithAttendance: 0,
    pendingAttendance: 0
  })
  const [loading, setLoading] = useState(true)
  const [currentDate] = useState(new Date().toISOString().split('T')[0])

  const fetchTodayClasses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/classes/today?date=${currentDate}`)
      
      if (response.ok) {
        const data = await response.json()
        setTodayClasses(data.classes || [])
        
        // Calcular estadísticas
        const totalStudents = data.classes.reduce((sum: number, cls: ClassSummary) => sum + cls.totalStudents, 0)
        
        setStats({
          totalClasses: data.totalClasses || 0,
          totalStudents,
          classesWithAttendance: data.classesWithAttendance || 0,
          pendingAttendance: (data.totalClasses || 0) - (data.classesWithAttendance || 0)
        })
      } else {
        console.error('Error fetching today classes:', response.status)
      }
    } catch (error) {
      console.error('Error fetching today classes:', error)
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    if (session?.user?.role === 'TEACHER') {
      fetchTodayClasses()
    }
  }, [session, fetchTodayClasses])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (session?.user?.role !== 'TEACHER') {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Acceso denegado. Solo profesores pueden acceder a esta página.</p>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard del Profesor</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {session?.user?.name} - {formatDate(currentDate)}
            </p>
          </div>
          <Link href="/teacher/attendance">
            <Button className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Registrar Asistencia
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clases de Hoy</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
              <p className="text-xs text-gray-600">
                Total de clases programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-gray-600">
                Total de estudiantes hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia Registrada</CardTitle>
              <UserCheck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.classesWithAttendance}</div>
              <p className="text-xs text-gray-600">
                Clases con asistencia tomada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingAttendance}</div>
              <p className="text-xs text-gray-600">
                Clases sin registrar asistencia
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Clases de Hoy
              </CardTitle>
              <Badge variant="outline">
                {todayClasses.length} clases
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Cargando clases...</span>
              </div>
            ) : todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases programadas</h3>
                <p className="text-gray-600">No tienes clases asignadas para hoy.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {classItem.subject.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {classItem.grade} - {classItem.section} • {classItem.subject.code}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Users className="w-4 h-4" />
                              {classItem.totalStudents} estudiantes
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {classItem.academicYear}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {classItem.hasAttendanceToday ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Asistencia Registrada
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                      
                      <Link href={`/teacher/attendance?classId=${classItem.id}&date=${currentDate}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          {classItem.hasAttendanceToday ? (
                            <>
                              <ClipboardCheck className="w-4 h-4" />
                              Ver Asistencia
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Tomar Asistencia
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/teacher/classes">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Mis Clases</h3>
                    <p className="text-sm text-gray-600">Ver todas las clases asignadas</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/teacher/students">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Mis Estudiantes</h3>
                    <p className="text-sm text-gray-600">Ver lista de estudiantes</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/teacher/attendance">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Registro de Asistencia</h3>
                    <p className="text-sm text-gray-600">Gestionar asistencias</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/grades">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Calificaciones</h3>
                    <p className="text-sm text-gray-600">Gestionar notas</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/profile">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Mi Perfil</h3>
                    <p className="text-sm text-gray-600">Configurar cuenta</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}