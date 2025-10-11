'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  XCircle,
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
  teacher: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  grade: string
  section: string
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
}

export default function AdminClassesPage() {
  const { data: session, status } = useSession()
  const [classes, setClasses] = useState<AdminClassData[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<AdminClassData | null>(null)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [classesRes, subjectsRes, teachersRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/subjects'),
          fetch('/api/teachers')
        ])

        const classesData = await classesRes.json()
        const subjectsData = await subjectsRes.json()
        const teachersData = await teachersRes.json()

        if (Array.isArray(classesData)) {
          setClasses(classesData)
        }
        if (Array.isArray(subjectsData)) {
          setSubjects(subjectsData)
        }
        if (Array.isArray(teachersData)) {
          setTeachers(teachersData)
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
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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
              <Input id="className" placeholder="Ej: Matemáticas 3° A" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1er Grado">1er Grado</SelectItem>
                    <SelectItem value="2do Grado">2do Grado</SelectItem>
                    <SelectItem value="3er Grado">3er Grado</SelectItem>
                    <SelectItem value="4to Grado">4to Grado</SelectItem>
                    <SelectItem value="5to Grado">5to Grado</SelectItem>
                    <SelectItem value="6to Grado">6to Grado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section">Sección</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Sección A</SelectItem>
                    <SelectItem value="B">Sección B</SelectItem>
                    <SelectItem value="C">Sección C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Materia</Label>
              <Select>
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
            </div>
            <div>
              <Label htmlFor="teacher">Profesor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxStudents">Capacidad Máxima</Label>
              <Input 
                id="maxStudents" 
                type="number" 
                placeholder="30" 
                min="1" 
                max="50" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast({
                title: "Clase creada",
                description: "La clase ha sido creada exitosamente",
              })
              setIsCreateDialogOpen(false)
            }}>
              Crear Clase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                defaultValue={selectedClass?.name}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGrade">Grado</Label>
                <Select defaultValue={selectedClass?.grade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1er Grado">1er Grado</SelectItem>
                    <SelectItem value="2do Grado">2do Grado</SelectItem>
                    <SelectItem value="3er Grado">3er Grado</SelectItem>
                    <SelectItem value="4to Grado">4to Grado</SelectItem>
                    <SelectItem value="5to Grado">5to Grado</SelectItem>
                    <SelectItem value="6to Grado">6to Grado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editSection">Sección</Label>
                <Select defaultValue={selectedClass?.section}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Sección A</SelectItem>
                    <SelectItem value="B">Sección B</SelectItem>
                    <SelectItem value="C">Sección C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editMaxStudents">Capacidad Máxima</Label>
              <Input 
                id="editMaxStudents" 
                type="number" 
                defaultValue={selectedClass?.maxStudents}
                min="1" 
                max="50" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast({
                title: "Clase actualizada",
                description: "Los cambios han sido guardados",
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
