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
  Users, 
  UserPlus, 
  GraduationCap, 
  Calendar,
  TrendingUp,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  MoreHorizontal
} from 'lucide-react'

interface Student {
  id: string
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  grade: string
  section: string
  gradeId?: string
  sectionId?: string
  academicGrade?: {
    id: string
    name: string
  }
  academicSection?: {
    id: string
    name: string
  }
  enrollmentDate: string
  isActive: boolean
  parent: {
    firstName: string
    lastName: string
    phone: string
    email: string
  }
  attendance?: {
    percentage: number
  }
  grades?: {
    average: number
  }
}

interface StudentStats {
  totalStudents: number
  activeStudents: number
  newThisMonth: number
  averageAttendance: number
}

export default function AdminStudentsPage() {
  const { data: session } = useSession()
  
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    activeStudents: 0,
    newThisMonth: 0,
    averageAttendance: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [grades, setGrades] = useState<Array<{ id: string; name: string }>>([])
  const [sections, setSections] = useState<Array<{ id: string; name: string }>>([])

  // Form state
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    grade: '',
    section: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    isActive: true
  })

  useEffect(() => {
    fetchStudents()
    fetchGradesAndSections()
  }, [])

  const fetchGradesAndSections = async () => {
    try {
      const [gradesRes, sectionsRes] = await Promise.all([
        fetch('/api/academic-grades'),
        fetch('/api/sections')
      ])

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json()
        // Los datos ya vienen filtrados por isActive: true desde el API
        setGrades(gradesData)
      }

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json()
        // Los datos ya vienen filtrados por isActive: true desde el API
        setSections(sectionsData)
      }
    } catch (error) {
      console.error('Error fetching grades and sections:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los grados y secciones',
        variant: 'destructive',
      })
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
        
        // Calculate stats
        const totalStudents = data.length
        const activeStudents = data.filter((s: Student) => s.isActive).length
        const newThisMonth = data.filter((s: Student) => {
          const enrollmentDate = new Date(s.enrollmentDate)
          const now = new Date()
          return enrollmentDate.getMonth() === now.getMonth() && 
                 enrollmentDate.getFullYear() === now.getFullYear()
        }).length
        const averageAttendance = data.reduce((acc: number, s: Student) => 
          acc + (s.attendance?.percentage || 0), 0) / totalStudents

        setStats({
          totalStudents,
          activeStudents,
          newThisMonth,
          averageAttendance
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStudent = async () => {
    try {
      // Validaciones básicas
      if (!studentForm.firstName.trim()) {
        toast({
          title: 'Campo requerido',
          description: 'El nombre del estudiante es requerido',
          variant: 'destructive',
        })
        return
      }

      if (!studentForm.lastName.trim()) {
        toast({
          title: 'Campo requerido',
          description: 'El apellido del estudiante es requerido',
          variant: 'destructive',
        })
        return
      }

      if (!studentForm.dateOfBirth) {
        toast({
          title: 'Campo requerido',
          description: 'La fecha de nacimiento es requerida',
          variant: 'destructive',
        })
        return
      }

      if (!studentForm.grade) {
        toast({
          title: 'Campo requerido',
          description: 'El grado es requerido',
          variant: 'destructive',
        })
        return
      }

      if (!studentForm.parentEmail.trim()) {
        toast({
          title: 'Campo requerido',
          description: 'El email del padre/madre es requerido',
          variant: 'destructive',
        })
        return
      }

      if (!studentForm.parentFirstName.trim()) {
        toast({
          title: 'Campo requerido',
          description: 'El nombre del padre/madre es requerido',
          variant: 'destructive',
        })
        return
      }

      if (!studentForm.parentLastName.trim()) {
        toast({
          title: 'Campo requerido',
          description: 'El apellido del padre/madre es requerido',
          variant: 'destructive',
        })
        return
      }

      console.log('Creating student with data:', studentForm)
      
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      })

      const responseData = await response.json()
      console.log('API Response:', responseData)

      if (response.ok) {
        toast({
          title: 'Estudiante creado',
          description: 'El estudiante ha sido creado exitosamente',
        })
        setShowStudentDialog(false)
        resetForm()
        fetchStudents()
      } else {
        console.error('API Error:', responseData)
        throw new Error(responseData.message || responseData.error || 'Error al crear estudiante')
      }
    } catch (error) {
      console.error('Error creating student:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el estudiante',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return

    try {
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      })

      if (response.ok) {
        toast({
          title: 'Estudiante actualizado',
          description: 'Los datos del estudiante han sido actualizados',
        })
        setShowStudentDialog(false)
        setEditingStudent(null)
        resetForm()
        fetchStudents()
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Error al actualizar estudiante')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el estudiante',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Estudiante eliminado',
          description: 'El estudiante ha sido eliminado del sistema',
        })
        fetchStudents()
      } else {
        throw new Error('Error al eliminar estudiante')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el estudiante',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedStudents.map(id => 
        fetch(`/api/students/${id}`, { method: 'DELETE' })
      ))
      
      toast({
        title: 'Estudiantes eliminados',
        description: `${selectedStudents.length} estudiantes eliminados`,
      })
      
      setSelectedStudents([])
      fetchStudents()
    } catch {
      toast({
        title: 'Error',
        description: 'Error al eliminar estudiantes',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setStudentForm({
      studentId: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      grade: '',
      section: '',
      parentFirstName: '',
      parentLastName: '',
      parentPhone: '',
      parentEmail: '',
      isActive: true
    })
  }

  const openEditDialog = (student: Student) => {
    setEditingStudent(student)
    setStudentForm({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : '',
      grade: student.gradeId || student.academicGrade?.id || student.grade,
      section: student.sectionId || student.academicSection?.id || student.section,
      parentFirstName: student.parent?.firstName || '',
      parentLastName: student.parent?.lastName || '',
      parentPhone: student.parent?.phone || '',
      parentEmail: student.parent?.email || '',
      isActive: student.isActive
    })
    setShowStudentDialog(true)
  }

  const openCreateDialog = () => {
    setEditingStudent(null)
    resetForm()
    setShowStudentDialog(true)
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const toggleAllSelection = () => {
    setSelectedStudents(
      selectedStudents.length === filteredStudents.length ? [] : filteredStudents.map(s => s.id)
    )
  }

  // Filter students based on search term
  const filteredStudents = (Array.isArray(students) ? students : []).filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const statsCards = [
    {
      title: 'Total Estudiantes',
      value: stats.totalStudents.toString(),
      description: `${stats.activeStudents} activos`,
      icon: Users,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Nuevos este Mes',
      value: stats.newThisMonth.toString(),
      description: 'Estudiantes registrados',
      icon: UserPlus,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Promedio Asistencia',
      value: `${stats.averageAttendance.toFixed(1)}%`,
      description: 'Asistencia general',
      icon: Calendar,
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Rendimiento',
      value: '8.2',
      description: 'Promedio general',
      icon: TrendingUp,
      trend: { value: 2, isPositive: true },
    },
  ]

  const actions = [
    {
      label: 'Nuevo Estudiante',
      onClick: openCreateDialog,
      icon: UserPlus,
      variant: 'default' as const,
    },
    {
      label: 'Exportar',
      onClick: () => {},
      icon: Download,
      variant: 'outline' as const,
    },
    {
      label: 'Filtros',
      onClick: () => {},
      icon: Filter,
      variant: 'outline' as const,
    },
  ]

  const bulkActions = [
    {
      label: 'Activar',
      onClick: () => {},
      icon: UserCheck,
    },
    {
      label: 'Desactivar', 
      onClick: () => {},
      icon: UserX,
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
          title="Gestión de Estudiantes"
          description="Administra los estudiantes del sistema educativo"
          icon={GraduationCap}
        />

        <StatsGrid stats={statsCards} />

        <Section>
          <ActionToolbar 
            actions={actions}
            selectedCount={selectedStudents.length}
            bulkActions={bulkActions}
            onSearch={setSearchTerm}
            searchPlaceholder="Buscar estudiantes..."
          />

          {loading ? (
            <LoadingState message="Cargando estudiantes..." />
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No hay estudiantes registrados"
              description="Comienza agregando el primer estudiante al sistema"
              action={{
                label: 'Agregar Estudiante',
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
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onCheckedChange={toggleAllSelection}
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Grado</TableHead>
                      <TableHead>Padre/Tutor</TableHead>
                      <TableHead>Asistencia</TableHead>
                      <TableHead>Promedio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Ingreso</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudentSelection(student.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.studentId}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {student.studentId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.grade} - {student.section}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-sm">
                              {student.parent ? 
                                `${student.parent.firstName} ${student.parent.lastName}` : 
                                'Sin asignar'
                              }
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.parent?.phone || 'Sin teléfono'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                              <div 
                                className={`h-2 rounded-full ${
                                  (student.attendance?.percentage || 0) >= 90 ? 'bg-green-500' :
                                  (student.attendance?.percentage || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.max(student.attendance?.percentage || 0, 0)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium min-w-[40px]">
                              {student.attendance?.percentage || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              (student.grades?.average || 0) >= 7 ? 'default' : 
                              (student.grades?.average || 0) >= 5 ? 'secondary' : 'destructive'
                            }
                          >
                            {(student.grades?.average || 0).toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.isActive ? 'default' : 'secondary'}>
                            {student.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(student.enrollmentDate)}
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
                              <DropdownMenuItem onClick={() => openEditDialog(student)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteStudent(student.id)}
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

        {/* Student Dialog */}
        <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
              </DialogTitle>
              <DialogDescription>
                {editingStudent 
                  ? 'Modifica los datos del estudiante' 
                  : 'Agrega un nuevo estudiante al sistema'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentId">ID Estudiante</Label>
                  <Input
                    id="studentId"
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({
                      ...studentForm,
                      studentId: e.target.value
                    })}
                    placeholder="Ej: EST001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm({
                      ...studentForm,
                      firstName: e.target.value
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({
                      ...studentForm,
                      lastName: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={studentForm.dateOfBirth}
                    onChange={(e) => setStudentForm({
                      ...studentForm,
                      dateOfBirth: e.target.value
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade">Grado</Label>
                  <Select 
                    value={studentForm.grade} 
                    onValueChange={(value) => setStudentForm({
                      ...studentForm,
                      grade: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="section">Sección</Label>
                  <Select 
                    value={studentForm.section} 
                    onValueChange={(value) => setStudentForm({
                      ...studentForm,
                      section: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Datos del Padre/Tutor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="parentFirstName">Nombre del Padre</Label>
                    <Input
                      id="parentFirstName"
                      value={studentForm.parentFirstName}
                      onChange={(e) => setStudentForm({
                        ...studentForm,
                        parentFirstName: e.target.value
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="parentLastName">Apellido del Padre</Label>
                    <Input
                      id="parentLastName"
                      value={studentForm.parentLastName}
                      onChange={(e) => setStudentForm({
                        ...studentForm,
                        parentLastName: e.target.value
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="parentPhone">Teléfono</Label>
                    <Input
                      id="parentPhone"
                      value={studentForm.parentPhone}
                      onChange={(e) => setStudentForm({
                        ...studentForm,
                        parentPhone: e.target.value
                      })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="parentEmail">Email del Padre</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={studentForm.parentEmail}
                      onChange={(e) => setStudentForm({
                        ...studentForm,
                        parentEmail: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowStudentDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingStudent ? handleUpdateStudent : handleCreateStudent}
              >
                {editingStudent ? 'Actualizar' : 'Crear'} Estudiante
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  )
}