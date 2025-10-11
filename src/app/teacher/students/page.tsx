"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Search,
  Eye,
  MessageSquare,
  FileText,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  grade: string
  section: string
  classes: string[]
  currentGrade: number
  attendanceRate: number
  lastActivity: string
  status: string
  parentName: string
  parentEmail: string
  enrollmentDate: string
  notes: string
  behaviorScore: number
  homeworkCompletion: number
}

export default function TeacherStudents() {
  const { data: session, status } = useSession()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teacher/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los estudiantes',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast({
        title: 'Error',
        description: 'Error de conexión al cargar estudiantes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const filterStudents = useCallback(() => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (gradeFilter && gradeFilter !== "all") {
      filtered = filtered.filter(student => student.grade === gradeFilter)
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(student => student.status === statusFilter)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, gradeFilter, statusFilter])

  useEffect(() => {
    if (session?.user?.role === 'TEACHER') {
      fetchStudents()
    }
  }, [session, fetchStudents])

  useEffect(() => {
    filterStudents()
  }, [filterStudents])

  // Obtener grados únicos para el filtro
  const uniqueGrades = [...new Set(students.map(student => student.grade))]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Inactivo</Badge>
      case "attention":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Atención</Badge>
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

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return "text-green-600"
    if (rate >= 85) return "text-blue-600"
    if (rate >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  if (status === "loading" || loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando estudiantes...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (!session || session.user.role !== "TEACHER") {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mis Estudiantes</h1>
          <p className="text-green-100">
            Gestiona y supervisa el progreso de todos tus estudiantes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Todas las clases</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.length > 0 
                  ? (students.reduce((sum, student) => sum + student.currentGrade, 0) / students.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-xs text-muted-foreground">Calificaciones</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.length > 0 
                  ? Math.round(students.reduce((sum, student) => sum + student.attendanceRate, 0) / students.length)
                  : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">De todas las clases</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requieren Atención</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter(s => s.status === 'attention' || s.currentGrade < 7 || s.attendanceRate < 85).length}
              </div>
              <p className="text-xs text-muted-foreground">Estudiantes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
            <CardDescription>
              Encuentra estudiantes específicos usando los filtros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  {uniqueGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="attention">Atención</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || (gradeFilter && gradeFilter !== "all") || (statusFilter && statusFilter !== "all")) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setGradeFilter("all")
                    setStatusFilter("all")
                  }}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lista de Estudiantes
              </span>
              <Badge variant="outline">
                {filteredStudents.length} estudiantes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
                <p className="text-gray-600">
                  {students.length === 0 
                    ? 'No tienes estudiantes asignados aún.' 
                    : 'No se encontraron estudiantes que coincidan con los filtros.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Grado</TableHead>
                      <TableHead>Clases</TableHead>
                      <TableHead>Calificación</TableHead>
                      <TableHead>Asistencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {student.studentId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{student.grade}</div>
                          <div className="text-sm text-gray-500">Sección {student.section}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.classes.slice(0, 2).map((className, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {className}
                              </Badge>
                            ))}
                            {student.classes.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{student.classes.length - 2} más
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-bold ${getGradeColor(student.currentGrade)}`}>
                            {student.currentGrade.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${getAttendanceColor(student.attendanceRate)}`}>
                            {student.attendanceRate}%
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(student.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
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
      </div>
    </SidebarLayout>
  )
}