'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, ArrowLeft, Users, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  grade: string
  section?: string
}

interface Class {
  id: string
  name: string
  subject: {
    id: string
    name: string
    code: string
  }
}

interface AttendanceForm {
  studentId: string
  classId: string
  status: string
  date: string
  notes: string
}

const ATTENDANCE_STATUS = [
  { value: 'PRESENT', label: 'Presente', icon: CheckCircle, color: 'text-green-600' },
  { value: 'ABSENT', label: 'Ausente', icon: XCircle, color: 'text-red-600' },
  { value: 'LATE', label: 'Tardanza', icon: Clock, color: 'text-yellow-600' },
  { value: 'EXCUSED', label: 'Justificado', icon: AlertTriangle, color: 'text-blue-600' }
]

export default function NewAttendancePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState<AttendanceForm>({
    studentId: '',
    classId: '',
    status: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [errors, setErrors] = useState<Partial<AttendanceForm>>({})

  useEffect(() => {
    if (session?.user?.role !== 'TEACHER' && session?.user?.role !== 'ADMIN') {
      toast({
        title: "Acceso denegado",
        description: "Solo los profesores pueden registrar asistencia",
        variant: "destructive",
      })
      router.push('/attendance')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch students
        const studentsResponse = await fetch('/api/students')
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json()
          setStudents(studentsData.students || [])
        }

        // Fetch classes
        const classesResponse = await fetch('/api/classes')
        if (classesResponse.ok) {
          const classesData = await classesResponse.json()
          setClasses(classesData.classes || [])
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, router, toast])

  const validateForm = (): boolean => {
    const newErrors: Partial<AttendanceForm> = {}

    if (!form.studentId) newErrors.studentId = 'Debe seleccionar un estudiante'
    if (!form.classId) newErrors.classId = 'Debe seleccionar una clase'
    if (!form.status) newErrors.status = 'Debe seleccionar un estado de asistencia'
    if (!form.date) newErrors.date = 'Debe seleccionar una fecha'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Errores en el formulario",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al registrar la asistencia')
      }

      const student = students.find(s => s.id === form.studentId)
      const statusData = ATTENDANCE_STATUS.find(s => s.value === form.status)

      toast({
        title: "Asistencia registrada",
        description: `${statusData?.label} registrado para ${student?.firstName} ${student?.lastName}`,
      })

      router.push('/attendance')

    } catch (error) {
      console.error('Error creating attendance:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar la asistencia",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const statusData = ATTENDANCE_STATUS.find(s => s.value === status)
    if (!statusData) return null
    const Icon = statusData.icon
    return <Icon className={`h-4 w-4 ${statusData.color}`} />
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registrar Asistencia</h1>
            <p className="text-gray-600">Registrar la asistencia de un estudiante en una clase</p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Información de Asistencia
            </CardTitle>
            <CardDescription>
              Complete todos los campos para registrar la asistencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">Estudiante *</Label>
                <Select 
                  value={form.studentId} 
                  onValueChange={(value) => setForm({...form, studentId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.studentId} ({student.grade}{student.section && ` ${student.section}`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studentId && (
                  <p className="text-sm text-red-600">{errors.studentId}</p>
                )}
              </div>

              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="class">Clase *</Label>
                <Select 
                  value={form.classId} 
                  onValueChange={(value) => setForm({...form, classId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar clase" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.subject.name} ({classItem.subject.code}) - {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId && (
                  <p className="text-sm text-red-600">{errors.classId}</p>
                )}
              </div>

              {/* Attendance Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado de Asistencia *</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(value) => setForm({...form, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTENDANCE_STATUS.map((status) => {
                      const Icon = status.icon
                      return (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center">
                            <Icon className={`h-4 w-4 mr-2 ${status.color}`} />
                            {status.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {form.status && (
                  <div className="flex items-center mt-2">
                    {getStatusIcon(form.status)}
                    <span className="ml-2 text-sm">
                      {ATTENDANCE_STATUS.find(s => s.value === form.status)?.label}
                    </span>
                  </div>
                )}
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Comentarios adicionales sobre la asistencia..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Asistencia
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}