'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SubjectCombobox } from '@/components/subject-combobox'
import { UserCombobox } from '@/components/user-combobox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
// Select component not used here; left out to avoid unused-import lint warnings
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { 
  PageHeader,
  StatsGrid,
  ActionToolbar,
  EmptyState,
  LoadingState,
  Section
} from '@/components/ui/layout-components'
import { 
  Users, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  User,
  CheckCircle,
  School,
  TrendingUp
} from 'lucide-react'

interface AdminClassData {
  id: string
  name: string
  subject: {
    id: string
    name: string
    code: string
    credits: number
  }
  subjectId?: string
  teacher: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  teacherId?: string
  grade: string
  gradeId?: string
  section: string
  sectionId?: string
  schedules?: Array<{ dayOfWeek: string; startTime: string; endTime: string; room?: string | null }>
  schedulesDisplay?: string[]
  enrolledStudents?: number
  academicYear: string
  maxStudents: number
  currentStudents: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Subject {
  id: string
  name: string
  code: string
  credits: number
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  subjects?: Subject[] | unknown[]
  user?: { email?: string }
}

export default function AdminClassesPage() {
  const { status } = useSession()
  const [classes, setClasses] = useState<AdminClassData[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  interface GradeSection {
    id: string
    grade: { id: string; name: string }
    section: { id: string; name: string }
  }

  const [gradeSections, setGradeSections] = useState<GradeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<AdminClassData | null>(null)

  // Create dialog form state
  const [createName, setCreateName] = useState('')
  const [createGradeSectionLabel, setCreateGradeSectionLabel] = useState('')
  const [createSubjectId, setCreateSubjectId] = useState('')
  const [createTeacherId, setCreateTeacherId] = useState('')
  const [createMaxStudents, setCreateMaxStudents] = useState(30)
  const [createSchedules, setCreateSchedules] = useState<Array<{ dayOfWeek: string, startTime: string, endTime: string, room?: string }>>([])

  // Edit dialog form state
  const [editName, setEditName] = useState('')
  const [editGradeSectionLabel, setEditGradeSectionLabel] = useState('')
  const [editSubjectId, setEditSubjectId] = useState('')
  const [editTeacherId, setEditTeacherId] = useState('')
  const [editSchedules, setEditSchedules] = useState<Array<{ dayOfWeek: string; startTime: string; endTime: string; room: string | null }>>([])
  const [editMaxStudents, setEditMaxStudents] = useState<number | undefined>(undefined)

  // Función para recargar clases desde el API
  const fetchClasses = async () => {
    const classesRes = await fetch('/api/classes')
    const classesData = await classesRes.json()

    // classes endpoint may return { classes: [...], total }
    if (Array.isArray(classesData)) {
      const mapped = classesData.map((c: unknown) => {
        const clazz = c as AdminClassData
        clazz.currentStudents = (clazz.enrolledStudents ?? clazz.currentStudents ?? 0)
        return clazz
      })
      setClasses(mapped)
    } else if (classesData && typeof classesData === 'object') {
      const container = classesData as { classes?: unknown[] }
      if (Array.isArray(container.classes)) {
        const mapped = container.classes.map((c: unknown) => {
          const clazz = c as AdminClassData
          clazz.currentStudents = (clazz.enrolledStudents ?? clazz.currentStudents ?? 0)
          return clazz
        })
        setClasses(mapped)
      }
    }
  }

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [classesRes, subjectsRes, teachersRes, gradeSectionsRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/subjects'),
          fetch('/api/teachers'),
          fetch('/api/grade-sections'),
        ])

        const classesData = await classesRes.json()
  const subjectsData = await subjectsRes.json()
  const teachersData = await teachersRes.json()
        const gradeSectionsData = await gradeSectionsRes.json()

        // classes endpoint may return { classes: [...], total }
        if (Array.isArray(classesData)) {
          const mapped = classesData.map((c: unknown) => {
            const clazz = c as AdminClassData
            clazz.currentStudents = (clazz.enrolledStudents ?? clazz.currentStudents ?? 0)
            return clazz
          })
          setClasses(mapped)
        } else if (classesData && typeof classesData === 'object') {
          const container = classesData as { classes?: unknown[] }
          if (Array.isArray(container.classes)) {
            const mapped = container.classes.map((c: unknown) => {
              const clazz = c as AdminClassData
              clazz.currentStudents = (clazz.enrolledStudents ?? clazz.currentStudents ?? 0)
              return clazz
            })
            setClasses(mapped)
          }
        }

        if (Array.isArray(subjectsData)) {
          setSubjects(subjectsData)
        }
        // teachers endpoint may return { teachers, stats }
        let normalizedTeachers: Teacher[] = []
        if (Array.isArray(teachersData)) {
          // API returned an array directly
          normalizedTeachers = (teachersData as Array<Record<string, unknown>>).map(t => ({
            id: t.id as string,
            firstName: t.firstName as string,
            lastName: t.lastName as string,
            email: (t.user as Record<string, unknown>)?.email as string ?? t.email as string ?? '',
            subjects: Array.isArray(t.teacherSubjects) ? (t.teacherSubjects as Array<{subject: unknown}>).map((ts) => ts.subject).filter(Boolean) : (t.subjects as unknown[] ?? [])
          }))
        } else if (teachersData && Array.isArray((teachersData as Record<string, unknown>).teachers)) {
          normalizedTeachers = ((teachersData as Record<string, unknown>).teachers as Array<Record<string, unknown>>).map(t => ({
            id: t.id as string,
            firstName: t.firstName as string,
            lastName: t.lastName as string,
            email: (t.user as Record<string, unknown>)?.email as string ?? t.email as string ?? '',
            subjects: Array.isArray(t.teacherSubjects) ? (t.teacherSubjects as Array<{subject: unknown}>).map((ts) => ts.subject).filter(Boolean) : (t.subjects as unknown[] ?? [])
          }))
        }

        setTeachers(normalizedTeachers)
        if (Array.isArray(gradeSectionsData)) {
          setGradeSections(gradeSectionsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter classes
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGrade = !selectedGrade || classItem.grade === selectedGrade
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'active' && classItem.isActive) ||
                         (selectedStatus === 'inactive' && !classItem.isActive)
    
    return matchesSearch && matchesGrade && matchesStatus
  })

