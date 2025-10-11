'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  BookOpen, 
  Clock,
  MapPin,
  User,
  GraduationCap,
  UserCheck,
  MessageSquare,
  FileText,
  Plus,
  Search,
  ArrowLeft,
  MoreVertical,
  Mail,
  Phone
} from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email?: string
  averageGrade: number
  attendanceRate: number
  lastAttendance: string
  behaviorScore: number
}

interface ClassDetail {
  id: string
  name: string
  subject: {
    name: string
    code: string
    description: string
    credits: number
  }
  teacher: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  grade: string
  section: string
  academicYear: string
  maxStudents: number
  currentStudents: number
  schedule: string
  classroom: string
  averageGrade: number
  attendanceRate: number
  description?: string
  students: Student[]
  recentActivities: Array<{
    id: string
    type: string
    description: string
    date: string
  }>
}

export default function ClassDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])

  // Mock data - En producción esto vendría de una API
  useEffect(() => {
    const mockClassDetail: ClassDetail = {
      id: classId,
      name: 'Matemáticas 5to A',
      subject: {
        name: 'Matemáticas',
        code: 'MAT5',
        description: 'Matemáticas para 5to grado - Álgebra básica, geometría y estadística',
        credits: 4
      },
      teacher: {
        id: 'teacher1',
        firstName: 'María',
        lastName: 'García',
        email: 'maria.garcia@school.com',
        phone: '+34 600 111 222'
      },
      grade: '5to',
      section: 'A',
      academicYear: '2024-2025',
      maxStudents: 25,
      currentStudents: 22,
      schedule: 'Lunes, Miércoles y Viernes 8:00-9:00',
      classroom: 'Aula 101',
      averageGrade: 85,
      attendanceRate: 92,
      description: 'Esta clase se enfoca en desarrollar habilidades matemáticas fundamentales para estudiantes de 5to grado.',
      students: [
        {
          id: 'student1',
          studentId: 'S2024001',
          firstName: 'Pedro',
          lastName: 'Pérez',
          email: 'pedro.perez@student.school.com',
          averageGrade: 88,
          attendanceRate: 95,
          lastAttendance: '2024-10-08',
          behaviorScore: 9
        },
        {
          id: 'student2',
          studentId: 'S2024003',
          firstName: 'Sofia',
          lastName: 'Martínez',
          email: 'sofia.martinez@student.school.com',
          averageGrade: 92,
          attendanceRate: 98,
          lastAttendance: '2024-10-08',
          behaviorScore: 10
        },
        {
          id: 'student3',
          studentId: 'S2024005',
          firstName: 'Miguel',
          lastName: 'Santos',
          email: 'miguel.santos@student.school.com',
          averageGrade: 75,
          attendanceRate: 85,
          lastAttendance: '2024-10-07',
          behaviorScore: 7
        },
        {
          id: 'student4',
          studentId: 'S2024008',
          firstName: 'Carmen',
          lastName: 'López',
          email: 'carmen.lopez@student.school.com',
          averageGrade: 89,
          attendanceRate: 92,
          lastAttendance: '2024-10-08',
          behaviorScore: 8
        }
      ],
      recentActivities: [
        {
          id: '1',
          type: 'exam',
          description: 'Examen de álgebra básica aplicado',
          date: '2024-10-07'
        },
        {
          id: '2',
          type: 'homework',
          description: 'Tarea de geometría asignada',
          date: '2024-10-05'
        },
        {
          id: '3',
          type: 'grade',
          description: 'Calificaciones del proyecto grupal publicadas',
          date: '2024-10-03'
        }
      ]
    }

    setTimeout(() => {
      setClassDetail(mockClassDetail)
      setFilteredStudents(mockClassDetail.students)
      setLoading(false)
    }, 1000)
  }, [classId])

  // Filtrar estudiantes
  useEffect(() => {
    if (classDetail) {
      const filtered = classDetail.students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredStudents(filtered)
    }
  }, [searchTerm, classDetail])

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBehaviorColor = (score: number) => {
    if (score >= 9) return 'text-green-600'
    if (score >= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalles de la clase...</p>
        </div>
      </div>
    )
  }

  if (!classDetail) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Clase no encontrada</h1>
          <p className="text-gray-600 mb-4">La clase que buscas no existe o no tienes permisos para verla.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {classDetail.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {classDetail.subject.description}
            </p>
          </div>
        </div>
        
        {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Básica */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información de la Clase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Materia</p>
                  <p className="font-semibold">{classDetail.subject.name} ({classDetail.subject.code})</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Profesor</p>
                  <p className="font-semibold">{classDetail.teacher.firstName} {classDetail.teacher.lastName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Horario</p>
                  <p className="font-semibold">{classDetail.schedule}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Aula</p>
                  <p className="font-semibold">{classDetail.classroom}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Grado y Sección</p>
                  <p className="font-semibold">{classDetail.grade} - Sección {classDetail.section}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Capacidad</p>
                  <p className="font-semibold">{classDetail.currentStudents}/{classDetail.maxStudents} estudiantes</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Descripción</h4>
              <p className="text-gray-700">{classDetail.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Promedio de Clase</p>
                <p className={`text-3xl font-bold ${getGradeColor(classDetail.averageGrade)}`}>
                  {classDetail.averageGrade}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Asistencia Promedio</p>
                <p className="text-3xl font-bold text-green-600">{classDetail.attendanceRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Estudiantes Activos</p>
                <p className="text-3xl font-bold text-purple-600">{classDetail.currentStudents}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Información del Profesor */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Profesor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">
                {classDetail.teacher.firstName[0]}{classDetail.teacher.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {classDetail.teacher.firstName} {classDetail.teacher.lastName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {classDetail.teacher.email}
                </div>
                {classDetail.teacher.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {classDetail.teacher.phone}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contactar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con contenido adicional */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="activities">Actividades Recientes</TabsTrigger>
          <TabsTrigger value="schedule">Horario Detallado</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lista de Estudiantes</CardTitle>
                <CardDescription>
                  {filteredStudents.length} de {classDetail.students.length} estudiantes
                </CardDescription>
              </div>
              {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') && (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Estudiante
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{student.firstName} {student.lastName}</h4>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Promedio</p>
                        <p className={`font-semibold ${getGradeColor(student.averageGrade)}`}>
                          {student.averageGrade}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Asistencia</p>
                        <p className="font-semibold text-blue-600">{student.attendanceRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Comportamiento</p>
                        <p className={`font-semibold ${getBehaviorColor(student.behaviorScore)}`}>
                          {student.behaviorScore}/10
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/students/${student.id}`}>
                          Ver Perfil
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Actividades Recientes</CardTitle>
              <CardDescription>
                Últimas actividades realizadas en esta clase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classDetail.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{activity.description}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(activity.date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Horario Detallado</CardTitle>
              <CardDescription>
                Programación semanal de la clase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-center mb-2">Lunes</h4>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">8:00 - 9:00</p>
                      <p className="font-medium">Matemáticas</p>
                      <p className="text-sm text-gray-500">Aula 101</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-center mb-2">Miércoles</h4>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">8:00 - 9:00</p>
                      <p className="font-medium">Matemáticas</p>
                      <p className="text-sm text-gray-500">Aula 101</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-center mb-2">Viernes</h4>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">8:00 - 9:00</p>
                      <p className="font-medium">Matemáticas</p>
                      <p className="text-sm text-gray-500">Aula 101</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}