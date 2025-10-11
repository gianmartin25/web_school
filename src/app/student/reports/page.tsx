"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
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
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  Download,
  Target,
  BookOpen,
  Clock,
  Users,
} from "lucide-react"

export default function StudentReports() {
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

  // Datos de ejemplo
  const academicSummary = {
    overallGPA: 8.7,
    totalSubjects: 8,
    currentRank: 3,
    totalStudents: 28,
    attendanceRate: 96.5,
    improvementTrend: "+0.3"
  }

  const subjectPerformance = [
    { 
      subject: "Matemáticas", 
      grade: 9.2, 
      trend: "up", 
      improvement: "+0.5",
      teacher: "Prof. María García",
      assignments: 12,
      completed: 11
    },
    { 
      subject: "Lengua y Literatura", 
      grade: 8.8, 
      trend: "up", 
      improvement: "+0.2",
      teacher: "Prof. Carlos López",
      assignments: 8,
      completed: 8
    },
    { 
      subject: "Ciencias Naturales", 
      grade: 8.5, 
      trend: "up", 
      improvement: "+0.4",
      teacher: "Prof. Ana Rodríguez",
      assignments: 10,
      completed: 9
    },
    { 
      subject: "Historia", 
      grade: 8.3, 
      trend: "stable", 
      improvement: "0.0",
      teacher: "Prof. Luis Martínez",
      assignments: 6,
      completed: 6
    },
    { 
      subject: "Inglés", 
      grade: 9.0, 
      trend: "up", 
      improvement: "+0.3",
      teacher: "Prof. Sarah Johnson",
      assignments: 9,
      completed: 9
    },
    { 
      subject: "Educación Física", 
      grade: 9.5, 
      trend: "stable", 
      improvement: "0.0",
      teacher: "Prof. Roberto Silva",
      assignments: 4,
      completed: 4
    },
    { 
      subject: "Arte", 
      grade: 8.0, 
      trend: "down", 
      improvement: "-0.2",
      teacher: "Prof. Carmen Silva",
      assignments: 5,
      completed: 4
    },
    { 
      subject: "Informática", 
      grade: 8.9, 
      trend: "up", 
      improvement: "+0.6",
      teacher: "Prof. Diego Torres",
      assignments: 7,
      completed: 7
    }
  ]

  const monthlyProgress = [
    { month: "Enero", gpa: 8.2, attendance: 94 },
    { month: "Febrero", gpa: 8.1, attendance: 96 },
    { month: "Marzo", gpa: 8.3, attendance: 95 },
    { month: "Abril", gpa: 8.5, attendance: 97 },
    { month: "Mayo", gpa: 8.4, attendance: 96 },
    { month: "Junio", gpa: 8.6, attendance: 98 },
    { month: "Julio", gpa: 8.7, attendance: 96 },
    { month: "Agosto", gpa: 8.7, attendance: 97 },
    { month: "Septiembre", gpa: 8.7, attendance: 96 }
  ]

  const achievements = [
    {
      title: "Estudiante del Mes",
      description: "Excelente rendimiento en septiembre",
      date: "Septiembre 2024",
      type: "academic"
    },
    {
      title: "Mejor Ensayo - Literatura",
      description: "Análisis de 'El Principito'",
      date: "Agosto 2024",
      type: "subject"
    },
    {
      title: "100% Asistencia",
      description: "Asistencia perfecta en julio",
      date: "Julio 2024",
      type: "attendance"
    },
    {
      title: "Olimpiadas de Matemáticas",
      description: "Clasificado para competencia regional",
      date: "Junio 2024",
      type: "competition"
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-600"
    if (grade >= 8) return "text-blue-600"
    if (grade >= 7) return "text-yellow-600"
    return "text-red-600"
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "academic":
        return <Award className="h-5 w-5 text-yellow-500" />
      case "subject":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "attendance":
        return <Clock className="h-5 w-5 text-green-500" />
      case "competition":
        return <Target className="h-5 w-5 text-purple-500" />
      default:
        return <Award className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Reportes Académicos</h1>
          <p className="text-green-100">
            Análisis detallado de tu rendimiento académico
          </p>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{academicSummary.overallGPA}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {academicSummary.improvementTrend} este período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking de Clase</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {academicSummary.currentRank}° / {academicSummary.totalStudents}
              </div>
              <p className="text-xs text-muted-foreground">Posición en el curso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{academicSummary.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground">Este semestre</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materias</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{academicSummary.totalSubjects}</div>
              <p className="text-xs text-muted-foreground">En curso</p>
            </CardContent>
          </Card>
        </div>

        {/* Rendimiento por Materia */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Rendimiento por Materia</CardTitle>
                <CardDescription>Calificaciones y tendencias de cada asignatura</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Materia</TableHead>
                  <TableHead>Profesor</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Tendencia</TableHead>
                  <TableHead>Tareas</TableHead>
                  <TableHead>Progreso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectPerformance.map((subject, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{subject.subject}</TableCell>
                    <TableCell>{subject.teacher}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-semibold ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                        <Badge 
                          variant={subject.trend === "up" ? "default" : subject.trend === "down" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {subject.improvement}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(subject.trend)}
                        <span className="text-sm text-gray-600 capitalize">{subject.trend}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {subject.completed}/{subject.assignments}
                        <div className="text-xs text-gray-500">completadas</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-20">
                        <Progress 
                          value={(subject.completed / subject.assignments) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round((subject.completed / subject.assignments) * 100)}%
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Progreso Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso Mensual</CardTitle>
            <CardDescription>Evolución del promedio y asistencia a lo largo del año</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyProgress.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium">{month.month}</div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-sm text-gray-600">Promedio</div>
                        <div className={`text-lg font-semibold ${getGradeColor(month.gpa)}`}>
                          {month.gpa}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Asistencia</div>
                        <div className="text-lg font-semibold text-purple-600">{month.attendance}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-20">
                      <Progress value={month.gpa * 10} className="h-2" />
                    </div>
                    <div className="w-20">
                      <Progress value={month.attendance} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logros y Reconocimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Logros y Reconocimientos</span>
            </CardTitle>
            <CardDescription>Tus destacados del año académico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex-shrink-0">
                    {getAchievementIcon(achievement.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{achievement.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes Disponibles</CardTitle>
            <CardDescription>Descarga reportes detallados de tu rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <FileText className="h-6 w-6" />
                <span>Reporte Completo</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Análisis de Tendencias</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Award className="h-6 w-6" />
                <span>Certificado de Logros</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}