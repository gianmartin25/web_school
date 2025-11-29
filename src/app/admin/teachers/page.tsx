'use client'

import { useState, useEffect, useCallback } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MultiSubjectCombobox } from '@/components/multi-subject-combobox'
import { toast } from '@/hooks/use-toast'
import { 
  Users, 
  UserPlus, 
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  MoreHorizontal,
  Building
} from 'lucide-react'

interface Teacher {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  hireDate: string
  salary?: number
  isActive: boolean
  subjects: Subject[]
  classes: Class[]
  totalStudents: number
}

interface Subject {
  id: string
  name: string
  code: string
  credits: number
  studentCount: number
}

interface Class {
  id: string
  name: string
  grade: string
  section: string
  studentCount: number
}

interface TeacherStats {
  totalTeachers: number
  activeTeachers: number
  totalSubjects: number
  totalStudents: number
  averageSalary: number
}

export default function AdminTeachersPage() {
  const { data: session } = useSession()
  
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [stats, setStats] = useState<TeacherStats>({
    totalTeachers: 0,
    activeTeachers: 0,
    totalSubjects: 0,
    totalStudents: 0,
    averageSalary: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])
  const [showTeacherDialog, setShowTeacherDialog] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estado para materias
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  // Form state
  const [teacherForm, setTeacherForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: '',
    isActive: true
  })

  const fetchSubjects = useCallback(async () => {
    try {
      console.log('Fetching subjects...')
      const response = await fetch('/api/subjects')
      console.log('Subjects response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Subjects data received:', data)
        
        // El API devuelve un array directo de subjects
        const subjectsArray = Array.isArray(data) ? data : (data.subjects || [])
        setSubjects(subjectsArray)
        console.log('Subjects loaded:', subjectsArray.length)
      } else {
        const errorData = await response.json()
        console.error('Error fetching subjects:', response.status, errorData)
        
        // Si hay error de autenticación, intentar de nuevo después de un delay
        if (response.status === 401) {
          console.log('Authentication error, retrying in 2 seconds...')
          setTimeout(() => {
            fetchSubjects()
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }, [])

  useEffect(() => {
    fetchTeachers()
    fetchSubjects()
  }, [fetchSubjects])

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/teachers')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Teachers data:', data)
        
        // El API devuelve { teachers, stats }
        const teachersArray = data.teachers || []
        setTeachers(teachersArray)
        
        // Usar las estadísticas del servidor si están disponibles
        if (data.stats) {
          setStats(data.stats)
        } else {
          // Calcular stats como fallback
          const totalTeachers = teachersArray.length
          const activeTeachers = teachersArray.filter((t: Teacher) => t.isActive).length
          const totalSubjects = teachersArray.reduce((acc: number, t: Teacher) => acc + (t.subjects?.length || 0), 0)
          const totalStudents = teachersArray.reduce((acc: number, t: Teacher) => acc + t.totalStudents, 0)
          const averageSalary = teachersArray.length > 0 ? 
            teachersArray.reduce((acc: number, t: Teacher) => acc + (t.salary || 0), 0) / totalTeachers : 0

          setStats({
            totalTeachers,
            activeTeachers,
            totalSubjects,
            totalStudents,
            averageSalary
          })
        }
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        toast({
          title: 'Error',
          description: errorData.error || 'No se pudieron cargar los profesores',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los profesores',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeacher = async () => {
    try {
      // Preparar datos para el API
      const teacherData = {
        name: `${teacherForm.firstName} ${teacherForm.lastName}`,
        email: teacherForm.email,
        employeeId: teacherForm.employeeId || undefined, // Opcional
        firstName: teacherForm.firstName,
        lastName: teacherForm.lastName,
        phone: teacherForm.phone || null,
        address: teacherForm.address || null,
        dateOfBirth: teacherForm.dateOfBirth || null,
        salary: teacherForm.salary ? parseFloat(teacherForm.salary) : null,
        subjectIds: selectedSubjects // Incluir materias seleccionadas
      }

      console.log('Enviando datos:', teacherData)

      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
      })

      const responseData = await response.json()
      console.log('Respuesta del servidor:', responseData)

      if (response.ok) {
        toast({
          title: 'Profesor creado',
          description: `El profesor ha sido creado exitosamente. ID: ${responseData.teacher.employeeId}. Contraseña temporal: ${responseData.tempPassword}`,
        })
        setShowTeacherDialog(false)
        resetForm()
        fetchTeachers()
      } else {
        const errorMessage = responseData.error || 'Error al crear profesor'
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating teacher:', error)
      toast({
        title: 'Error',
        description: 'No se pudo crear el profesor',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return

    try {
      const response = await fetch(`/api/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...teacherForm,
          salary: teacherForm.salary ? parseFloat(teacherForm.salary) : null,
          subjectIds: selectedSubjects // Incluir materias seleccionadas
        }),
      })

      if (response.ok) {
        toast({
          title: 'Profesor actualizado',
          description: 'Los datos del profesor han sido actualizados',
        })
        setShowTeacherDialog(false)
        setEditingTeacher(null)
        resetForm()
        fetchTeachers()
      } else {
        throw new Error('Error al actualizar profesor')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el profesor',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Profesor eliminado',
          description: 'El profesor ha sido eliminado del sistema',
        })
        fetchTeachers()
      } else {
        throw new Error('Error al eliminar profesor')
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el profesor',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTeachers.map(id => 
        fetch(`/api/teachers/${id}`, { method: 'DELETE' })
      ))
      
      toast({
        title: 'Profesores eliminados',
        description: `${selectedTeachers.length} profesores eliminados`,
      })
      
      setSelectedTeachers([])
      fetchTeachers()
    } catch {
      toast({
        title: 'Error',
        description: 'Error al eliminar profesores',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setTeacherForm({
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      hireDate: new Date().toISOString().split('T')[0],
      salary: '',
      isActive: true
    })
    setSelectedSubjects([])
  }

  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setTeacherForm({
      employeeId: teacher.employeeId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone || '',
      address: teacher.address || '',
      dateOfBirth: teacher.dateOfBirth || '',
      hireDate: teacher.hireDate,
      salary: teacher.salary?.toString() || '',
      isActive: teacher.isActive
    })
    setSelectedSubjects(teacher.subjects?.map(s => s.id) || [])
    setShowTeacherDialog(true)
  }

  const openCreateDialog = () => {
    setEditingTeacher(null)
    resetForm()
    setShowTeacherDialog(true)
  }

  const toggleTeacherSelection = (teacherId: string) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    )
  }

  const toggleAllSelection = () => {
    setSelectedTeachers(
      selectedTeachers.length === filteredTeachers.length ? [] : filteredTeachers.map(t => t.id)
    )
  }

  // Filter teachers based on search term
  const filteredTeachers = (Array.isArray(teachers) ? teachers : []).filter(teacher =>
    `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects?.some(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase())) || false
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatSalary = (salary?: number) => {
    if (!salary) return 'N/A'
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(salary)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const statsCards = [
    {
      title: 'Total Profesores',
      value: (stats?.totalTeachers ?? 0).toString(),
      description: `${stats?.activeTeachers ?? 0} activos`,
      icon: Users,
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Materias Asignadas',
      value: (stats?.totalSubjects ?? 0).toString(),
      description: 'Materias totales',
      icon: BookOpen,
      trend: { value: 3, isPositive: true },
    },
    {
      title: 'Estudiantes Atendidos',
      value: (stats?.totalStudents ?? 0).toString(),
      description: 'Total de estudiantes',
      icon: GraduationCap,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Salario Promedio',
      value: formatSalary(stats?.averageSalary ?? 0),
      description: 'Promedio mensual',
      icon: DollarSign,
      trend: { value: 2, isPositive: true },
    },
  ]

  const actions = [
    {
      label: 'Nuevo Profesor',
      onClick: openCreateDialog,
      icon: UserPlus,
      variant: 'default' as const,
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
          title="Gestión de Profesores"
          description="Administra el personal docente del sistema educativo"
          icon={Users}
        />

        <StatsGrid stats={statsCards} />

        <Section>
          <ActionToolbar 
            actions={actions}
            selectedCount={selectedTeachers.length}
            bulkActions={bulkActions}
            onSearch={setSearchTerm}
            searchPlaceholder="Buscar profesores..."
          />

          {loading ? (
            <LoadingState message="Cargando profesores..." />
          ) : filteredTeachers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No hay profesores registrados"
              description="Comienza agregando el primer profesor al sistema"
              action={{
                label: 'Agregar Profesor',
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
                          checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                          onCheckedChange={toggleAllSelection}
                        />
                      </TableHead>
                      <TableHead>Profesor</TableHead>
                      <TableHead>ID Empleado</TableHead>
                      <TableHead>Materias</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Salario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Contrato</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedTeachers.includes(teacher.id)}
                            onCheckedChange={() => toggleTeacherSelection(teacher.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`/api/placeholder/40/40`} />
                              <AvatarFallback>
                                {getInitials(teacher.firstName, teacher.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <div className="font-medium">
                                {teacher.firstName} {teacher.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {teacher.employeeId}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects?.slice(0, 2).map((subject) => (
                              <Badge key={subject.id} variant="secondary" className="text-xs">
                                {subject.name}
                              </Badge>
                            )) || []}
                            {(teacher.subjects?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(teacher.subjects?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{teacher.totalStudents}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatSalary(teacher.salary)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={teacher.isActive ? 'default' : 'secondary'}>
                            {teacher.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(teacher.hireDate)}</span>
                          </div>
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
                              <DropdownMenuItem onClick={() => openEditDialog(teacher)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTeacher(teacher.id)}
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

        {/* Teacher Dialog */}
        <Dialog open={showTeacherDialog} onOpenChange={setShowTeacherDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingTeacher ? 'Editar Profesor' : 'Nuevo Profesor'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {editingTeacher 
                  ? 'Modifica los datos del profesor en el sistema' 
                  : 'Completa la información para agregar un nuevo profesor'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-6">
              {/* Sección de Información Básica */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Información Personal</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-sm font-medium">
                      ID Empleado <span className="text-gray-500">(Opcional)</span>
                    </Label>
                    <Input
                      id="employeeId"
                      value={teacherForm.employeeId}
                      onChange={(e) => setTeacherForm({
                        ...teacherForm,
                        employeeId: e.target.value
                      })}
                      placeholder="Se genera automáticamente si se deja vacío"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({
                        ...teacherForm,
                        email: e.target.value
                      })}
                      placeholder="profesor@ie3024.edu.pe"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      Nombre <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={teacherForm.firstName}
                      onChange={(e) => setTeacherForm({
                        ...teacherForm,
                        firstName: e.target.value
                      })}
                      placeholder="Carlos"
                      className="h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Apellidos <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={teacherForm.lastName}
                      onChange={(e) => setTeacherForm({
                        ...teacherForm,
                        lastName: e.target.value
                      })}
                      placeholder="Mendoza López"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                    <Input
                      id="phone"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({
                        ...teacherForm,
                        phone: e.target.value
                      })}
                      placeholder="+51 987 654 321"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Fecha de Nacimiento</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={teacherForm.dateOfBirth}
                      onChange={(e) => setTeacherForm({
                        ...teacherForm,
                        dateOfBirth: e.target.value
                      })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Dirección</Label>
                  <Textarea
                    id="address"
                    value={teacherForm.address}
                    onChange={(e) => setTeacherForm({
                      ...teacherForm,
                      address: e.target.value
                    })}
                    placeholder="Av. Los Alisos 245, San Juan de Lurigancho, Lima"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Sección de Información Laboral */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Building className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Información Laboral</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hireDate" className="text-sm font-medium">Fecha de Contrato</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={teacherForm.hireDate}
                      onChange={(e) => setTeacherForm({
                        ...teacherForm,
                        hireDate: e.target.value
                      })}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary" className="text-sm font-medium">Salario Mensual (S/)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={teacherForm.salary}
                      onChange={(e) => setTeacherForm({
                        ...teacherForm,
                        salary: e.target.value
                      })}
                      placeholder="3500"
                      min="0"
                      step="100"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Sección de Materias */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Materias a Asignar</h3>
                </div>
                
                <div className="space-y-2">
                  {subjects.length > 0 ? (
                    <MultiSubjectCombobox
                      subjects={subjects}
                      selectedIds={selectedSubjects}
                      onSelectionChange={setSelectedSubjects}
                      placeholder="Buscar y seleccionar materias..."
                      emptyMessage="No se encontraron materias."
                    />
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No hay materias disponibles</p>
                      <p className="text-gray-400 text-sm">Contacta al administrador del sistema</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTeacherDialog(false)
                  resetForm()
                }}
                className="flex-1 h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingTeacher ? handleUpdateTeacher : handleCreateTeacher}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                disabled={!teacherForm.firstName || !teacherForm.lastName || !teacherForm.email}
              >
                {editingTeacher ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Actualizar Profesor
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear Profesor
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  )
}