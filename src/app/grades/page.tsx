"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  User,
  Edit,
  Eye
} from "lucide-react"

interface Grade {
  id: string
  value: number
  gradeType: string
  description?: string
  gradeDate: Date
  subject: {
    id: string
    name: string
    code: string
  }
  student: {
    id: string
    studentId: string
    firstName: string
    lastName: string
    grade: string
    section?: string
  }
  teacher: {
    id: string
    firstName: string
    lastName: string
  }
}

interface GradeStats {
  totalGrades: number
  averageGrade: number
  highestGrade: number
  lowestGrade: number
  gradeDistribution: {
    excellent: number // 9-10
    good: number      // 7-8.9
    average: number   // 5-6.9
    poor: number      // 0-4.9
  }
}

export default function GradesPage() {
  const { data: session, status } = useSession()
  const [grades, setGrades] = useState<Grade[]>([])
  const [stats, setStats] = useState<GradeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [gradeTypeFilter, setGradeTypeFilter] = useState("all")
  const [studentFilter, setStudentFilter] = useState("all")

  useEffect(() => {
    if (session) {
      fetchGrades()
    }
  }, [session])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/grades')
      if (response.ok) {
        const data = await response.json()
        setGrades(data.grades || [])
        setStats(data.stats || null)
      } else {
        console.error('Failed to fetch grades')
      }
    } catch (error) {
      console.error('Error fetching grades:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = 
      grade.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = subjectFilter === "all" || grade.subject.id === subjectFilter
    const matchesGradeType = gradeTypeFilter === "all" || grade.gradeType === gradeTypeFilter
    const matchesStudent = studentFilter === "all" || grade.student.id === studentFilter

    return matchesSearch && matchesSubject && matchesGradeType && matchesStudent
  })

  const getAvailableSubjects = () => {
    const subjects = [...new Set(grades.map(g => ({ id: g.subject.id, name: g.subject.name })))]
    return subjects.filter((subject, index, self) => 
      self.findIndex(s => s.id === subject.id) === index
    )
  }

  const getAvailableStudents = () => {
    if (session.user.role === "PARENT") return []
    const students = [...new Set(grades.map(g => ({ 
      id: g.student.id, 
      name: `${g.student.firstName} ${g.student.lastName}`,
      studentId: g.student.studentId
    })))]
    return students.filter((student, index, self) => 
      self.findIndex(s => s.id === student.id) === index
    )
  }

  const getGradeColor = (value: number) => {
    if (value >= 9) return "bg-green-600"
    if (value >= 7) return "bg-blue-600"
    if (value >= 5) return "bg-yellow-600"
    return "bg-red-600"
  }

  const getGradeIcon = (value: number) => {
    if (value >= 7) return <TrendingUp className="h-3 w-3" />
    return <TrendingDown className="h-3 w-3" />
  }

  const canManageGrades = session.user.role === "ADMIN" || session.user.role === "TEACHER"

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calificaciones</h1>
            <p className="text-gray-600">
              {session.user.role === "PARENT" ? "Calificaciones de tus hijos" :
               session.user.role === "TEACHER" ? "Gestiona las calificaciones de tus estudiantes" :
               "Supervisión general de calificaciones"}
            </p>
          </div>
          {canManageGrades && (
            <Button asChild>
              <Link href="/grades/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Calificación
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Calificaciones</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats.totalGrades}</div>
                <p className="text-xs text-blue-600 mt-1">
                  Evaluaciones registradas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Promedio General</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {stats.averageGrade.toFixed(1)}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Sobre 10 puntos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Mejor Calificación</CardTitle>
                <Award className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {stats.highestGrade.toFixed(1)}
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Calificación más alta
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Excelencia</CardTitle>
                <Award className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {Math.round((stats.gradeDistribution.excellent / stats.totalGrades) * 100)}%
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Calificaciones 9-10
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grade Distribution Chart */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Distribución de Calificaciones
              </CardTitle>
              <CardDescription>
                Análisis del rendimiento académico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-900">{stats.gradeDistribution.excellent}</div>
                  <div className="text-sm text-green-600">Excelente (9-10)</div>
                  <div className="text-xs text-green-500 mt-1">
                    {Math.round((stats.gradeDistribution.excellent / stats.totalGrades) * 100)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">{stats.gradeDistribution.good}</div>
                  <div className="text-sm text-blue-600">Bueno (7-8.9)</div>
                  <div className="text-xs text-blue-500 mt-1">
                    {Math.round((stats.gradeDistribution.good / stats.totalGrades) * 100)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-900">{stats.gradeDistribution.average}</div>
                  <div className="text-sm text-yellow-600">Regular (5-6.9)</div>
                  <div className="text-xs text-yellow-500 mt-1">
                    {Math.round((stats.gradeDistribution.average / stats.totalGrades) * 100)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-900">{stats.gradeDistribution.poor}</div>
                  <div className="text-sm text-red-600">Insuficiente (0-4.9)</div>
                  <div className="text-xs text-red-500 mt-1">
                    {Math.round((stats.gradeDistribution.poor / stats.totalGrades) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Estudiante, materia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Materia</label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las materias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las materias</SelectItem>
                    {getAvailableSubjects().map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={gradeTypeFilter} onValueChange={setGradeTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="ASSIGNMENT">Tarea</SelectItem>
                    <SelectItem value="QUIZ">Cuestionario</SelectItem>
                    <SelectItem value="EXAM">Examen</SelectItem>
                    <SelectItem value="PROJECT">Proyecto</SelectItem>
                    <SelectItem value="PARTICIPATION">Participación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {session.user.role !== "PARENT" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estudiante</label>
                  <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estudiantes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estudiantes</SelectItem>
                      {getAvailableStudents().map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.studentId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Acciones</label>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setSubjectFilter("all")
                    setGradeTypeFilter("all")
                    setStudentFilter("all")
                  }}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Calificaciones ({filteredGrades.length})
            </CardTitle>
            <CardDescription>
              Registro detallado de evaluaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Cargando calificaciones...</span>
              </div>
            ) : filteredGrades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No se encontraron calificaciones</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Materia</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Calificación</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Profesor</TableHead>
                      {canManageGrades && <TableHead>Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {grade.student.firstName} {grade.student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {grade.student.studentId} • {grade.student.grade}
                              {grade.student.section && ` - ${grade.student.section}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50">
                            {grade.subject.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50">
                            {grade.gradeType === "ASSIGNMENT" ? "Tarea" :
                             grade.gradeType === "QUIZ" ? "Cuestionario" :
                             grade.gradeType === "EXAM" ? "Examen" :
                             grade.gradeType === "PROJECT" ? "Proyecto" :
                             "Participación"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge className={getGradeColor(grade.value)}>
                              {grade.value.toFixed(1)}
                            </Badge>
                            {getGradeIcon(grade.value)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={grade.description}>
                            {grade.description || "Sin descripción"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{new Date(grade.gradeDate).toLocaleDateString('es-ES')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span>{grade.teacher.firstName} {grade.teacher.lastName}</span>
                          </div>
                        </TableCell>
                        {canManageGrades && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/grades/${grade.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              {session.user.role === "TEACHER" && (
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/grades/${grade.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}