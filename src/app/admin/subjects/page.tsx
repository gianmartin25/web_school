'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SidebarLayout } from '@/components/sidebar-layout'
import { 
  PageHeader, 
  StatsGrid, 
  ActionToolbar, 
  EmptyState, 
  LoadingState,
  Section 
} from '@/components/ui/layout-components'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { 
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  GraduationCap,

  Eye,
  MoreHorizontal,
  Award,
  User,
  TrendingUp
} from 'lucide-react'
import { MultiUserCombobox } from '@/components/multi-user-combobox'

interface Teacher {
  id: string
  firstName: string
  lastName: string
}

interface Subject {
  id: string
  name: string
  code: string
  description?: string
  credits: number
  isActive: boolean
  teacherIds?: string[]
  teacher?: Teacher | null
  classCount?: number
  studentCount?: number
}

interface SubjectStats {
  totalSubjects: number
  activeSubjects: number
  totalCredits: number
  totalStudents: number
  averageStudentsPerSubject: number
}

export default function AdminSubjectsPage() {
  const { data: session } = useSession()
  
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [stats, setStats] = useState<SubjectStats>({
    totalSubjects: 0,
    activeSubjects: 0,
    totalCredits: 0,
    totalStudents: 0,
    averageStudentsPerSubject: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    credits: '3',
    teacherIds: [] as string[],
    isActive: true
  })

  useEffect(() => {
    fetchSubjects()
    fetchTeachers()
  }, [])

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
        
        // Calculate stats
        const totalSubjects = data.length
        const activeSubjects = data.filter((s: Subject) => s.isActive).length
        const totalCredits = data.reduce((acc: number, s: Subject) => acc + s.credits, 0)
        const totalStudents = data.reduce((acc: number, s: Subject) => acc + (s.studentCount || 0), 0)
        const averageStudentsPerSubject = totalSubjects > 0 ? totalStudents / totalSubjects : 0

        setStats({
          totalSubjects,
          activeSubjects,
          totalCredits,
          totalStudents,
          averageStudentsPerSubject
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las materias',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers')
      if (response.ok) {
        const data = await response.json()
        // data.teachers es el array correcto
        setTeachers(Array.isArray(data.teachers) ? data.teachers : [])
      }
    } catch {
      console.error('Error loading teachers')
    }
  }

  const handleCreateSubject = async () => {
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subjectForm,
          credits: parseInt(subjectForm.credits),
          teacherIds: Array.isArray(subjectForm.teacherIds) ? subjectForm.teacherIds : []
        }),
      })

      if (response.ok) {
        toast({
          title: 'Materia creada',
          description: 'La materia ha sido creada exitosamente',
        })
        setShowSubjectDialog(false)
        resetForm()
        fetchSubjects()
      } else {
        throw new Error('Error al crear materia')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo crear la materia',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateSubject = async () => {
    if (!editingSubject) return

    try {
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subjectForm,
          credits: parseInt(subjectForm.credits),
          teacherIds: Array.isArray(subjectForm.teacherIds) ? subjectForm.teacherIds : []
        }),
      })

      if (response.ok) {
        toast({
          title: 'Materia actualizada',
          description: 'Los datos de la materia han sido actualizados',
        })
        setShowSubjectDialog(false)
        setEditingSubject(null)
        resetForm()
        fetchSubjects()
      } else {
        throw new Error('Error al actualizar materia')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la materia',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Materia eliminada',
          description: 'La materia ha sido eliminada del sistema',
        })
        fetchSubjects()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar materia')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo eliminar la materia'
      toast({
        title: 'Error al eliminar',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedSubjects.map(id => 
        fetch(`/api/subjects/${id}`, { method: 'DELETE' })
      ))
      
      toast({
        title: 'Materias eliminadas',
        description: `${selectedSubjects.length} materias eliminadas`,
      })
      
      setSelectedSubjects([])
      fetchSubjects()
    } catch {
      toast({
        title: 'Error',
        description: 'Error al eliminar materias',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setSubjectForm({
      name: '',
      code: '',
      description: '',
      credits: '3',
      teacherIds: [] as string[],
      isActive: true
    })
  }

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject)
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      credits: subject.credits.toString(),
      teacherIds: subject.teacherIds || [],
      isActive: subject.isActive
    })
    setShowSubjectDialog(true)
  }

  const openCreateDialog = () => {
    setEditingSubject(null)
    resetForm()
    setShowSubjectDialog(true)
  }

  const toggleSubjectSelection = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const toggleAllSelection = () => {
    setSelectedSubjects(
      selectedSubjects.length === filteredSubjects.length ? [] : filteredSubjects.map(s => s.id)
    )
  }

  // Filter subjects based on search term
  const filteredSubjects = (Array.isArray(subjects) ? subjects : []).filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.teacher && 
     `${subject.teacher.firstName} ${subject.teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const statsCards = [
    {
      title: 'Total Materias',
      value: stats.totalSubjects.toString(),
      description: `${stats.activeSubjects} activas`,
      icon: BookOpen,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Créditos Totales',
      value: stats.totalCredits.toString(),
      description: 'Créditos del sistema',
      icon: Award,
      trend: { value: 3, isPositive: true },
    },
    {
      title: 'Estudiantes Inscritos',
      value: stats.totalStudents.toString(),
      description: 'En todas las materias',
      icon: GraduationCap,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Promedio por Materia',
      value: Math.round(stats.averageStudentsPerSubject).toString(),
      description: 'Estudiantes por materia',
      icon: TrendingUp,
      trend: { value: 5, isPositive: true },
    },
  ]

  const actions = [
    {
      label: 'Nueva Materia',
      onClick: openCreateDialog,
      icon: Plus,
      variant: 'default' as const,
    },
  ]

  const bulkActions = [
    {
      label: 'Activar',
      onClick: () => {},
      icon: Eye,
    },
    {
      label: 'Desactivar', 
      onClick: () => {},
      icon: Eye,
    },
    {
      label: 'Eliminar',
      onClick: handleBulkDelete,
      icon: Trash2,
      variant: 'destructive' as const,
    },
  ]

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <PageHeader
          title="Gestión de Materias"
          description="Administra las materias y asignaturas del sistema educativo"
          icon={BookOpen}
        />

        <StatsGrid stats={statsCards} />

        <Section>
          <ActionToolbar 
            actions={actions}
            selectedCount={selectedSubjects.length}
            bulkActions={bulkActions}
            onSearch={setSearchTerm}
            searchPlaceholder="Buscar materias..."
          />

          {loading ? (
            <LoadingState message="Cargando materias..." />
          ) : filteredSubjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No hay materias registradas"
              description="Comienza agregando la primera materia al sistema"
              action={{
                label: 'Agregar Materia',
                onClick: openCreateDialog,
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedSubjects.length === filteredSubjects.length && filteredSubjects.length > 0}
                          onCheckedChange={toggleAllSelection}
                        />
                      </TableHead>
                      <TableHead>Materia</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Profesor Asignado</TableHead>
                      <TableHead>Clases</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedSubjects.includes(subject.id)}
                            onCheckedChange={() => toggleSubjectSelection(subject.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {subject.name}
                            </div>
                            {subject.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {subject.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {subject.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{subject.credits}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {subject.teacher ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {subject.teacher.firstName} {subject.teacher.lastName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin asignar</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{subject.classCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{subject.studentCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                            {subject.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {}}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(subject)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteSubject(subject.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </Section>

        {/* Subject Dialog */}
        <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
              </DialogTitle>
              <DialogDescription>
                {editingSubject 
                  ? 'Modifica los datos de la materia' 
                  : 'Agrega una nueva materia al sistema'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la Materia</Label>
                  <Input
                    id="name"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({
                      ...subjectForm,
                      name: e.target.value
                    })}
                    placeholder="Ej: Matemáticas"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({
                      ...subjectForm,
                      code: e.target.value
                    })}
                    placeholder="Ej: MAT001"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({
                    ...subjectForm,
                    description: e.target.value
                  })}
                  placeholder="Descripción de la materia..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="credits">Créditos</Label>
                  <Select 
                    value={subjectForm.credits} 
                    onValueChange={(value) => setSubjectForm({
                      ...subjectForm,
                      credits: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar créditos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Crédito</SelectItem>
                      <SelectItem value="2">2 Créditos</SelectItem>
                      <SelectItem value="3">3 Créditos</SelectItem>
                      <SelectItem value="4">4 Créditos</SelectItem>
                      <SelectItem value="5">5 Créditos</SelectItem>
                      <SelectItem value="6">6 Créditos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="teacherIds">Profesores asignados</Label>
                  <MultiUserCombobox
                    users={(Array.isArray(teachers) ? teachers : []).map(t => ({
                      id: t.id,
                      name: `${t.firstName} ${t.lastName}`,
                      email: '',
                      role: 'TEACHER'
                    }))}
                    values={subjectForm.teacherIds}
                    onValuesChange={ids => setSubjectForm(prev => ({ ...prev, teacherIds: ids }))}
                    placeholder="Seleccionar profesores..."
                    maxSelections={10}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowSubjectDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingSubject ? handleUpdateSubject : handleCreateSubject}
              >
                {editingSubject ? 'Actualizar' : 'Crear'} Materia
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  )
}