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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  User,
  Book,
  CalendarDays
} from "lucide-react"

interface AttendanceRecord {
  id: string
  date: Date
  status: string
  student: {
    id: string
    studentId: string
    firstName: string
    lastName: string
    grade: string
    section?: string
  }
  class: {
    id: string
    subject: {
      name: string
      code: string
    }
  }
  teacher: {
    id: string
    firstName: string
    lastName: string
  }
  notes?: string
}

interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number
  attendanceRate: number
}

export default function AttendancePage() {
  const { data: session, status } = useSession()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [studentFilter, setStudentFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    if (session) {
      fetchAttendance()
    }
  }, [session])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/attendance')
      if (response.ok) {
        const data = await response.json()
        setAttendanceRecords(data.records || [])
        setStats(data.stats || null)
      } else {
        console.error('Failed to fetch attendance')
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
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

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.class.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    const matchesSubject = subjectFilter === "all" || record.class.subject.name === subjectFilter
    const matchesStudent = studentFilter === "all" || record.student.id === studentFilter
    const matchesDate = !dateFilter || format(new Date(record.date), 'yyyy-MM-dd') === dateFilter

    return matchesSearch && matchesStatus && matchesSubject && matchesStudent && matchesDate
  })

  const getAvailableSubjects = () => {
    const subjects = [...new Set(attendanceRecords.map(r => r.class.subject.name))]
    return subjects.sort()
  }

  const getAvailableStudents = () => {
    if (session.user.role === "PARENT") return []
    const students = [...new Set(attendanceRecords.map(r => ({ 
      id: r.student.id, 
      name: `${r.student.firstName} ${r.student.lastName}`,
      studentId: r.student.studentId
    })))]
    return students.filter((student, index, self) => 
      self.findIndex(s => s.id === student.id) === index
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT": return "bg-green-600"
      case "ABSENT": return "bg-red-600"
      case "LATE": return "bg-yellow-600"
      case "EXCUSED": return "bg-blue-600"
      default: return "bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT": return <CheckCircle className="h-4 w-4" />
      case "ABSENT": return <XCircle className="h-4 w-4" />
      case "LATE": return <Clock className="h-4 w-4" />
      case "EXCUSED": return <AlertTriangle className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PRESENT": return "Presente"
      case "ABSENT": return "Ausente"
      case "LATE": return "Tardanza"
      case "EXCUSED": return "Justificado"
      default: return status
    }
  }

  const canManageAttendance = session.user.role === "ADMIN" || session.user.role === "TEACHER"

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asistencia</h1>
            <p className="text-gray-600">
              {session.user.role === "PARENT" ? "Asistencia de tus hijos" :
               session.user.role === "TEACHER" ? "Registra y consulta la asistencia" :
               "Supervisión general de asistencia"}
            </p>
          </div>
          {canManageAttendance && (
            <Button asChild>
              <Link href="/attendance/new">
                <Plus className="mr-2 h-4 w-4" />
                Registrar Asistencia
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Días</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats.totalDays}</div>
                <p className="text-xs text-blue-600 mt-1">
                  Días registrados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Presente</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{stats.presentDays}</div>
                <p className="text-xs text-green-600 mt-1">
                  Días presentes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-800">Ausente</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{stats.absentDays}</div>
                <p className="text-xs text-red-600 mt-1">
                  Días ausentes
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800">Tardanzas</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-900">{stats.lateDays}</div>
                <p className="text-xs text-yellow-600 mt-1">
                  Llegadas tarde
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">% Asistencia</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {stats.attendanceRate.toFixed(1)}%
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Tasa de asistencia
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Distribution */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Distribución de Asistencia
              </CardTitle>
              <CardDescription>
                Análisis del comportamiento de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-900">{stats.presentDays}</div>
                  <div className="text-sm text-green-600">Presente</div>
                  <div className="text-xs text-green-500 mt-1">
                    {Math.round((stats.presentDays / stats.totalDays) * 100)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-900">{stats.absentDays}</div>
                  <div className="text-sm text-red-600">Ausente</div>
                  <div className="text-xs text-red-500 mt-1">
                    {Math.round((stats.absentDays / stats.totalDays) * 100)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-900">{stats.lateDays}</div>
                  <div className="text-sm text-yellow-600">Tardanza</div>
                  <div className="text-xs text-yellow-500 mt-1">
                    {Math.round((stats.lateDays / stats.totalDays) * 100)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">{stats.excusedDays}</div>
                  <div className="text-sm text-blue-600">Justificado</div>
                  <div className="text-xs text-blue-500 mt-1">
                    {Math.round((stats.excusedDays / stats.totalDays) * 100)}%
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
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
                <label className="text-sm font-medium">Estado</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="PRESENT">Presente</SelectItem>
                    <SelectItem value="ABSENT">Ausente</SelectItem>
                    <SelectItem value="LATE">Tardanza</SelectItem>
                    <SelectItem value="EXCUSED">Justificado</SelectItem>
                  </SelectContent>
                </Select>
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
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
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
                <label className="text-sm font-medium">Fecha</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        setDateFilter(date ? format(date, 'yyyy-MM-dd') : "")
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Acciones</label>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setSubjectFilter("all")
                    setStudentFilter("all")
                    setSelectedDate(undefined)
                    setDateFilter("")
                  }}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Registro de Asistencia ({filteredRecords.length})
            </CardTitle>
            <CardDescription>
              Historial detallado de asistencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Cargando asistencia...</span>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No se encontraron registros de asistencia</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Materia</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Profesor</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {record.student.firstName} {record.student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.student.studentId} • {record.student.grade}
                              {record.student.section && ` - ${record.student.section}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Book className="h-3 w-3 text-gray-400" />
                            <Badge variant="outline" className="bg-blue-50">
                              {record.class.subject.name}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center space-x-1">
                            <CalendarDays className="h-3 w-3 text-gray-400" />
                            <span>{format(new Date(record.date), "PPP", { locale: es })}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(record.status)}>
                              {getStatusIcon(record.status)}
                              <span className="ml-1">{getStatusText(record.status)}</span>
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span>{record.teacher.firstName} {record.teacher.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm" title={record.notes}>
                            {record.notes || "Sin notas"}
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