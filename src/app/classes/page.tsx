'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Search, 
  Plus,
  Eye,
  Edit,
  UserCheck,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'

interface ClassData {
  id: string
  name: string
  subject: {
    id: string
    name: string
    code: string
  }
  teacher: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  grade: string
  section: string
  academicYear: string
  capacity: number
  studentCount: number
  schedule?: string
  classroom?: string
  isActive: boolean
  stats?: {
    averageGrade: number
    attendanceRate: number
  }
}

export default function ClassesPage() {
  const { data: session } = useSession()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar clases desde la API
  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/classes')
        
        if (!response.ok) {
          throw new Error('Error al cargar las clases')
        }
        
        const data = await response.json()
        setClasses(data.classes || [])
        setFilteredClasses(data.classes || [])
      } catch (error) {
        console.error('Error fetching classes:', error)
        setError('Error al cargar las clases')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchClasses()
    }
  }, [session])

  // Filtrar clases
  useEffect(() => {
    const filtered = classes.filter(classItem => {
      const teacherName = classItem.teacher 
        ? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
        : 'Sin profesor'
      
      const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classItem.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacherName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesGrade = gradeFilter === 'all' || classItem.grade === gradeFilter
      const matchesSubject = subjectFilter === 'all' || classItem.subject.code === subjectFilter

      return matchesSearch && matchesGrade && matchesSubject
    })

    setFilteredClasses(filtered)
  }, [searchTerm, gradeFilter, subjectFilter, classes])

  // Get unique grades and subjects for filters
  const uniqueGrades = [...new Set(classes.map(c => c.grade))].sort()
  const uniqueSubjects = [...new Set(classes.map(c => c.subject.code))].sort()

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 18) return 'text-green-600'
    if (grade >= 14) return 'text-blue-600'
    if (grade >= 11) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando clases...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gestión de Clases
          </h1>
          <p className="text-gray-600 mt-2">
            Administra y supervisa todas las clases del centro educativo
          </p>
        </div>
        
        {session?.user?.role === 'ADMIN' && (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Clase
          </Button>
        )}
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clases</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.reduce((acc, c) => acc + c.studentCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio General</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classes.length > 0 ? Math.round(classes.reduce((acc, c) => acc + (c.stats?.averageGrade || 0), 0) / classes.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Asistencia Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(classes.reduce((acc, c) => acc + (c.stats?.attendanceRate || 0), 0) / classes.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, materia o profesor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueSubjects.map(code => (
                    <SelectItem key={code} value={code}>{code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClasses.map((classItem) => (
          <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{classItem.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{classItem.subject.code}</Badge>
                    <span>•</span>
                    <span>
                      {classItem.teacher 
                        ? `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
                        : 'Sin profesor asignado'
                      }
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Link href={`/classes/${classItem.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') && (
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{classItem.schedule || 'No definido'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>{classItem.classroom || 'No asignado'}</span>
                </div>
              </div>

              {/* Capacidad */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Capacidad</span>
                  <span className={`text-sm font-semibold ${getCapacityColor(classItem.studentCount, classItem.capacity)}`}>
                    {classItem.studentCount}/{classItem.capacity}
                  </span>
                </div>
                <Progress 
                  value={(classItem.studentCount / classItem.capacity) * 100} 
                  className="h-2"
                />
              </div>

              {/* Métricas */}
              {classItem.stats && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Promedio</p>
                    <p className={`text-lg font-bold ${getGradeColor(classItem.stats.averageGrade || 0)}`}>
                      {classItem.stats.averageGrade?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Asistencia</p>
                    <p className="text-lg font-bold text-blue-600">
                      {classItem.stats.attendanceRate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron clases</h3>
            <p className="text-gray-600">
              No hay clases que coincidan con los filtros seleccionados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}