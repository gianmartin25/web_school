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
  Users,
  Plus,
  Search,
  Filter,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  Edit,
  Eye,
  Trash2
} from "lucide-react"

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth: Date
  grade: string
  section?: string
  enrollmentDate: Date
  isActive: boolean
  class?: {
    id: string
    name: string
    grade: string
    section: string
  }
  parents?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }[]
}

export default function StudentsPage() {
  const { data: session, status } = useSession()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [sectionFilter, setSectionFilter] = useState("all")

  useEffect(() => {
    if (session) {
      fetchStudents()
    }
  }, [session])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      } else {
        console.error('Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
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

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter
    const matchesSection = sectionFilter === "all" || student.section === sectionFilter

    return matchesSearch && matchesGrade && matchesSection
  })

  const getAvailableGrades = () => {
    const grades = [...new Set(students.map(s => s.grade))].sort()
    return grades
  }

  const getAvailableSections = () => {
    const sections = [...new Set(students.map(s => s.section).filter(Boolean))].sort()
    return sections
  }

  const canManageStudents = session.user.role === "ADMIN" || session.user.role === "TEACHER"

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
            <p className="text-gray-600">
              {session.user.role === "PARENT" ? "Información de tus hijos" :
               session.user.role === "TEACHER" ? "Gestiona tus estudiantes" :
               "Gestiona todos los estudiantes del sistema"}
            </p>
          </div>
          {canManageStudents && (
            <Button asChild>
              <Link href="/students/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Estudiante
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{students.length}</div>
              <p className="text-xs text-blue-600 mt-1">
                {students.filter(s => s.isActive).length} activos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Grados</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{getAvailableGrades().length}</div>
              <p className="text-xs text-green-600 mt-1">
                Niveles académicos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Nuevos este Mes</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {students.filter(s => {
                  const enrollmentDate = new Date(s.enrollmentDate)
                  const now = new Date()
                  return enrollmentDate.getMonth() === now.getMonth() && 
                         enrollmentDate.getFullYear() === now.getFullYear()
                }).length}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Matrículas recientes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Promedio Edad</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {students.length > 0 ? Math.round(
                  students.reduce((acc, s) => {
                    const age = new Date().getFullYear() - new Date(s.dateOfBirth).getFullYear()
                    return acc + age
                  }, 0) / students.length
                ) : 0}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Años de edad
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Nombre, ID, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Grado</label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los grados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los grados</SelectItem>
                    {getAvailableGrades().map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sección</label>
                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las secciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las secciones</SelectItem>
                    {getAvailableSections().map((section) => (
                      <SelectItem key={section} value={section!}>
                        Sección {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Acciones</label>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setGradeFilter("all")
                    setSectionFilter("all")
                  }}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Estudiantes ({filteredStudents.length})
            </CardTitle>
            <CardDescription>
              Información detallada de todos los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Cargando estudiantes...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No se encontraron estudiantes</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Estudiante</TableHead>
                      <TableHead>Nombre Completo</TableHead>
                      <TableHead>Grado/Sección</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Matrícula</TableHead>
                      {canManageStudents && <TableHead>Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">
                          {student.studentId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.email && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {student.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="bg-blue-50">
                              {student.grade}
                            </Badge>
                            {student.section && (
                              <Badge variant="outline" className="bg-purple-50">
                                Sección {student.section}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {student.phone && (
                              <div className="flex items-center text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {student.phone}
                              </div>
                            )}
                            {student.parents && student.parents.length > 0 && (
                              <div className="text-gray-500">
                                Padre: {student.parents[0].firstName} {student.parents[0].lastName}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.isActive ? "default" : "secondary"}
                            className={student.isActive ? "bg-green-600" : ""}
                          >
                            {student.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(student.enrollmentDate).toLocaleDateString('es-ES')}
                        </TableCell>
                        {canManageStudents && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/students/${student.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/students/${student.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              {session.user.role === "ADMIN" && (
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
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