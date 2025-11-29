'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { ValidatedDateInput } from '@/components/ui/validated-date-input'
import { validatePeriodDates, dateValidationPresets } from '@/lib/date-validations'
import { 
  Calendar,
  Settings,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Save,
  BookOpen,
  Award,
  School,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface AcademicPeriod {
  id: string
  name: string
  type: 'bimestre' | 'trimestre' | 'semestre'
  startDate: string
  endDate: string
  isActive: boolean
  academicYear: string
  order: number
}

interface GradingScale {
  id: string
  name: string
  type: 'numeric' | 'letter' | 'percentage'
  minValue: number
  maxValue: number
  passingGrade: number
  scales: {
    grade: string
    minValue: number
    maxValue: number
    description: string
  }[]
  isDefault: boolean
}

interface AcademicConfig {
  schoolName: string
  academicYear: string
  periodType: 'bimestre' | 'trimestre' | 'semestre'
  gradingSystem: string
  attendanceRequired: number
  passingGrade: number
}

export default function AcademicConfigPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('periods')
  const [loading, setLoading] = useState(true)
  
  // Estados para períodos académicos
  const [periods, setPeriods] = useState<AcademicPeriod[]>([])
  const [showPeriodDialog, setShowPeriodDialog] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriod | null>(null)
  
  // Estados para escalas de calificación
  const [gradingScales, setGradingScales] = useState<GradingScale[]>([])
  const [showScaleDialog, setShowScaleDialog] = useState(false)
  
  // Estados para validación de fechas
  const [dateValidationErrors, setDateValidationErrors] = useState<string[]>([])
  
  // Estados para configuración general
  const [academicConfig, setAcademicConfig] = useState<AcademicConfig>({
    schoolName: '',
    academicYear: '',
    periodType: 'bimestre',
    gradingSystem: '',
    attendanceRequired: 80,
    passingGrade: 70
  })

  // Estados para formularios
  const [periodForm, setPeriodForm] = useState({
    name: '',
    type: 'bimestre' as 'bimestre' | 'trimestre' | 'semestre',
    startDate: '',
    endDate: '',
    academicYear: '2024-2025',
    order: 1
  })

  const [scaleForm, setScaleForm] = useState({
    name: '',
    type: 'numeric' as 'numeric' | 'letter' | 'percentage',
    minValue: 0,
    maxValue: 100,
    passingGrade: 70,
    scales: [
      { grade: 'A', minValue: 90, maxValue: 100, description: 'Excelente' },
      { grade: 'B', minValue: 80, maxValue: 89, description: 'Muy Bueno' },
      { grade: 'C', minValue: 70, maxValue: 79, description: 'Bueno' },
      { grade: 'D', minValue: 60, maxValue: 69, description: 'Regular' },
      { grade: 'F', minValue: 0, maxValue: 59, description: 'Reprobado' }
    ]
  })

  // Cargar datos iniciales
  useEffect(() => {
    const loadMockData = () => {
      // Datos mock para períodos académicos
      const mockPeriods: AcademicPeriod[] = [
        {
          id: '1',
          name: 'Primer Bimestre',
          type: 'bimestre',
          startDate: '2024-09-01',
          endDate: '2024-10-31',
          isActive: true,
          academicYear: '2024-2025',
          order: 1
        },
        {
          id: '2',
          name: 'Segundo Bimestre',
          type: 'bimestre',
          startDate: '2024-11-01',
          endDate: '2024-12-31',
          isActive: false,
          academicYear: '2024-2025',
          order: 2
        },
        {
          id: '3',
          name: 'Tercer Bimestre',
          type: 'bimestre',
          startDate: '2025-01-15',
          endDate: '2025-03-15',
          isActive: false,
          academicYear: '2024-2025',
          order: 3
        },
        {
          id: '4',
          name: 'Cuarto Bimestre',
          type: 'bimestre',
          startDate: '2025-03-16',
          endDate: '2025-05-31',
          isActive: false,
          academicYear: '2024-2025',
          order: 4
        }
      ]

      // Datos mock para escalas de calificación
      const mockScales: GradingScale[] = [
        {
          id: '1',
          name: 'Escala Numérica Estándar',
          type: 'numeric',
          minValue: 0,
          maxValue: 100,
          passingGrade: 70,
          isDefault: true,
          scales: [
            { grade: '90-100', minValue: 90, maxValue: 100, description: 'Excelente' },
            { grade: '80-89', minValue: 80, maxValue: 89, description: 'Muy Bueno' },
            { grade: '70-79', minValue: 70, maxValue: 79, description: 'Bueno' },
            { grade: '60-69', minValue: 60, maxValue: 69, description: 'Regular' },
            { grade: '0-59', minValue: 0, maxValue: 59, description: 'Reprobado' }
          ]
        },
        {
          id: '2',
          name: 'Escala de Letras',
          type: 'letter',
          minValue: 0,
          maxValue: 100,
          passingGrade: 70,
          isDefault: false,
          scales: [
            { grade: 'A', minValue: 90, maxValue: 100, description: 'Excelente' },
            { grade: 'B', minValue: 80, maxValue: 89, description: 'Muy Bueno' },
            { grade: 'C', minValue: 70, maxValue: 79, description: 'Bueno' },
            { grade: 'D', minValue: 60, maxValue: 69, description: 'Regular' },
            { grade: 'F', minValue: 0, maxValue: 59, description: 'Reprobado' }
          ]
        }
      ]

      // Configuración académica mock
      const mockConfig: AcademicConfig = {
        schoolName: 'Escuela Primaria San José',
        academicYear: '2024-2025',
        periodType: 'bimestre',
        gradingSystem: '1',
        attendanceRequired: 80,
        passingGrade: 70
      }

      setPeriods(mockPeriods)
      setGradingScales(mockScales)
      setAcademicConfig(mockConfig)
      setLoading(false)
    }

    setTimeout(loadMockData, 1000)
  }, [])

  // Funciones para períodos académicos
  const handleCreatePeriod = () => {
    const newPeriod: AcademicPeriod = {
      id: (periods.length + 1).toString(),
      name: periodForm.name,
      type: periodForm.type,
      startDate: periodForm.startDate,
      endDate: periodForm.endDate,
      isActive: false,
      academicYear: periodForm.academicYear,
      order: periodForm.order
    }

    setPeriods([...periods, newPeriod])
    setShowPeriodDialog(false)
    resetPeriodForm()
    toast({
      title: "Éxito",
      description: "Período académico creado exitosamente"
    })
  }

  const handleUpdatePeriod = () => {
    if (!editingPeriod) return

    const updatedPeriods = periods.map(p => 
      p.id === editingPeriod.id 
        ? {
            ...p,
            name: periodForm.name,
            type: periodForm.type,
            startDate: periodForm.startDate,
            endDate: periodForm.endDate,
            academicYear: periodForm.academicYear,
            order: periodForm.order
          }
        : p
    )

    setPeriods(updatedPeriods)
    setShowPeriodDialog(false)
    setEditingPeriod(null)
    resetPeriodForm()
    toast({
      title: "Éxito",
      description: "Período académico actualizado exitosamente"
    })
  }

  const handleDeletePeriod = (periodId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este período académico?')) {
      setPeriods(periods.filter(p => p.id !== periodId))
      toast({
        title: "Éxito",
        description: "Período académico eliminado exitosamente"
      })
    }
  }

  const handleActivatePeriod = (periodId: string) => {
    const updatedPeriods = periods.map(p => ({
      ...p,
      isActive: p.id === periodId
    }))
    setPeriods(updatedPeriods)
    toast({
      title: "Éxito",
      description: "Período académico activado exitosamente"
    })
  }

  const resetPeriodForm = () => {
    setPeriodForm({
      name: '',
      type: 'bimestre',
      startDate: '',
      endDate: '',
      academicYear: '2024-2025',
      order: 1
    })
  }

  const handleEditPeriod = (period: AcademicPeriod) => {
    setEditingPeriod(period)
    setPeriodForm({
      name: period.name,
      type: period.type,
      startDate: period.startDate,
      endDate: period.endDate,
      academicYear: period.academicYear,
      order: period.order
    })
    setShowPeriodDialog(true)
  }

  // Funciones para escalas de calificación
  const handleCreateScale = () => {
    const newScale: GradingScale = {
      id: (gradingScales.length + 1).toString(),
      name: scaleForm.name,
      type: scaleForm.type,
      minValue: scaleForm.minValue,
      maxValue: scaleForm.maxValue,
      passingGrade: scaleForm.passingGrade,
      scales: scaleForm.scales,
      isDefault: false
    }

    setGradingScales([...gradingScales, newScale])
    setShowScaleDialog(false)
    resetScaleForm()
    toast({
      title: "Éxito",
      description: "Escala de calificación creada exitosamente"
    })
  }

  const handleSetDefaultScale = (scaleId: string) => {
    const updatedScales = gradingScales.map(s => ({
      ...s,
      isDefault: s.id === scaleId
    }))
    setGradingScales(updatedScales)
    setAcademicConfig({...academicConfig, gradingSystem: scaleId})
    toast({
      title: "Éxito",
      description: "Escala predeterminada configurada exitosamente"
    })
  }

  const resetScaleForm = () => {
    setScaleForm({
      name: '',
      type: 'numeric',
      minValue: 0,
      maxValue: 100,
      passingGrade: 70,
      scales: [
        { grade: 'A', minValue: 90, maxValue: 100, description: 'Excelente' },
        { grade: 'B', minValue: 80, maxValue: 89, description: 'Muy Bueno' },
        { grade: 'C', minValue: 70, maxValue: 79, description: 'Bueno' },
        { grade: 'D', minValue: 60, maxValue: 69, description: 'Regular' },
        { grade: 'F', minValue: 0, maxValue: 59, description: 'Reprobado' }
      ]
    })
  }

  // Función para guardar configuración general
  const handleSaveConfig = () => {
    toast({
      title: "Éxito",
      description: "Configuración académica guardada exitosamente"
    })
  }

  // Control de acceso
  if (session?.user?.role !== 'ADMIN') {
    return (
      <SidebarLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando configuración académica...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Configuración Académica
            </h1>
            <p className="text-gray-600 mt-2">
              Administra períodos académicos, escalas de calificación y configuración general
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="periods" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Períodos Académicos
            </TabsTrigger>
            <TabsTrigger value="grading" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Escalas de Calificación
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración General
            </TabsTrigger>
          </TabsList>

          {/* Períodos Académicos */}
          <TabsContent value="periods" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Períodos Académicos</h2>
                <p className="text-gray-600">Gestiona los períodos del año escolar</p>
              </div>
              <Dialog open={showPeriodDialog} onOpenChange={setShowPeriodDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Período
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPeriod ? 'Editar Período' : 'Crear Nuevo Período'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPeriod 
                        ? 'Modifica los datos del período académico'
                        : 'Completa los datos para crear un nuevo período académico'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="periodName">Nombre del Período *</Label>
                      <Input
                        id="periodName"
                        value={periodForm.name}
                        onChange={(e) => setPeriodForm({...periodForm, name: e.target.value})}
                        placeholder="Ej: Primer Bimestre"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="periodType">Tipo de Período *</Label>
                      <Select value={periodForm.type} onValueChange={(value: 'bimestre' | 'trimestre' | 'semestre') => setPeriodForm({...periodForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bimestre">Bimestre</SelectItem>
                          <SelectItem value="trimestre">Trimestre</SelectItem>
                          <SelectItem value="semestre">Semestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ValidatedDateInput
                        id="startDate"
                        label="Fecha de Inicio"
                        value={periodForm.startDate}
                        onChange={(value) => setPeriodForm({...periodForm, startDate: value})}
                        validationOptions={dateValidationPresets.academicPeriodStart}
                        required
                      />
                      <ValidatedDateInput
                        id="endDate"
                        label="Fecha de Fin"
                        value={periodForm.endDate}
                        onChange={(value) => setPeriodForm({...periodForm, endDate: value})}
                        validationOptions={dateValidationPresets.academicPeriodEnd}
                        required
                      />
                    </div>

                    {/* Date range validation message */}
                    {periodForm.startDate && periodForm.endDate && (() => {
                      const validation = validatePeriodDates(periodForm.startDate, periodForm.endDate)
                      if (!validation.rangeFvalid && validation.rangeError) {
                        return (
                          <div className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded">
                            <AlertCircle className="h-3 w-3" />
                            {validation.rangeError}
                          </div>
                        )
                      }
                      return null
                    })()}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="academicYear">Año Académico</Label>
                        <Input
                          id="academicYear"
                          value={periodForm.academicYear}
                          onChange={(e) => setPeriodForm({...periodForm, academicYear: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order">Orden</Label>
                        <Input
                          id="order"
                          type="number"
                          min="1"
                          max="6"
                          value={periodForm.order}
                          onChange={(e) => setPeriodForm({...periodForm, order: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowPeriodDialog(false)
                      setEditingPeriod(null)
                      resetPeriodForm()
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={editingPeriod ? handleUpdatePeriod : handleCreatePeriod}>
                      {editingPeriod ? 'Actualizar' : 'Crear'} Período
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periods.map((period) => (
                <Card key={period.id} className={`relative ${period.isActive ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{period.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={period.isActive ? "default" : "secondary"}>
                          {period.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {period.isActive && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                    <CardDescription>
                      {period.type.charAt(0).toUpperCase() + period.type.slice(1)} {period.order}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Fechas</Label>
                        <p className="text-sm">{period.startDate} - {period.endDate}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Año Académico</Label>
                        <p className="text-sm">{period.academicYear}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPeriod(period)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!period.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivatePeriod(period.id)}
                          >
                            Activar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePeriod(period.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {periods.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay períodos académicos</h3>
                <p className="text-gray-600 mb-4">
                  Crea el primer período académico para comenzar.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Escalas de Calificación */}
          <TabsContent value="grading" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Escalas de Calificación</h2>
                <p className="text-gray-600">Define cómo se califican los estudiantes</p>
              </div>
              <Dialog open={showScaleDialog} onOpenChange={setShowScaleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Escala
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Escala de Calificación</DialogTitle>
                    <DialogDescription>
                      Define una nueva escala para calificar a los estudiantes
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scaleName">Nombre de la Escala *</Label>
                        <Input
                          id="scaleName"
                          value={scaleForm.name}
                          onChange={(e) => setScaleForm({...scaleForm, name: e.target.value})}
                          placeholder="Ej: Escala Numérica"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="scaleType">Tipo de Escala *</Label>
                        <Select value={scaleForm.type} onValueChange={(value: 'numeric' | 'letter' | 'percentage') => setScaleForm({...scaleForm, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="numeric">Numérica (0-100)</SelectItem>
                            <SelectItem value="letter">Letras (A-F)</SelectItem>
                            <SelectItem value="percentage">Porcentaje</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minValue">Valor Mínimo</Label>
                        <Input
                          id="minValue"
                          type="number"
                          value={scaleForm.minValue}
                          onChange={(e) => setScaleForm({...scaleForm, minValue: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxValue">Valor Máximo</Label>
                        <Input
                          id="maxValue"
                          type="number"
                          value={scaleForm.maxValue}
                          onChange={(e) => setScaleForm({...scaleForm, maxValue: parseInt(e.target.value) || 100})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passingGrade">Nota Mínima</Label>
                        <Input
                          id="passingGrade"
                          type="number"
                          value={scaleForm.passingGrade}
                          onChange={(e) => setScaleForm({...scaleForm, passingGrade: parseInt(e.target.value) || 70})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Rangos de Calificación</Label>
                      <div className="space-y-2 mt-2">
                        {scaleForm.scales.map((scale, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded">
                            <Input
                              placeholder="Grado"
                              value={scale.grade}
                              onChange={(e) => {
                                const newScales = [...scaleForm.scales]
                                newScales[index] = { ...scale, grade: e.target.value }
                                setScaleForm({ ...scaleForm, scales: newScales })
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Min"
                              value={scale.minValue}
                              onChange={(e) => {
                                const newScales = [...scaleForm.scales]
                                newScales[index] = { ...scale, minValue: parseInt(e.target.value) || 0 }
                                setScaleForm({ ...scaleForm, scales: newScales })
                              }}
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={scale.maxValue}
                              onChange={(e) => {
                                const newScales = [...scaleForm.scales]
                                newScales[index] = { ...scale, maxValue: parseInt(e.target.value) || 0 }
                                setScaleForm({ ...scaleForm, scales: newScales })
                              }}
                            />
                            <Input
                              placeholder="Descripción"
                              value={scale.description}
                              onChange={(e) => {
                                const newScales = [...scaleForm.scales]
                                newScales[index] = { ...scale, description: e.target.value }
                                setScaleForm({ ...scaleForm, scales: newScales })
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowScaleDialog(false)
                      resetScaleForm()
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateScale}>
                      Crear Escala
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {gradingScales.map((scale) => (
                <Card key={scale.id} className={`${scale.isDefault ? 'ring-2 ring-green-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {scale.name}
                          {scale.isDefault && (
                            <Badge variant="default" className="bg-green-600">
                              Predeterminada
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Tipo: {scale.type} | Rango: {scale.minValue}-{scale.maxValue} | Nota mínima: {scale.passingGrade}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {!scale.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultScale(scale.id)}
                          >
                            Establecer como Predeterminada
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {scale.scales.map((s, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="font-semibold">{s.grade}</div>
                          <div className="text-sm text-gray-600">{s.minValue}-{s.maxValue}</div>
                          <div className="text-xs text-gray-500">{s.description}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {gradingScales.length === 0 && (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay escalas de calificación</h3>
                <p className="text-gray-600 mb-4">
                  Crea la primera escala de calificación para el sistema.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Configuración General */}
          <TabsContent value="config" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Configuración General</h2>
                <p className="text-gray-600">Configuración básica del sistema académico</p>
              </div>
              <Button onClick={handleSaveConfig}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Información de la Escuela
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">Nombre de la Escuela</Label>
                    <Input
                      id="schoolName"
                      value={academicConfig.schoolName}
                      onChange={(e) => setAcademicConfig({...academicConfig, schoolName: e.target.value})}
                      placeholder="Nombre de la institución"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentYear">Año Académico Actual</Label>
                    <Input
                      id="currentYear"
                      value={academicConfig.academicYear}
                      onChange={(e) => setAcademicConfig({...academicConfig, academicYear: e.target.value})}
                      placeholder="2024-2025"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Sistema Académico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodType">Tipo de Períodos</Label>
                    <Select 
                      value={academicConfig.periodType} 
                      onValueChange={(value: 'bimestre' | 'trimestre' | 'semestre') => 
                        setAcademicConfig({...academicConfig, periodType: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bimestre">Bimestres (4 períodos)</SelectItem>
                        <SelectItem value="trimestre">Trimestres (3 períodos)</SelectItem>
                        <SelectItem value="semestre">Semestres (2 períodos)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradingSystem">Sistema de Calificación</Label>
                    <Select 
                      value={academicConfig.gradingSystem} 
                      onValueChange={(value) => setAcademicConfig({...academicConfig, gradingSystem: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar escala" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradingScales.map((scale) => (
                          <SelectItem key={scale.id} value={scale.id}>
                            {scale.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Criterios de Evaluación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passingGrade">Nota Mínima para Aprobar (%)</Label>
                    <Input
                      id="passingGrade"
                      type="number"
                      min="0"
                      max="100"
                      value={academicConfig.passingGrade}
                      onChange={(e) => setAcademicConfig({...academicConfig, passingGrade: parseInt(e.target.value) || 70})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attendanceRequired">Asistencia Mínima Requerida (%)</Label>
                    <Input
                      id="attendanceRequired"
                      type="number"
                      min="0"
                      max="100"
                      value={academicConfig.attendanceRequired}
                      onChange={(e) => setAcademicConfig({...academicConfig, attendanceRequired: parseInt(e.target.value) || 80})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Estado del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Período Académico Activo</Label>
                    <p className="text-sm bg-green-50 p-2 rounded">
                      {periods.find(p => p.isActive)?.name || 'Ningún período activo'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Escala de Calificación Activa</Label>
                    <p className="text-sm bg-blue-50 p-2 rounded">
                      {gradingScales.find(s => s.isDefault)?.name || 'Ninguna escala configurada'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  )
}