'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from '@/hooks/use-toast'
import { ValidatedDateInput } from '@/components/ui/validated-date-input'
import { 
  Users, 
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  BookOpen,
  UserCheck,
  UserX,
  AlertCircle,
  Save,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
}

interface AttendanceRecord {
  studentId: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  notes?: string
}

interface ClassSchedule {
  startTime: string
  endTime: string
  room: string | null
  dayOfWeek: string
}

interface ClassInfo {
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
  schedule: ClassSchedule
  students: Student[]
  totalStudents: number
  hasAttendanceToday: boolean
  attendanceCount: number
}

interface StudentWithAttendance {
  student: Student
  attendance: {
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
    notes: string | null
  } | null
}

function AttendancePageContent() {
  const { data: session } = useSession()
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null)
  const [studentsData, setStudentsData] = useState<Map<string, StudentWithAttendance[]>>(new Map())
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, Map<string, AttendanceRecord>>>(new Map())
  const [loading, setLoading] = useState(false)
  const [savingClassId, setSavingClassId] = useState<string | null>(null)

  // Cargar clases del día
  const fetchDayClasses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/classes/today?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las clases',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  // Cargar estudiantes cuando se expande una clase
  const fetchClassStudents = useCallback(async (classId: string) => {
    try {
      console.log('Fetching students for class:', classId, 'date:', selectedDate)
      const response = await fetch(`/api/teacher/attendance/bulk?classId=${classId}&date=${selectedDate}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Students data received:', data)
        const students: StudentWithAttendance[] = data.students || []
        console.log('Parsed students:', students)
        
        // Guardar estudiantes
        setStudentsData(prev => {
          const newMap = new Map(prev)
          newMap.set(classId, students)
          console.log('Updated studentsData map:', newMap)
          return newMap
        })
        
        // Inicializar registros de asistencia
        const records = new Map<string, AttendanceRecord>()
        students.forEach((item: StudentWithAttendance) => {
          records.set(item.student.id, {
            studentId: item.student.id,
            status: item.attendance?.status || 'PRESENT',
            notes: item.attendance?.notes || ''
          })
        })
        setAttendanceRecords(prev => {
          const newMap = new Map(prev)
          newMap.set(classId, records)
          return newMap
        })
      } else {
        console.error('Error response:', response.status, await response.text())
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de los estudiantes',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching class students:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar los estudiantes',
        variant: 'destructive',
      })
    }
  }, [selectedDate])

  useEffect(() => {
    if (session?.user?.role === 'TEACHER') {
      fetchDayClasses()
    }
  }, [session, fetchDayClasses])

  const handleClassToggle = (classId: string) => {
    const newExpandedId = expandedClassId === classId ? null : classId
    setExpandedClassId(newExpandedId)
    
    // Cargar estudiantes cuando se expande (si no están ya cargados)
    if (newExpandedId && !studentsData.has(classId)) {
      fetchClassStudents(classId)
    }
  }

  const updateAttendance = (classId: string, studentId: string, field: 'status' | 'notes', value: string) => {
    console.log('updateAttendance called:', { classId, studentId, field, value })
    const classRecords = attendanceRecords.get(classId)
    if (!classRecords) {
      console.error('No class records found for classId:', classId)
      return
    }

    const newClassRecords = new Map(classRecords)
    const existingRecord = newClassRecords.get(studentId)
    
    // Crear un NUEVO objeto en lugar de modificar la referencia existente
    const updatedRecord: AttendanceRecord = {
      studentId: studentId,
      status: existingRecord?.status || 'PRESENT',
      notes: existingRecord?.notes || ''
    }
    
    if (field === 'status') {
      updatedRecord.status = value as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
    } else {
      updatedRecord.notes = value
    }
    
    console.log('Updated record:', updatedRecord)
    newClassRecords.set(studentId, updatedRecord)
    
    const newAttendanceRecords = new Map(attendanceRecords)
    newAttendanceRecords.set(classId, newClassRecords)
    setAttendanceRecords(newAttendanceRecords)
    console.log('All attendance records updated:', Array.from(newClassRecords.values()))
  }

  const saveAttendance = async (classId: string) => {
    const classRecords = attendanceRecords.get(classId)
    if (!classRecords || classRecords.size === 0) {
      toast({
        title: 'Error',
        description: 'No hay registros de asistencia para guardar',
        variant: 'destructive',
      })
      return
    }

    try {
      setSavingClassId(classId)
      
      const attendanceData = Array.from(classRecords.values())
      console.log('Saving attendance data:', attendanceData)
      
      // Validar que todos los registros tengan studentId
      const invalidRecords = attendanceData.filter(record => !record.studentId)
      if (invalidRecords.length > 0) {
        console.error('Invalid records found:', invalidRecords)
        toast({
          title: 'Error',
          description: 'Algunos registros no tienen ID de estudiante válido',
          variant: 'destructive',
        })
        setSavingClassId(null)
        return
      }
      
      const response = await fetch('/api/teacher/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          date: selectedDate,
          attendanceRecords: attendanceData
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Asistencia guardada',
          description: `Se registró la asistencia para ${result.stats.total} estudiantes`,
        })
        
        // Actualizar el estado de la clase
        setClasses(prev => prev.map(c => 
          c.id === classId ? { ...c, hasAttendanceToday: true, attendanceCount: result.stats.total } : c
        ))
        
        // Recargar datos de estudiantes para reflejar la asistencia guardada
        setStudentsData(prev => {
          const newMap = new Map(prev)
          newMap.delete(classId)
          return newMap
        })
        fetchClassStudents(classId)
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'No se pudo guardar la asistencia',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast({
        title: 'Error',
        description: 'Error al guardar la asistencia',
        variant: 'destructive',
      })
    } finally {
      setSavingClassId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge className="bg-green-100 text-green-800"><UserCheck className="w-3 h-3 mr-1" />Presente</Badge>
      case 'ABSENT':
        return <Badge variant="destructive"><UserX className="w-3 h-3 mr-1" />Ausente</Badge>
      case 'LATE':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Tardanza</Badge>
      case 'EXCUSED':
        return <Badge className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" />Justificado</Badge>
      default:
        return <Badge variant="outline">Sin definir</Badge>
    }
  }

  const getAttendanceStats = (classId: string) => {
    const classRecords = attendanceRecords.get(classId)
    if (!classRecords) return { present: 0, absent: 0, late: 0, excused: 0 }
    
    const stats = { present: 0, absent: 0, late: 0, excused: 0 }
    classRecords.forEach(record => {
      stats[record.status.toLowerCase() as keyof typeof stats]++
    })
    return stats
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  if (session?.user?.role !== 'TEACHER') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Acceso denegado. Solo profesores pueden acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/teacher">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registro de Asistencia</h1>
            <p className="text-gray-600 mt-1">Marca la asistencia de tus clases del día</p>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Seleccionar Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <ValidatedDateInput
              id="date"
              label="Fecha"
              value={selectedDate}
              onChange={(value) => {
                setSelectedDate(value)
                setExpandedClassId(null)
                setStudentsData(new Map())
                setAttendanceRecords(new Map())
              }}
              validationOptions={{
                allowFuture: false,
                maxDate: new Date()
              }}
              className="max-w-xs"
            />
            <p className="text-sm text-gray-600">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-PE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tus Clases del Día</h2>
          {classes.length > 0 && (
            <Badge variant="outline">
              {classes.length} {classes.length === 1 ? 'clase' : 'clases'}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando clases...</span>
          </div>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases programadas</h3>
              <p className="text-gray-600">
                No tienes clases programadas para esta fecha.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => {
              const isExpanded = expandedClassId === classItem.id
              const students = studentsData.get(classItem.id) || []
              const stats = getAttendanceStats(classItem.id)
              const isSaving = savingClassId === classItem.id
              
              console.log('Rendering class:', classItem.id, 'isExpanded:', isExpanded, 'students:', students)

              return (
                <Card key={classItem.id} className="overflow-hidden">
                  <Collapsible open={isExpanded} onOpenChange={() => handleClassToggle(classItem.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold">{classItem.subject.name}</h3>
                                <Badge variant="outline">{classItem.subject.code}</Badge>
                                {classItem.hasAttendanceToday && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Asistencia registrada
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {classItem.grade} - Sección {classItem.section}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(classItem.schedule.startTime)} - {formatTime(classItem.schedule.endTime)}
                              </span>
                            </div>
                            
                            {classItem.schedule.room && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{classItem.schedule.room}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{classItem.totalStudents} estudiantes</span>
                            </div>

                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="border-t pt-6 space-y-4">
                          {/* Attendance Statistics */}
                          {students.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 mb-6">
                              <div className="bg-green-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                                <p className="text-xs text-gray-600">Presentes</p>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                                <p className="text-xs text-gray-600">Ausentes</p>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                                <p className="text-xs text-gray-600">Tardanzas</p>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                                <p className="text-xs text-gray-600">Justificados</p>
                              </div>
                            </div>
                          )}

                          {/* Students List */}
                          {students.length === 0 ? (
                            <div className="text-center py-8">
                              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">No hay estudiantes en esta clase</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Header de la tabla */}
                              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg font-semibold text-sm text-gray-700 border">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-3">Estudiante</div>
                                <div className="col-span-2">ID</div>
                                <div className="col-span-2">Estado</div>
                                <div className="col-span-3">Notas</div>
                                <div className="col-span-1"></div>
                              </div>

                              {/* Lista de estudiantes */}
                              {students.map((studentData, index) => {
                                const student = studentData.student
                                const classRecords = attendanceRecords.get(classItem.id)
                                const record = classRecords?.get(student.id)
                                const currentStatus = record?.status || 'PRESENT'
                                
                                return (
                                  <div
                                    key={student.id}
                                    className="grid grid-cols-12 gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors items-center"
                                  >
                                    {/* Número */}
                                    <div className="col-span-1 text-center font-medium text-gray-600">
                                      {index + 1}
                                    </div>

                                    {/* Nombre del estudiante */}
                                    <div className="col-span-3">
                                      <h4 className="font-semibold text-gray-900">
                                        {student.firstName} {student.lastName}
                                      </h4>
                                    </div>

                                    {/* ID del estudiante */}
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-600 font-mono">{student.studentId}</p>
                                    </div>
                                    
                                    {/* Select de estado */}
                                    <div className="col-span-2">
                                      <Select
                                        value={currentStatus}
                                        onValueChange={(value) => updateAttendance(classItem.id, student.id, 'status', value)}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="PRESENT">
                                            <div className="flex items-center gap-2">
                                              <UserCheck className="w-4 h-4 text-green-600" />
                                              Presente
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="ABSENT">
                                            <div className="flex items-center gap-2">
                                              <UserX className="w-4 h-4 text-red-600" />
                                              Ausente
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="LATE">
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-4 h-4 text-yellow-600" />
                                              Tardanza
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="EXCUSED">
                                            <div className="flex items-center gap-2">
                                              <AlertCircle className="w-4 h-4 text-blue-600" />
                                              Justificado
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {/* Campo de notas */}
                                    <div className="col-span-3">
                                      <Input
                                        placeholder="Notas..."
                                        value={record?.notes || ''}
                                        onChange={(e) => updateAttendance(classItem.id, student.id, 'notes', e.target.value)}
                                        className="w-full"
                                      />
                                    </div>

                                    {/* Badge de estado visual */}
                                    <div className="col-span-1 flex justify-end">
                                      {getStatusBadge(currentStatus)}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Save Button */}
                          {students.length > 0 && (
                            <div className="flex justify-end pt-4 border-t">
                              <Button 
                                onClick={() => saveAttendance(classItem.id)} 
                                disabled={isSaving}
                                className="flex items-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Guardando...' : 'Guardar Asistencia'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AttendancePageContent />
    </Suspense>
  )
}
