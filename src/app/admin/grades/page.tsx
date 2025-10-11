'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Grid3x3,
  Search,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AcademicGrade {
  id: string
  name: string
  level: number
  description?: string
  isActive: boolean
  studentCount?: number
  classCount?: number
  createdAt: string
  updatedAt: string
}

interface Section {
  id: string
  name: string
  description?: string
  isActive: boolean
  studentCount?: number
  classCount?: number
  createdAt: string
  updatedAt: string
}

interface GradeSection {
  id: string
  gradeId: string
  sectionId: string
  capacity: number
  isActive: boolean
  currentStudents?: number
  grade: AcademicGrade
  section: Section
}

export default function AdminGradesManagementPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [grades, setGrades] = useState<AcademicGrade[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Dialog states
  const [showGradeDialog, setShowGradeDialog] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [showGradeSectionDialog, setShowGradeSectionDialog] = useState(false)
  const [editingGrade, setEditingGrade] = useState<AcademicGrade | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)

  // Form states
  const [gradeForm, setGradeForm] = useState({
    name: '',
    level: 1,
    description: '',
    isActive: true
  })

  const [sectionForm, setSectionForm] = useState({
    name: '',
    description: '',
    isActive: true
  })

  const [gradeSectionForm, setGradeSectionForm] = useState({
    gradeId: '',
    sectionId: '',
    capacity: 25,
    isActive: true
  })

  // Mock data - En producción esto vendría de APIs
  useEffect(() => {
    const mockGrades: AcademicGrade[] = [
      {
        id: '1',
        name: '1ro',
        level: 1,
        description: 'Primer grado de educación primaria',
        isActive: true,
        studentCount: 45,
        classCount: 3,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      },
      {
        id: '2',
        name: '2do',
        level: 2,
        description: 'Segundo grado de educación primaria',
        isActive: true,
        studentCount: 42,
        classCount: 3,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      },
      {
        id: '3',
        name: '3ro',
        level: 3,
        description: 'Tercer grado de educación primaria',
        isActive: true,
        studentCount: 38,
        classCount: 2,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      },
      {
        id: '4',
        name: '4to',
        level: 4,
        description: 'Cuarto grado de educación primaria',
        isActive: true,
        studentCount: 35,
        classCount: 2,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      },
      {
        id: '5',
        name: '5to',
        level: 5,
        description: 'Quinto grado de educación primaria',
        isActive: true,
        studentCount: 40,
        classCount: 3,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      },
      {
        id: '6',
        name: '6to',
        level: 6,
        description: 'Sexto grado de educación primaria',
        isActive: false,
        studentCount: 0,
        classCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      }
    ]

    const mockSections: Section[] = [
      {
        id: '1',
        name: 'A',
        description: 'Sección A - Grupo principal',
        isActive: true,
        studentCount: 120,
        classCount: 15,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      },
      {
        id: '2',
        name: 'B',
        description: 'Sección B - Grupo secundario',
        isActive: true,
        studentCount: 80,
        classCount: 10,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      },
      {
        id: '3',
        name: 'C',
        description: 'Sección C - Grupo adicional',
        isActive: true,
        studentCount: 0,
        classCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-10-01'
      }
    ]

    const mockGradeSections: GradeSection[] = [
      {
        id: '1',
        gradeId: '1',
        sectionId: '1',
        capacity: 25,
        isActive: true,
        currentStudents: 22,
        grade: mockGrades[0],
        section: mockSections[0]
      },
      {
        id: '2',
        gradeId: '1',
        sectionId: '2',
        capacity: 25,
        isActive: true,
        currentStudents: 23,
        grade: mockGrades[0],
        section: mockSections[1]
      },
      {
        id: '3',
        gradeId: '2',
        sectionId: '1',
        capacity: 25,
        isActive: true,
        currentStudents: 21,
        grade: mockGrades[1],
        section: mockSections[0]
      },
      {
        id: '4',
        gradeId: '5',
        sectionId: '1',
        capacity: 25,
        isActive: true,
        currentStudents: 22,
        grade: mockGrades[4],
        section: mockSections[0]
      },
      {
        id: '5',
        gradeId: '5',
        sectionId: '2',
        capacity: 25,
        isActive: true,
        currentStudents: 18,
        grade: mockGrades[4],
        section: mockSections[1]
      }
    ]

    setTimeout(() => {
      setGrades(mockGrades)
      setSections(mockSections)
      setGradeSections(mockGradeSections)
      setLoading(false)
    }, 1000)
  }, [])

  // Grade CRUD operations
  const handleCreateGrade = () => {
    const newGrade: AcademicGrade = {
      id: (grades.length + 1).toString(),
      name: gradeForm.name,
      level: gradeForm.level,
      description: gradeForm.description,
      isActive: gradeForm.isActive,
      studentCount: 0,
      classCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setGrades([...grades, newGrade])
    setShowGradeDialog(false)
    resetGradeForm()
    toast({
      title: "Grado creado",
      description: `El grado ${newGrade.name} ha sido creado exitosamente.`,
    })
  }

  const handleUpdateGrade = () => {
    if (!editingGrade) return

    const updatedGrades = grades.map(g => 
      g.id === editingGrade.id 
        ? {
            ...g,
            name: gradeForm.name,
            level: gradeForm.level,
            description: gradeForm.description,
            isActive: gradeForm.isActive,
            updatedAt: new Date().toISOString()
          }
        : g
    )

    setGrades(updatedGrades)
    setShowGradeDialog(false)
    setEditingGrade(null)
    resetGradeForm()
    toast({
      title: "Grado actualizado",
      description: `El grado ${gradeForm.name} ha sido actualizado exitosamente.`,
    })
  }

  const handleDeleteGrade = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId)
    if (grade && (grade.studentCount! > 0 || grade.classCount! > 0)) {
      toast({
        title: "No se puede eliminar",
        description: "Este grado tiene estudiantes o clases asignadas.",
        variant: "destructive"
      })
      return
    }

    setGrades(grades.filter(g => g.id !== gradeId))
    toast({
      title: "Grado eliminado",
      description: "El grado ha sido eliminado exitosamente.",
    })
  }

  // Section CRUD operations
  const handleCreateSection = () => {
    const newSection: Section = {
      id: (sections.length + 1).toString(),
      name: sectionForm.name,
      description: sectionForm.description,
      isActive: sectionForm.isActive,
      studentCount: 0,
      classCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setSections([...sections, newSection])
    setShowSectionDialog(false)
    resetSectionForm()
    toast({
      title: "Sección creada",
      description: `La sección ${newSection.name} ha sido creada exitosamente.`,
    })
  }

  const handleUpdateSection = () => {
    if (!editingSection) return

    const updatedSections = sections.map(s => 
      s.id === editingSection.id 
        ? {
            ...s,
            name: sectionForm.name,
            description: sectionForm.description,
            isActive: sectionForm.isActive,
            updatedAt: new Date().toISOString()
          }
        : s
    )

    setSections(updatedSections)
    setShowSectionDialog(false)
    setEditingSection(null)
    resetSectionForm()
    toast({
      title: "Sección actualizada",
      description: `La sección ${sectionForm.name} ha sido actualizada exitosamente.`,
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section && (section.studentCount! > 0 || section.classCount! > 0)) {
      toast({
        title: "No se puede eliminar",
        description: "Esta sección tiene estudiantes o clases asignadas.",
        variant: "destructive"
      })
      return
    }

    setSections(sections.filter(s => s.id !== sectionId))
    toast({
      title: "Sección eliminada",
      description: "La sección ha sido eliminada exitosamente.",
    })
  }

  // GradeSection CRUD operations
  const handleCreateGradeSection = () => {
    const grade = grades.find(g => g.id === gradeSectionForm.gradeId)
    const section = sections.find(s => s.id === gradeSectionForm.sectionId)
    
    if (!grade || !section) return

    const newGradeSection: GradeSection = {
      id: (gradeSections.length + 1).toString(),
      gradeId: gradeSectionForm.gradeId,
      sectionId: gradeSectionForm.sectionId,
      capacity: gradeSectionForm.capacity,
      isActive: gradeSectionForm.isActive,
      currentStudents: 0,
      grade,
      section
    }

    setGradeSections([...gradeSections, newGradeSection])
    setShowGradeSectionDialog(false)
    resetGradeSectionForm()
    toast({
      title: "Combinación creada",
      description: `${grade.name}-${section.name} ha sido creada exitosamente.`,
    })
  }

  // Form reset functions
  const resetGradeForm = () => {
    setGradeForm({
      name: '',
      level: 1,
      description: '',
      isActive: true
    })
  }

  const resetSectionForm = () => {
    setSectionForm({
      name: '',
      description: '',
      isActive: true
    })
  }

  const resetGradeSectionForm = () => {
    setGradeSectionForm({
      gradeId: '',
      sectionId: '',
      capacity: 25,
      isActive: true
    })
  }

  // Edit handlers
  const handleEditGrade = (grade: AcademicGrade) => {
    setEditingGrade(grade)
    setGradeForm({
      name: grade.name,
      level: grade.level,
      description: grade.description || '',
      isActive: grade.isActive
    })
    setShowGradeDialog(true)
  }

  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setSectionForm({
      name: section.name,
      description: section.description || '',
      isActive: section.isActive
    })
    setShowSectionDialog(true)
  }

  // Access control
  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando gestión de grados y secciones...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gestión de Grados y Secciones
          </h1>
          <p className="text-gray-600 mt-2">
            Administra la estructura académica de tu institución
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Grados Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {grades.filter(g => g.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Grid3x3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Secciones Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sections.filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {grades.reduce((acc, g) => acc + (g.studentCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Combinaciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {gradeSections.filter(gs => gs.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar grados, secciones o combinaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="grades" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grades">Grados Académicos</TabsTrigger>
          <TabsTrigger value="sections">Secciones</TabsTrigger>
          <TabsTrigger value="combinations">Combinaciones</TabsTrigger>
        </TabsList>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Grados Académicos</CardTitle>
                <CardDescription>
                  Gestiona los grados educativos de tu institución
                </CardDescription>
              </div>
              <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Grado
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingGrade ? 'Editar Grado' : 'Crear Nuevo Grado'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingGrade 
                        ? 'Modifica los datos del grado académico'
                        : 'Completa los datos para crear un nuevo grado académico'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="gradeName">Nombre del Grado</Label>
                      <Input
                        id="gradeName"
                        value={gradeForm.name}
                        onChange={(e) => setGradeForm({...gradeForm, name: e.target.value})}
                        placeholder="Ej: 1ro, 2do, 3ro..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gradeLevel">Nivel Numérico</Label>
                      <Input
                        id="gradeLevel"
                        type="number"
                        min="1"
                        max="12"
                        value={gradeForm.level}
                        onChange={(e) => setGradeForm({...gradeForm, level: parseInt(e.target.value) || 1})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gradeDescription">Descripción</Label>
                      <Textarea
                        id="gradeDescription"
                        value={gradeForm.description}
                        onChange={(e) => setGradeForm({...gradeForm, description: e.target.value})}
                        placeholder="Descripción del grado académico"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="gradeActive"
                        checked={gradeForm.isActive}
                        onCheckedChange={(checked) => setGradeForm({...gradeForm, isActive: checked})}
                      />
                      <Label htmlFor="gradeActive">Grado activo</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowGradeDialog(false)
                      setEditingGrade(null)
                      resetGradeForm()
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={editingGrade ? handleUpdateGrade : handleCreateGrade}>
                      {editingGrade ? 'Actualizar' : 'Crear'} Grado
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {grades
                  .filter(grade => 
                    grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (grade.description && grade.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{grade.name}</h4>
                        <Badge variant={grade.isActive ? "default" : "secondary"}>
                          {grade.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="outline">Nivel {grade.level}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{grade.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>{grade.studentCount} estudiantes</span>
                        <span>{grade.classCount} clases</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditGrade(grade)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteGrade(grade.id)}
                        className="text-red-600"
                        disabled={grade.studentCount! > 0 || grade.classCount! > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Secciones</CardTitle>
                <CardDescription>
                  Gestiona las secciones para organizar a los estudiantes
                </CardDescription>
              </div>
              <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Sección
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSection ? 'Editar Sección' : 'Crear Nueva Sección'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSection 
                        ? 'Modifica los datos de la sección'
                        : 'Completa los datos para crear una nueva sección'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="sectionName">Nombre de la Sección</Label>
                      <Input
                        id="sectionName"
                        value={sectionForm.name}
                        onChange={(e) => setSectionForm({...sectionForm, name: e.target.value})}
                        placeholder="Ej: A, B, C..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sectionDescription">Descripción</Label>
                      <Textarea
                        id="sectionDescription"
                        value={sectionForm.description}
                        onChange={(e) => setSectionForm({...sectionForm, description: e.target.value})}
                        placeholder="Descripción de la sección"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sectionActive"
                        checked={sectionForm.isActive}
                        onCheckedChange={(checked) => setSectionForm({...sectionForm, isActive: checked})}
                      />
                      <Label htmlFor="sectionActive">Sección activa</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowSectionDialog(false)
                      setEditingSection(null)
                      resetSectionForm()
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={editingSection ? handleUpdateSection : handleCreateSection}>
                      {editingSection ? 'Actualizar' : 'Crear'} Sección
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sections
                  .filter(section => 
                    section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (section.description && section.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Sección {section.name}</h4>
                        <Badge variant={section.isActive ? "default" : "secondary"}>
                          {section.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>{section.studentCount} estudiantes</span>
                        <span>{section.classCount} clases</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditSection(section)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-600"
                        disabled={section.studentCount! > 0 || section.classCount! > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grade-Section Combinations Tab */}
        <TabsContent value="combinations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Combinaciones Grado-Sección</CardTitle>
                <CardDescription>
                  Gestiona las combinaciones disponibles para formar clases
                </CardDescription>
              </div>
              <Dialog open={showGradeSectionDialog} onOpenChange={setShowGradeSectionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Combinación
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Combinación</DialogTitle>
                    <DialogDescription>
                      Selecciona un grado y una sección para crear una nueva combinación
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="gradeSelect">Grado</Label>
                      <select
                        id="gradeSelect"
                        value={gradeSectionForm.gradeId}
                        onChange={(e) => setGradeSectionForm({...gradeSectionForm, gradeId: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Seleccionar grado</option>
                        {grades.filter(g => g.isActive).map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {grade.name} - {grade.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sectionSelect">Sección</Label>
                      <select
                        id="sectionSelect"
                        value={gradeSectionForm.sectionId}
                        onChange={(e) => setGradeSectionForm({...gradeSectionForm, sectionId: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Seleccionar sección</option>
                        {sections.filter(s => s.isActive).map((section) => (
                          <option key={section.id} value={section.id}>
                            Sección {section.name} - {section.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidad</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        max="50"
                        value={gradeSectionForm.capacity}
                        onChange={(e) => setGradeSectionForm({...gradeSectionForm, capacity: parseInt(e.target.value) || 25})}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="combinationActive"
                        checked={gradeSectionForm.isActive}
                        onCheckedChange={(checked) => setGradeSectionForm({...gradeSectionForm, isActive: checked})}
                      />
                      <Label htmlFor="combinationActive">Combinación activa</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowGradeSectionDialog(false)
                      resetGradeSectionForm()
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateGradeSection}>
                      Crear Combinación
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradeSections
                  .filter(gs => 
                    gs.grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    gs.section.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((gradeSection) => (
                  <Card key={gradeSection.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">
                          {gradeSection.grade.name}-{gradeSection.section.name}
                        </h4>
                        <Badge variant={gradeSection.isActive ? "default" : "secondary"}>
                          {gradeSection.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacidad:</span>
                          <span className="font-medium">{gradeSection.capacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estudiantes:</span>
                          <span className="font-medium">{gradeSection.currentStudents || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Disponibles:</span>
                          <span className="font-medium text-green-600">
                            {gradeSection.capacity - (gradeSection.currentStudents || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Ocupación</span>
                          <span className="text-xs text-gray-500">
                            {Math.round(((gradeSection.currentStudents || 0) / gradeSection.capacity) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(((gradeSection.currentStudents || 0) / gradeSection.capacity) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </SidebarLayout>
  )
}