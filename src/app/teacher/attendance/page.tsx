'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import eliminado: SidebarLayout
import { toast } from '@/hooks/use-toast'
import { 
  Users, 
  Calendar,
  ClipboardCheck,
  UserCheck,
  UserX,
  Clock,
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

interface ClassInfo {
  id: string
  subject: string
  grade: string
  section: string
}

interface AvailableClass {
  id: string
  subject: {
    name: string
  }
  grade: string
  section: string
  hasAttendanceToday: boolean
}

interface StudentWithAttendance {
  student: Student
  attendance: {
    id: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
    notes?: string
    createdAt: string
  } | null
}

function AttendancePageContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  
  const [selectedClassId, setSelectedClassId] = useState(searchParams.get('classId') || '')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0])
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([])
  const [students, setStudents] = useState<StudentWithAttendance[]>([])
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false)

  // Cargar clases disponibles
  const fetchAvailableClasses = useCallback(async () => {
    try {
      const response = await fetch(`/api/teacher/classes/today?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }, [selectedDate])

  // Cargar estudiantes de una clase específica
  const fetchClassStudents = useCallback(async () => {
    if (!selectedClassId || !selectedDate) return

    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/attendance/bulk?classId=${selectedClassId}&date=${selectedDate}`)
      
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        setClassInfo(data.class)
        setHasExistingAttendance(data.hasAttendance)
        
        // Inicializar registros de asistencia
        const records = new Map<string, AttendanceRecord>()
        data.students.forEach((item: StudentWithAttendance) => {
          records.set(item.student.id, {
            studentId: item.student.id,
            status: item.attendance?.status || 'PRESENT',
            notes: item.attendance?.notes || ''
          })
        })
        setAttendanceRecords(records)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información de la clase',
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
    } finally {
      setLoading(false)
    }
  }, [selectedClassId, selectedDate])

  useEffect(() => {
    if (session?.user?.role === 'TEACHER') {
      fetchAvailableClasses()
    }
  }, [session, fetchAvailableClasses])

  useEffect(() => {
    if (selectedClassId && selectedDate) {
      fetchClassStudents()
    }
  }, [selectedClassId, selectedDate, fetchClassStudents])

  const updateAttendance = (studentId: string, field: 'status' | 'notes', value: string) => {
    const newRecords = new Map(attendanceRecords)
    const currentRecord = newRecords.get(studentId) || { studentId, status: 'PRESENT' as const, notes: '' }
    
    if (field === 'status') {
      currentRecord.status = value as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
    } else {
      currentRecord.notes = value
    }
    
    newRecords.set(studentId, currentRecord)
    setAttendanceRecords(newRecords)
  }

  const saveAttendance = async () => {
    if (!selectedClassId || !selectedDate || attendanceRecords.size === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona una clase y fecha válidas',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      
      const attendanceData = Array.from(attendanceRecords.values())
      
      const response = await fetch('/api/teacher/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
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
        setHasExistingAttendance(true)
        
        // Recargar datos para mostrar la información actualizada
        fetchClassStudents()
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
      setSaving(false)
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

  const getAttendanceStats = () => {
    const stats = { present: 0, absent: 0, late: 0, excused: 0 }
    attendanceRecords.forEach(record => {
      stats[record.status.toLowerCase() as keyof typeof stats]++
    })
    return stats
  }

  if (session?.user?.role !== 'TEACHER') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Acceso denegado. Solo profesores pueden acceder a esta página.</p>
      </div>
    )
  }

  const stats = getAttendanceStats()

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
              <p className="text-gray-600 mt-1">Gestiona la asistencia de tus estudiantes</p>
            </div>
          </div>
        </div>

        {/* Class and Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Seleccionar Clase y Fecha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="class">Clase</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una clase" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.subject.name} - {classItem.grade} {classItem.section}
                        {classItem.hasAttendanceToday && (
                          <Badge variant="outline" className="ml-2">
                            Asistencia registrada
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {classInfo && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">
                  {classInfo.subject} - {classInfo.grade} {classInfo.section}
                </h3>
                <p className="text-blue-700 text-sm">
                  Fecha: {new Date(selectedDate).toLocaleDateString('es-PE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {hasExistingAttendance && (
                  <Badge className="bg-green-100 text-green-800 mt-2">
                    <ClipboardCheck className="w-3 h-3 mr-1" />
                    Asistencia ya registrada
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Statistics */}
        {students.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <p className="text-sm text-gray-600">Presentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <p className="text-sm text-gray-600">Ausentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                <p className="text-sm text-gray-600">Tardanzas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                <p className="text-sm text-gray-600">Justificados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Students List */}
        {selectedClassId && selectedDate && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lista de Estudiantes
                  {students.length > 0 && (
                    <Badge variant="outline">{students.length} estudiantes</Badge>
                  )}
                </CardTitle>
                {students.length > 0 && (
                  <Button onClick={saveAttendance} disabled={saving} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar Asistencia'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Cargando estudiantes...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
                  <p className="text-gray-600">
                    {selectedClassId ? 'Esta clase no tiene estudiantes registrados.' : 'Selecciona una clase para ver los estudiantes.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((item) => {
                    const record = attendanceRecords.get(item.student.id)
                    return (
                      <div
                        key={item.student.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {item.student.firstName} {item.student.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">ID: {item.student.studentId}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="min-w-[140px]">
                            <Select
                              value={record?.status || 'PRESENT'}
                              onValueChange={(value) => updateAttendance(item.student.id, 'status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PRESENT">Presente</SelectItem>
                                <SelectItem value="ABSENT">Ausente</SelectItem>
                                <SelectItem value="LATE">Tardanza</SelectItem>
                                <SelectItem value="EXCUSED">Justificado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="min-w-[200px]">
                            <Textarea
                              placeholder="Notas (opcional)"
                              value={record?.notes || ''}
                              onChange={(e) => updateAttendance(item.student.id, 'notes', e.target.value)}
                              rows={1}
                              className="resize-none"
                            />
                          </div>
                          
                          <div className="min-w-[120px] flex justify-end">
                            {getStatusBadge(record?.status || 'PRESENT')}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
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