'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from '@/hooks/use-toast'
import {
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Grade {
  id: string
  type: string
  score: number
  maxScore: number
  percentage: number
  letterGrade: string
  comments: string | null
  gradeDate: string
  teacher: {
    id: string
    name: string
    email: string
  }
}

interface Subject {
  subjectId: string
  subjectName: string
  subjectCode: string
  class: {
    id: string
    name: string
    grade: string
    section: string
  } | null
  grades: Grade[]
  average: number
  isPassing: boolean
}

interface Period {
  period: {
    id: string
    name: string
    type: string
    minPassingGrade: number
    maxGrade: number
  } | null
  subjects: Subject[]
  periodAverage: number
}

interface StudentInfo {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
}

function GradesPageContent() {
  const { data: session } = useSession()
  
  const [periods, setPeriods] = useState<Period[]>([])
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === 'STUDENT') {
      fetchGrades()
    }
  }, [session])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/grades')
      
      if (response.ok) {
        const data = await response.json()
        setStudentInfo(data.student)
        setPeriods(data.periods || [])
        
        // Expandir el primer período por defecto
        if (data.periods && data.periods.length > 0 && data.periods[0].period) {
          setExpandedPeriods(new Set([data.periods[0].period.id]))
        }
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las calificaciones',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching grades:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar las calificaciones',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePeriod = (periodId: string) => {
    const newExpanded = new Set(expandedPeriods)
    if (newExpanded.has(periodId)) {
      newExpanded.delete(periodId)
    } else {
      newExpanded.add(periodId)
    }
    setExpandedPeriods(newExpanded)
  }

  const getGradeBadge = (score: number) => {
    if (score >= 18) {
      return <Badge className="bg-green-600"><Award className="w-3 h-3 mr-1" />Excelente</Badge>
    } else if (score >= 15) {
      return <Badge className="bg-blue-600"><TrendingUp className="w-3 h-3 mr-1" />Bueno</Badge>
    } else if (score >= 11) {
      return <Badge className="bg-yellow-600">Regular</Badge>
    } else if (score > 0) {
      return <Badge variant="destructive"><TrendingDown className="w-3 h-3 mr-1" />Insuficiente</Badge>
    }
    return <Badge variant="outline">Sin nota</Badge>
  }

  const getGradeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      FINAL: 'Final',
      MIDTERM: 'Parcial',
      QUIZ: 'Examen',
      HOMEWORK: 'Tarea',
      PARTICIPATION: 'Participación',
      PROJECT: 'Proyecto'
    }
    return types[type] || type
  }

  const calculateOverallAverage = () => {
    if (periods.length === 0) return 0
    const validPeriods = periods.filter(p => p.periodAverage > 0)
    if (validPeriods.length === 0) return 0
    return validPeriods.reduce((sum, p) => sum + p.periodAverage, 0) / validPeriods.length
  }

  const getPassingSubjects = () => {
    const allSubjects = periods.flatMap(p => p.subjects)
    return allSubjects.filter(s => s.isPassing).length
  }

  const getTotalSubjects = () => {
    const uniqueSubjects = new Set(periods.flatMap(p => p.subjects.map(s => s.subjectId)))
    return uniqueSubjects.size
  }

  if (session?.user?.role !== 'STUDENT') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Acceso denegado. Solo estudiantes pueden acceder a esta página.</p>
      </div>
    )
  }

  const overallAverage = calculateOverallAverage()
  const passingSubjects = getPassingSubjects()
  const totalSubjects = getTotalSubjects()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/student">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Calificaciones</h1>
            <p className="text-gray-600 mt-1">
              {studentInfo && `${studentInfo.firstName} ${studentInfo.lastName} • ${studentInfo.studentId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overallAverage.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallAverage >= 15 ? 'Excelente rendimiento' : overallAverage >= 11 ? 'Buen rendimiento' : 'Requiere mejora'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materias Aprobadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {passingSubjects}/{totalSubjects}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalSubjects > 0 ? `${((passingSubjects / totalSubjects) * 100).toFixed(0)}% aprobado` : 'Sin datos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calificaciones</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {periods.reduce((sum, p) => sum + p.subjects.reduce((s, sub) => s + sub.grades.length, 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              En {periods.length} {periods.length === 1 ? 'período' : 'períodos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grades by Period */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando calificaciones...</span>
        </div>
      ) : periods.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay calificaciones</h3>
            <p className="text-gray-600">
              Aún no tienes calificaciones registradas. Consulta con tus profesores.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {periods.map((period) => {
            if (!period.period) return null
            
            const isExpanded = expandedPeriods.has(period.period.id)

            return (
              <Card key={period.period.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => togglePeriod(period.period!.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">{period.period.name}</h3>
                              <Badge variant="outline">{period.period.type}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {period.subjects.length} {period.subjects.length === 1 ? 'materia' : 'materias'} • Promedio: {period.periodAverage.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {period.periodAverage.toFixed(2)}
                            </div>
                            <p className="text-xs text-gray-600">Promedio del período</p>
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
                        {period.subjects.map((subject) => (
                          <Card key={subject.subjectId} className="bg-gray-50">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <BookOpen className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">{subject.subjectName}</h4>
                                      <Badge variant="outline">{subject.subjectCode}</Badge>
                                      {subject.isPassing ? (
                                        <Badge className="bg-green-100 text-green-800">
                                          <Award className="w-3 h-3 mr-1" />Aprobado
                                        </Badge>
                                      ) : (
                                        <Badge variant="destructive">Desaprobado</Badge>
                                      )}
                                    </div>
                                    {subject.class && (
                                      <p className="text-sm text-gray-600">
                                        {subject.class.grade} - Sección {subject.class.section}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-blue-600">
                                    {subject.average.toFixed(2)}
                                  </div>
                                  <p className="text-xs text-gray-600">Promedio</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {subject.grades.map((grade) => (
                                  <div
                                    key={grade.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline">{getGradeTypeLabel(grade.type)}</Badge>
                                        <span className="text-sm text-gray-600">
                                          {new Date(grade.gradeDate).toLocaleDateString('es-PE', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User className="w-3 h-3" />
                                        <span>{grade.teacher.name}</span>
                                      </div>
                                      {grade.comments && (
                                        <p className="text-sm text-gray-600 mt-1 italic">
                                          &ldquo;{grade.comments}&rdquo;
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <div className="text-2xl font-bold">
                                          {grade.score}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                          de {grade.maxScore}
                                        </p>
                                      </div>
                                      {getGradeBadge(grade.score, grade.maxScore)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
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
  )
}

export default function StudentGradesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GradesPageContent />
    </Suspense>
  )
}