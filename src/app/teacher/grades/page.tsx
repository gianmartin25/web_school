'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
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
import { toast } from '@/hooks/use-toast'
import {
  GraduationCap,
  BookOpen,
  Save,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award
} from 'lucide-react'
import Link from 'next/link'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  grade: {
    id: string
    score: number
    comments: string | null
    letterGrade: string
  } | null
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
}

interface AcademicPeriod {
  id: string
  name: string
  type: string
  minPassingGrade: number
  maxGrade: number
}

interface AvailableClass {
  id: string
  subject: {
    name: string
    code: string
  }
  grade: string
  section: string
}

interface GradeRecord {
  studentId: string
  score: number
  comments: string
  gradeType: string
}

function GradesPageContent() {
  const { data: session } = useSession()
  
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const [selectedGradeType, setSelectedGradeType] = useState('FINAL')
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([])
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [periodInfo, setPeriodInfo] = useState<AcademicPeriod | null>(null)
  const [gradeRecords, setGradeRecords] = useState<Map<string, GradeRecord>>(new Map())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Cargar clases disponibles
  const fetchAvailableClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/teacher/classes')
      if (response.ok) {
        const data = await response.json()
        setAvailableClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las clases',
        variant: 'destructive',
      })
    }
  }, [])

  // Cargar períodos académicos
  const fetchAcademicPeriods = useCallback(async () => {
    try {
      const response = await fetch('/api/academic-periods?activeOnly=true')
      if (response.ok) {
        const data = await response.json()
        setAcademicPeriods(data.periods || [])
        
        // Seleccionar el período actual por defecto
        const currentPeriod = data.periods.find((p: AcademicPeriod & { isCurrent: boolean }) => p.isCurrent)
        if (currentPeriod) {
          setSelectedPeriodId(currentPeriod.id)
        }
      }
    } catch (error) {
      console.error('Error fetching academic periods:', error)
    }
  }, [])

  // Cargar estudiantes y calificaciones
  const fetchStudentsGrades = useCallback(async () => {
    if (!selectedClassId || !selectedPeriodId) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/teacher/grades?classId=${selectedClassId}&academicPeriodId=${selectedPeriodId}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
        setClassInfo(data.class)
        setPeriodInfo(data.academicPeriod)
        
        // Inicializar registros de calificaciones
        const records = new Map<string, GradeRecord>()
        data.students.forEach((student: Student) => {
          records.set(student.id, {
            studentId: student.id,
            score: student.grade?.score || 0,
            comments: student.grade?.comments || '',
            gradeType: selectedGradeType
          })
        })
        setGradeRecords(records)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching students grades:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar los datos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [selectedClassId, selectedPeriodId, selectedGradeType])

  useEffect(() => {
    if (session?.user?.role === 'TEACHER') {
      fetchAvailableClasses()
      fetchAcademicPeriods()
    }
  }, [session, fetchAvailableClasses, fetchAcademicPeriods])

  useEffect(() => {
    if (selectedClassId && selectedPeriodId) {
      fetchStudentsGrades()
    }
  }, [selectedClassId, selectedPeriodId, selectedGradeType, fetchStudentsGrades])

  const updateGrade = (studentId: string, field: 'score' | 'comments', value: string | number) => {
    const newRecords = new Map(gradeRecords)
    const currentRecord = newRecords.get(studentId) || { 
      studentId, 
      score: 0, 
      comments: '', 
      gradeType: selectedGradeType 
    }
    
    if (field === 'score') {
      currentRecord.score = Number(value)
    } else {
      currentRecord.comments = String(value)
    }
    
    newRecords.set(studentId, currentRecord)
    setGradeRecords(newRecords)
  }

  const saveGrades = async () => {
    if (!selectedClassId || !selectedPeriodId || gradeRecords.size === 0) {
      toast({
        title: 'Error',
        description: 'Selecciona una clase y período válidos',
        variant: 'destructive',
      })
      return
    }

    // Validar que todas las calificaciones estén en el rango permitido
    const maxGrade = periodInfo?.maxGrade || 20
    const invalidGrades = Array.from(gradeRecords.values()).filter(
      record => record.score < 0 || record.score > maxGrade
    )

    if (invalidGrades.length > 0) {
      toast({
        title: 'Error',
        description: `Las calificaciones deben estar entre 0 y ${maxGrade}`,
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      
      const gradesData = Array.from(gradeRecords.values())
      
      const response = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          academicPeriodId: selectedPeriodId,
          grades: gradesData
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Calificaciones guardadas',
          description: `Se registraron ${result.stats.total} calificaciones. Promedio: ${result.stats.average.toFixed(2)}`,
        })
        
        // Recargar datos
        fetchStudentsGrades()
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'No se pudieron guardar las calificaciones',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving grades:', error)
      toast({
        title: 'Error',
        description: 'Error al guardar las calificaciones',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getGradeBadge = (score: number) => {
    const minPassing = periodInfo?.minPassingGrade || 11
    
    if (score >= 18) {
      return <Badge className="bg-green-600"><Award className="w-3 h-3 mr-1" />Excelente</Badge>
    } else if (score >= 15) {
      return <Badge className="bg-blue-600"><TrendingUp className="w-3 h-3 mr-1" />Bueno</Badge>
    } else if (score >= minPassing) {
      return <Badge className="bg-yellow-600">Regular</Badge>
    } else if (score > 0) {
      return <Badge variant="destructive"><TrendingDown className="w-3 h-3 mr-1" />Insuficiente</Badge>
    }
    return <Badge variant="outline">Sin nota</Badge>
  }

  const getGradeStats = () => {
    const scores = Array.from(gradeRecords.values()).map(r => r.score).filter(s => s > 0)
    if (scores.length === 0) return { average: 0, passing: 0, failing: 0 }
    
    const minPassing = periodInfo?.minPassingGrade || 11
    return {
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      passing: scores.filter(s => s >= minPassing).length,
      failing: scores.filter(s => s < minPassing && s > 0).length
    }
  }

  if (session?.user?.role !== 'TEACHER') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Acceso denegado. Solo profesores pueden acceder a esta página.</p>
      </div>
    )
  }

  const stats = getGradeStats()

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
            <h1 className="text-3xl font-bold text-gray-900">Registro de Calificaciones</h1>
            <p className="text-gray-600 mt-1">Ingresa las notas de tus estudiantes</p>
          </div>
        </div>
      </div>

      {/* Selection Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Seleccionar Clase y Período
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="period">Período Académico</Label>
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                  {academicPeriods.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name} ({period.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeType">Tipo de Calificación</Label>
              <Select value={selectedGradeType} onValueChange={setSelectedGradeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FINAL">Final</SelectItem>
                  <SelectItem value="MIDTERM">Parcial</SelectItem>
                  <SelectItem value="QUIZ">Examen</SelectItem>
                  <SelectItem value="HOMEWORK">Tarea</SelectItem>
                  <SelectItem value="PARTICIPATION">Participación</SelectItem>
                  <SelectItem value="PROJECT">Proyecto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {classInfo && periodInfo && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">
                {classInfo.subject.name} ({classInfo.subject.code}) - {classInfo.grade} {classInfo.section}
              </h3>
              <p className="text-blue-700 text-sm">
                {periodInfo.name} • Escala: 0 - {periodInfo.maxGrade} • Mínimo aprobatorio: {periodInfo.minPassingGrade}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Statistics */}
      {students.length > 0 && stats.average > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.average.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">Promedio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.passing}</div>
              <p className="text-sm text-gray-600">Aprobados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failing}</div>
              <p className="text-sm text-gray-600">Desaprobados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students Grades Table */}
      {selectedClassId && selectedPeriodId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Calificaciones de Estudiantes
                {students.length > 0 && (
                  <Badge variant="outline">{students.length} estudiantes</Badge>
                )}
              </CardTitle>
              {students.length > 0 && (
                <Button onClick={saveGrades} disabled={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : 'Guardar Calificaciones'}
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
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay estudiantes</h3>
                <p className="text-gray-600">
                  {selectedClassId ? 'Esta clase no tiene estudiantes registrados.' : 'Selecciona una clase para ver los estudiantes.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const record = gradeRecords.get(student.id)
                  return (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ID: {student.studentId} • {student.email}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <Label htmlFor={`score-${student.id}`} className="text-xs text-gray-600">
                            Nota
                          </Label>
                          <Input
                            id={`score-${student.id}`}
                            type="number"
                            min="0"
                            max={periodInfo?.maxGrade || 20}
                            step="0.5"
                            value={record?.score || 0}
                            onChange={(e) => updateGrade(student.id, 'score', e.target.value)}
                            className="text-center font-semibold"
                          />
                        </div>
                        
                        <div className="min-w-[250px]">
                          <Label htmlFor={`comments-${student.id}`} className="text-xs text-gray-600">
                            Comentarios
                          </Label>
                          <Textarea
                            id={`comments-${student.id}`}
                            placeholder="Comentarios (opcional)"
                            value={record?.comments || ''}
                            onChange={(e) => updateGrade(student.id, 'comments', e.target.value)}
                            rows={1}
                            className="resize-none"
                          />
                        </div>
                        
                        <div className="min-w-[130px] flex justify-end">
                          {getGradeBadge(record?.score || 0, periodInfo?.maxGrade)}
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

export default function GradesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GradesPageContent />
    </Suspense>
  )
}