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
import { Save, ArrowLeft, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  grade: string
  section?: string
}

interface Subject {
  id: string
  name: string
  code: string
}

interface GradeForm {
  studentId: string
  subjectId: string
  value: string
  gradeType: string
  description: string
  gradeDate: string
}

const GRADE_TYPES = [
  { value: 'EXAM', label: 'Examen' },
  { value: 'QUIZ', label: 'Prueba' },
  { value: 'HOMEWORK', label: 'Tarea' },
  { value: 'PROJECT', label: 'Proyecto' },
  { value: 'PARTICIPATION', label: 'Participación' },
  { value: 'PRACTICAL', label: 'Trabajo Práctico' },
  { value: 'FINAL', label: 'Examen Final' }
]

export default function NewGradePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState<GradeForm>({
    studentId: '',
    subjectId: '',
    value: '',
    gradeType: '',
    description: '',
    gradeDate: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Partial<GradeForm>>({})

  useEffect(() => {
    if (session?.user?.role !== 'TEACHER' && session?.user?.role !== 'ADMIN') {
      toast({
        title: "Acceso denegado",
        description: "Solo los profesores pueden registrar calificaciones",
        variant: "destructive",
      })
      router.push('/grades')
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

        // Fetch subjects 
        const subjectsResponse = await fetch('/api/subjects')
        if (subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json()
          setSubjects(subjectsData || [])
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
    const newErrors: Partial<GradeForm> = {}

    if (!form.studentId) newErrors.studentId = 'Debe seleccionar un estudiante'
    if (!form.subjectId) newErrors.subjectId = 'Debe seleccionar una materia'
    if (!form.value) {
      newErrors.value = 'Debe ingresar una calificación'
    } else {
      const value = parseFloat(form.value)
      if (isNaN(value) || value < 0 || value > 20) {
        newErrors.value = 'La calificación debe ser un número entre 0 y 20'
      }
    }
    if (!form.gradeType) newErrors.gradeType = 'Debe seleccionar un tipo de evaluación'
    if (!form.gradeDate) newErrors.gradeDate = 'Debe seleccionar una fecha'

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

      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al registrar la calificación')
      }

      const student = students.find(s => s.id === form.studentId)
      const subject = subjects.find(s => s.id === form.subjectId)

      toast({
        title: "Calificación registrada",
        description: `Calificación de ${form.value} registrada para ${student?.firstName} ${student?.lastName} en ${subject?.name}`,
      })

      router.push('/grades')

    } catch (error) {
      console.error('Error creating grade:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar la calificación",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getGradeColor = (value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return ''
    if (numValue >= 18) return 'text-green-600'
    if (numValue >= 14) return 'text-blue-600'
    if (numValue >= 11) return 'text-yellow-600'
    return 'text-red-600'
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
            <h1 className="text-3xl font-bold text-gray-900">Nueva Calificación</h1>
            <p className="text-gray-600">Registrar una nueva calificación para un estudiante</p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Información de la Calificación
            </CardTitle>
            <CardDescription>
              Complete todos los campos para registrar la calificación
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

              {/* Subject Selection */}
              <div className="space-y-2">
                <Label htmlFor="subject">Materia *</Label>
                <Select 
                  value={form.subjectId} 
                  onValueChange={(value) => setForm({...form, subjectId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subjectId && (
                  <p className="text-sm text-red-600">{errors.subjectId}</p>
                )}
              </div>

              {/* Grade Value */}
              <div className="space-y-2">
                <Label htmlFor="value">Calificación * (0-20)</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={form.value}
                  onChange={(e) => setForm({...form, value: e.target.value})}
                  placeholder="Ej: 16.5"
                  className={getGradeColor(form.value)}
                />
                {form.value && (
                  <p className={`text-sm ${getGradeColor(form.value)}`}>
                    {parseFloat(form.value) >= 11 ? 'Aprobado' : 'Desaprobado'}
                  </p>
                )}
                {errors.value && (
                  <p className="text-sm text-red-600">{errors.value}</p>
                )}
              </div>

              {/* Grade Type */}
              <div className="space-y-2">
                <Label htmlFor="gradeType">Tipo de Evaluación *</Label>
                <Select 
                  value={form.gradeType} 
                  onValueChange={(value) => setForm({...form, gradeType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gradeType && (
                  <p className="text-sm text-red-600">{errors.gradeType}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="gradeDate">Fecha de Evaluación *</Label>
                <Input
                  id="gradeDate"
                  type="date"
                  value={form.gradeDate}
                  onChange={(e) => setForm({...form, gradeDate: e.target.value})}
                />
                {errors.gradeDate && (
                  <p className="text-sm text-red-600">{errors.gradeDate}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Comentarios adicionales sobre la evaluación..."
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
                      Guardar Calificación
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