  // Stats calculations
  const stats = [
    {
      title: "Total Clases",
      value: classes.length.toString(),
      description: "Clases registradas",
      icon: School,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Clases Activas",
      value: classes.filter(c => c.isActive).length.toString(),
      description: "En funcionamiento",
      icon: CheckCircle,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Estudiantes Total",
      value: classes.reduce((acc, c) => acc + (c.currentStudents || 0), 0).toString(),
      description: "Estudiantes matriculados",
      icon: Users,
      trend: { value: 15, isPositive: true }
    },
    {
      title: "Promedio por Clase",
      value: classes.length > 0 ? Math.round(classes.reduce((acc, c) => acc + (c.currentStudents || 0), 0) / classes.length).toString() : "0",
      description: "Estudiantes por clase",
      icon: TrendingUp,
      trend: { value: 5, isPositive: true }
    }
  ]

  const handleCreateClass = async (newClassData: Partial<AdminClassData>) => {
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClassData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear la clase');
      }

      // Recargar los datos actualizados desde el servidor
      await fetchClasses();
      
      toast({
        title: 'Clase creada',
        description: 'La clase ha sido creada exitosamente.',
      });
    } catch (error) {
      console.error('Error al crear clase:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleEditClass = async (updatedClassData: Partial<AdminClassData>) => {
    try {
      const response = await fetch(`/api/classes/${updatedClassData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClassData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar la clase');
      }

      // Recargar los datos actualizados desde el servidor
      await fetchClasses();
      
      toast({
        title: 'Clase actualizada',
        description: 'La clase ha sido actualizada exitosamente.',
      });
    } catch (error) {
      console.error('Error al actualizar clase:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar la clase');
      }

      setClasses(prev => prev.filter(c => c.id !== classId));
      toast({
        title: 'Clase eliminada',
        description: 'La clase ha sido eliminada exitosamente.',
      });
    } catch (error) {
      console.error('Error al eliminar clase:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading' || loading) {
    return (
      <SidebarLayout>
        <LoadingState message="Cargando clases..." />
      </SidebarLayout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-96">
          <p>No tienes permisos para acceder a esta página.</p>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <PageHeader
          title="Gestión de Clases"
          description="Administra las clases, asigna profesores y gestiona la capacidad estudiantil"
          icon={School}
        />

        <StatsGrid stats={stats} />

        <Section>
          <ActionToolbar
            searchPlaceholder="Buscar clases, materias o profesores..."
            onSearch={setSearchTerm}
            filters={[
              {
                label: "Grado",
                value: selectedGrade,
                onChange: setSelectedGrade,
                options: [
                  { value: "", label: "Todos los grados" },
                  { value: "1er Grado", label: "1er Grado" },
                  { value: "2do Grado", label: "2do Grado" },
                  { value: "3er Grado", label: "3er Grado" },
                  { value: "4to Grado", label: "4to Grado" },
                  { value: "5to Grado", label: "5to Grado" },
                  { value: "6to Grado", label: "6to Grado" }
                ]
              },
              {
                label: "Estado",
                value: selectedStatus,
                onChange: setSelectedStatus,
                options: [
                  { value: "", label: "Todos los estados" },
                  { value: "active", label: "Activas" },
                  { value: "inactive", label: "Inactivas" }
                ]
              }
            ]}
            actions={[
              {
                label: "Nueva Clase",
                icon: Plus,
                onClick: () => setIsCreateDialogOpen(true),
                variant: "default"
              },
              {
                label: "Exportar",
                icon: Download,
                onClick: () => console.log('Export'),
                variant: "outline"
              }
            ]}
          />

          {filteredClasses.length === 0 ? (
            <EmptyState
              icon={School}
              title="No hay clases registradas"
              description="Comienza creando una nueva clase para el sistema"
              action={{
                label: "Crear Primera Clase",
                onClick: () => setIsCreateDialogOpen(true)
              }}
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clase</TableHead>
                    <TableHead>Materia</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Estudiantes</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{classItem.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {classItem.grade} - Sección {classItem.section}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{classItem.subject?.name || 'N/A'}</span>
                          <span className="text-sm text-muted-foreground">{classItem.subject?.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{classItem.teacher?.firstName} {classItem.teacher?.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {classItem.schedulesDisplay && classItem.schedulesDisplay.length > 0 ? classItem.schedulesDisplay.join(', ') : '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{classItem.currentStudents || 0}/{classItem.maxStudents}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={classItem.isActive ? "default" : "secondary"}>
                          {classItem.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedClass(classItem)
                              // prefill edit form
                              setEditName(classItem.name)
                              setEditMaxStudents(classItem.maxStudents)
                              setEditGradeSectionLabel(`${classItem.grade} - Sección ${classItem.section}`)
                              
                              // Usar subject.id y teacher.id en vez de subjectId/teacherId
                              setEditSubjectId(classItem.subject?.id || classItem.subjectId || '')
                              setEditTeacherId(classItem.teacher?.id || classItem.teacherId || '')
                              
                              // Convert schedules to edit format
                              const schedules = (classItem.schedules || []).map((s: { dayOfWeek: string | number; startTime: string; endTime: string; room?: string | null }) => {
                                // Mapear día de semana de string a número
                                const dayMap: Record<string, string> = {
                                  'MONDAY': '1',
                                  'TUESDAY': '2',
                                  'WEDNESDAY': '3',
                                  'THURSDAY': '4',
                                  'FRIDAY': '5',
                                  'SATURDAY': '6',
                                  'SUNDAY': '7'
                                }
                                
                                return {
                                  dayOfWeek: typeof s.dayOfWeek === 'string' ? (dayMap[s.dayOfWeek] || '1') : String(s.dayOfWeek),
                                  startTime: s.startTime || '',
                                  endTime: s.endTime || '',
                                  room: s.room || ''
                                }
                              })
                              setEditSchedules(schedules)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClass(classItem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Section>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Clase</DialogTitle>
            <DialogDescription>
              Completa la información para crear una nueva clase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="className">Nombre de la Clase</Label>
              <Input id="className" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Ej: Matemáticas 3° A" />
            </div>
            <div>
              <Label htmlFor="gradeSection">Grado - Sección</Label>
              <Input
                id="gradeSection"
                list="gradeSections"
                value={createGradeSectionLabel}
                onChange={(e) => setCreateGradeSectionLabel(e.target.value)}
                placeholder="Seleccione una combinación de Grado - Sección"
              />
              <datalist id="gradeSections">
                {gradeSections.map(gs => (
                  <option key={gs.id} value={`${gs.grade.name} - Sección ${gs.section.name}`} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="subject">Materia</Label>
              <SubjectCombobox
                subjects={subjects}
                value={createSubjectId}
                onValueChange={(val) => {
                  setCreateSubjectId(val)
                  // when subject changes, clear teacher selection so it can be filtered
                  setCreateTeacherId('')
                }}
              />
            </div>
            <div>
              <Label htmlFor="teacher">Profesor</Label>
              <UserCombobox
                users={teachers
                  .filter(t => !createSubjectId || t.subjects?.some((s: unknown) => (s as Subject).id === createSubjectId))
                  .map((t) => ({
                    id: t.id,
                    name: `${t.firstName ?? ''} ${t.lastName ?? ''}`.replace(/ +/g, ' ').trim(),
                    email: t.user?.email ?? t.email ?? '',
                    role: 'TEACHER'
                  }))}
                value={createTeacherId}
                onValueChange={(val) => setCreateTeacherId(val)}
                placeholder="Buscar profesor por nombre"
                emptyMessage="No se encontraron profesores para esta materia"
              />
            </div>
            <div className="space-y-2">
              <Label>Horarios</Label>
              {createSchedules.map((s, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <Label className="text-sm">Día</Label>
                    <select className="w-full rounded-md border p-2" value={s.dayOfWeek} onChange={(e) => {
                      const next = [...createSchedules]; next[idx].dayOfWeek = e.target.value; setCreateSchedules(next)
                    }}>
                      <option value="1">Lun</option>
                      <option value="2">Mar</option>
                      <option value="3">Mie</option>
                      <option value="4">Jue</option>
                      <option value="5">Vie</option>
                      <option value="6">Sab</option>
                      <option value="7">Dom</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm">Inicio</Label>
                    <Input type="time" value={s.startTime} onChange={(e) => { const next = [...createSchedules]; next[idx].startTime = e.target.value; setCreateSchedules(next) }} />
                  </div>
                  <div>
                    <Label className="text-sm">Fin</Label>
                    <Input type="time" value={s.endTime} onChange={(e) => { const next = [...createSchedules]; next[idx].endTime = e.target.value; setCreateSchedules(next) }} />
                  </div>
                  <div>
                    <Label className="text-sm">Aula</Label>
                    <Input value={s.room || ''} onChange={(e) => { const next = [...createSchedules]; next[idx].room = e.target.value; setCreateSchedules(next) }} placeholder="Opcional" />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setCreateSchedules(prev => [...prev, { dayOfWeek: '1', startTime: '08:00', endTime: '09:00', room: '' }])}>Agregar horario</Button>
                <Button variant="outline" onClick={() => setCreateSchedules([])}>Limpiar horarios</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="maxStudents">Capacidad Máxima</Label>
              <Input 
                id="maxStudents" 
                type="number" 
                value={createMaxStudents}
                onChange={(e) => setCreateMaxStudents(Number(e.target.value))}
                min={1}
                max={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={async () => {
              // find selected gradeSection
              const gs = gradeSections.find(g => `${g.grade.name} - Sección ${g.section.name}` === createGradeSectionLabel)
              if (!gs) {
                toast({ title: 'Error', description: 'Seleccione una combinación válida de grado y sección', variant: 'destructive' })
                return
              }
              // resolve subject and teacher ids from combobox selection
              const subj = subjects.find(s => s.id === createSubjectId)
              const teacherObj = teachers.find(t => t.id === createTeacherId)
              if (!createName || !subj || !teacherObj) {
                toast({ title: 'Error', description: 'Complete los campos requeridos (nombre, materia, profesor)', variant: 'destructive' })
                return
              }
              // prepare schedules payload
              const schedulesPayload = createSchedules.map(s => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                room: s.room || null
              }))

              await handleCreateClass({
                name: createName,
                subjectId: subj.id,
                teacherId: teacherObj.id,
                gradeId: gs.grade.id,
                sectionId: gs.section.id,
                maxStudents: createMaxStudents,
                schedules: schedulesPayload
              })
              setIsCreateDialogOpen(false)
              // reset simple form
              setCreateName('')
              setCreateGradeSectionLabel('')
              setCreateSubjectId('')
              setCreateTeacherId('')
              setCreateSchedules([])
              setCreateMaxStudents(30)
            }}>
              Crear Clase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Clase</DialogTitle>
            <DialogDescription>
              Modifica la información de la clase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editClassName">Nombre de la Clase</Label>
              <Input 
                id="editClassName" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ej: Matemáticas 3° A"
              />
            </div>
            <div>
              <Label htmlFor="editGradeSection">Grado - Sección</Label>
              <Input
                id="editGradeSection"
                list="gradeSectionsEdit"
                value={editGradeSectionLabel}
                onChange={(e) => setEditGradeSectionLabel(e.target.value)}
                placeholder="Seleccione una combinación de Grado - Sección"
              />
              <datalist id="gradeSectionsEdit">
                {gradeSections.map(gs => (
                  <option key={gs.id} value={`${gs.grade.name} - Sección ${gs.section.name}`} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="editSubject">Materia</Label>
              <SubjectCombobox
                subjects={subjects}
                value={editSubjectId}
                onValueChange={(val) => {
                  setEditSubjectId(val)
                  // cuando cambia la materia, limpiar la selección del profesor
                  setEditTeacherId('')
                }}
              />
            </div>
            <div>
              <Label htmlFor="editTeacher">Profesor</Label>
              <UserCombobox
                users={teachers
                  .filter(t => !editSubjectId || t.subjects?.some((s: unknown) => (s as Subject).id === editSubjectId))
                  .map((t) => ({
                    id: t.id,
                    name: `${t.firstName ?? ''} ${t.lastName ?? ''}`.replace(/ +/g, ' ').trim(),
                    email: t.user?.email ?? t.email ?? '',
                    role: 'TEACHER'
                  }))}
                value={editTeacherId}
                onValueChange={(val) => setEditTeacherId(val)}
                placeholder="Buscar profesor por nombre"
                emptyMessage="No se encontraron profesores para esta materia"
              />
            </div>
            <div className="space-y-2">
              <Label>Horarios</Label>
              {editSchedules.map((s, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 items-end">
                  <div>
                    <Label className="text-sm">Día</Label>
                    <select 
                      className="w-full rounded-md border p-2 text-sm" 
                      value={s.dayOfWeek} 
                      onChange={(e) => {
                        const next = [...editSchedules]
                        next[idx].dayOfWeek = e.target.value
                        setEditSchedules(next)
                      }}
                    >
                      <option value="1">Lun</option>
                      <option value="2">Mar</option>
                      <option value="3">Mie</option>
                      <option value="4">Jue</option>
                      <option value="5">Vie</option>
                      <option value="6">Sab</option>
                      <option value="7">Dom</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm">Inicio</Label>
                    <Input 
                      type="time" 
                      value={s.startTime} 
                      onChange={(e) => { 
                        const next = [...editSchedules]
                        next[idx].startTime = e.target.value
                        setEditSchedules(next)
                      }} 
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Fin</Label>
                    <Input 
                      type="time" 
                      value={s.endTime} 
                      onChange={(e) => { 
                        const next = [...editSchedules]
                        next[idx].endTime = e.target.value
                        setEditSchedules(next)
                      }} 
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Aula</Label>
                    <Input 
                      value={s.room || ''} 
                      onChange={(e) => { 
                        const next = [...editSchedules]
                        next[idx].room = e.target.value
                        setEditSchedules(next)
                      }} 
                      placeholder="Opcional" 
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const next = editSchedules.filter((_, i) => i !== idx)
                      setEditSchedules(next)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setEditSchedules(prev => [...prev, { 
                    dayOfWeek: '1', 
                    startTime: '08:00', 
                    endTime: '09:00', 
                    room: '' 
                  }])}
                >
                  + Agregar horario
                </Button>
                {editSchedules.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditSchedules([])}
                  >
                    Limpiar todos
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="editMaxStudents">Capacidad Máxima</Label>
              <Input
                id="editMaxStudents"
                type="number"
                value={editMaxStudents}
                onChange={(e) => setEditMaxStudents(Number(e.target.value))}
                min={1}
                max={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={async () => {
              if (!selectedClass) return
              
              const gs = gradeSections.find(g => `${g.grade.name} - Sección ${g.section.name}` === editGradeSectionLabel)
              if (!gs) {
                toast({ title: 'Error', description: 'Seleccione una combinación válida de grado y sección', variant: 'destructive' })
                return
              }

              const subj = subjects.find(s => s.id === editSubjectId)
              const teacherObj = teachers.find(t => t.id === editTeacherId)
              
              if (!editName || !subj || !teacherObj) {
                toast({ title: 'Error', description: 'Complete los campos requeridos (nombre, materia, profesor)', variant: 'destructive' })
                return
              }

              // Preparar horarios
              const schedulesPayload = editSchedules.map(s => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                room: s.room || null
              }))

              await handleEditClass({
                id: selectedClass.id,
                name: editName,
                subjectId: subj.id,
                teacherId: teacherObj.id,
                gradeId: gs.grade.id,
                sectionId: gs.section.id,
                maxStudents: editMaxStudents,
                schedules: schedulesPayload
              })
              setIsEditDialogOpen(false)
            }}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  )
}
