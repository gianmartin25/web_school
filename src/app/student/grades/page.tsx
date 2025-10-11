"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  TrendingUp,
  Award,
  Target,
} from "lucide-react"

export default function StudentGrades() {
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

  // Datos de ejemplo para el estudiante
  const grades = [
    { subject: "Matemáticas", period1: 95, period2: 92, period3: 88, average: 91.7, teacher: "Prof. María González" },
    { subject: "Español", period1: 88, period2: 90, period3: 85, average: 87.7, teacher: "Prof. Ana Martínez" },
    { subject: "Ciencias", period1: 92, period2: 95, period3: 94, average: 93.7, teacher: "Prof. Carlos Rodríguez" },
    { subject: "Historia", period1: 85, period2: 87, period3: 89, average: 87.0, teacher: "Prof. Luis Fernández" },
    { subject: "Arte", period1: 96, period2: 94, period3: 98, average: 96.0, teacher: "Prof. Carmen Silva" },
  ]

  const overallAverage = grades.reduce((sum, grade) => sum + grade.average, 0) / grades.length

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "bg-green-500"
    if (grade >= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getGradeBadgeVariant = (grade: number) => {
    if (grade >= 90) return "default"
    if (grade >= 80) return "secondary"
    return "destructive"
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mis Calificaciones</h1>
          <p className="text-blue-100">
            Consulta tu rendimiento académico por materia y período
          </p>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {overallAverage.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Excelente rendimiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mejor Materia</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Arte</div>
              <p className="text-xs text-muted-foreground">
                Promedio: 96.0
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materias Aprobadas</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">5/5</div>
              <p className="text-xs text-muted-foreground">
                100% aprobado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Académica</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92.0</div>
              <Progress value={(overallAverage / 92) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                ¡Meta alcanzada!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Calificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Calificaciones por Materia</CardTitle>
            <CardDescription>
              Detalle de calificaciones por período académico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Materia</TableHead>
                  <TableHead>Profesor</TableHead>
                  <TableHead className="text-center">Período 1</TableHead>
                  <TableHead className="text-center">Período 2</TableHead>
                  <TableHead className="text-center">Período 3</TableHead>
                  <TableHead className="text-center">Promedio</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{grade.subject}</TableCell>
                    <TableCell className="text-sm text-gray-600">{grade.teacher}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getGradeBadgeVariant(grade.period1)}>
                        {grade.period1}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getGradeBadgeVariant(grade.period2)}>
                        {grade.period2}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getGradeBadgeVariant(grade.period3)}>
                        {grade.period3}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Badge variant={getGradeBadgeVariant(grade.average)} className="text-white">
                          {grade.average.toFixed(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${getGradeColor(grade.average)}`}></div>
                        <span className="ml-2 text-sm">
                          {grade.average >= 70 ? "Aprobado" : "Reprobado"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Progreso por Materia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {grades.map((grade, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{grade.subject}</CardTitle>
                <CardDescription>Progreso durante el año</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Período 1</span>
                    <span className="font-medium">{grade.period1}</span>
                  </div>
                  <Progress value={grade.period1} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Período 2</span>
                    <span className="font-medium">{grade.period2}</span>
                  </div>
                  <Progress value={grade.period2} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Período 3</span>
                    <span className="font-medium">{grade.period3}</span>
                  </div>
                  <Progress value={grade.period3} className="h-2" />
                  
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Promedio</span>
                    <Badge variant={getGradeBadgeVariant(grade.average)}>
                      {grade.average.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarLayout>
  )
}