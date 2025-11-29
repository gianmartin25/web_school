"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  User,
  Shield,
  Bell,
  Eye,
  Lock,
  Save,
  Camera,
} from "lucide-react"
import { ValidatedDateInput } from "@/components/ui/validated-date-input"
import { dateValidationPresets } from "@/lib/date-validations"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "PARENT":
        return "Padre/Madre"
      case "TEACHER":
        return "Profesor/a"
      case "ADMIN":
        return "Administrador"
      case "STUDENT":
        return "Estudiante"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "PARENT":
        return "bg-green-100 text-green-800"
      case "TEACHER":
        return "bg-blue-100 text-blue-800"
      case "ADMIN":
        return "bg-purple-100 text-purple-800"
      case "STUDENT":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mi Perfil</h1>
          <p className="text-blue-100">
            Gestiona tu información personal y configuraciones de cuenta
          </p>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback className="text-2xl">
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{session.user.name}</h2>
                <p className="text-gray-600">{session.user.email}</p>
                <Badge className={`mt-2 ${getRoleColor(session.user.role)}`}>
                  {getRoleLabel(session.user.role)}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Eye className="h-4 w-4 mr-2" />
              Privacidad
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Actualiza tu información personal y detalles de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input 
                      id="firstName" 
                      defaultValue={session.user.name?.split(' ')[0] || ""} 
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={session.user.name?.split(' ').slice(1).join(' ') || ""} 
                      placeholder="Tu apellido"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={session.user.email || ""} 
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input 
                      id="address" 
                      placeholder="Tu dirección completa"
                    />
                  </div>
                  <ValidatedDateInput
                    id="dateOfBirth"
                    label="Fecha de Nacimiento"
                    value=""
                    onChange={(value) => {
                      // Add onChange logic here
                    }}
                    validationOptions={
                      session.user.role === "STUDENT" 
                        ? dateValidationPresets.studentBirthDate 
                        : dateValidationPresets.teacherBirthDate
                    }
                  />
                  {session.user.role === "PARENT" && (
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Ocupación</Label>
                      <Input 
                        id="occupation" 
                        placeholder="Tu ocupación"
                      />
                    </div>
                  )}
                </div>

                {session.user.role === "TEACHER" && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Información Profesional</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="employeeId">ID de Empleado</Label>
                          <Input 
                            id="employeeId" 
                            placeholder="T001"
                            disabled
                          />
                        </div>
                        <ValidatedDateInput
                          id="hireDate"
                          label="Fecha de Contratación"
                          value=""
                          onChange={(value) => {
                            // Add onChange logic here
                          }}
                          validationOptions={dateValidationPresets.hireDate}
                          disabled
                        />
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="specializations">Especializaciones</Label>
                          <Textarea 
                            id="specializations" 
                            placeholder="Describe tus áreas de especialización..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {session.user.role === "STUDENT" && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Información Académica</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="studentId">ID de Estudiante</Label>
                          <Input 
                            id="studentId" 
                            placeholder="S2024001"
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grade">Grado</Label>
                          <Input 
                            id="grade" 
                            placeholder="5to"
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="section">Sección</Label>
                          <Input 
                            id="section" 
                            placeholder="A"
                            disabled
                          />
                        </div>
                        <ValidatedDateInput
                          id="enrollmentDate"
                          label="Fecha de Matrícula"
                          value=""
                          onChange={(value) => {
                            // Add onChange logic here
                          }}
                          validationOptions={dateValidationPresets.enrollmentDate}
                          disabled
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Mantén tu cuenta segura con una contraseña fuerte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    placeholder="Tu contraseña actual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="Tu nueva contraseña"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirma tu nueva contraseña"
                  />
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Lock className="h-4 w-4 mr-2" />
                    Actualizar Contraseña
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sesiones Activas</CardTitle>
                <CardDescription>
                  Gestiona donde has iniciado sesión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Navegador Actual</h4>
                      <p className="text-sm text-gray-600">Windows 11 - Chrome</p>
                      <p className="text-xs text-gray-500">Última actividad: Ahora</p>
                    </div>
                    <Badge variant="outline">Actual</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Aplicación Móvil</h4>
                      <p className="text-sm text-gray-600">iPhone 14 - iOS</p>
                      <p className="text-xs text-gray-500">Última actividad: Hace 2 horas</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
                <CardDescription>
                  Controla qué notificaciones quieres recibir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificaciones por Email</h4>
                      <p className="text-sm text-gray-600">Recibe actualizaciones importantes por correo</p>
                    </div>
                    <Select defaultValue="important">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="important">Importantes</SelectItem>
                        <SelectItem value="none">Ninguna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificaciones Push</h4>
                      <p className="text-sm text-gray-600">Recibe notificaciones instantáneas</p>
                    </div>
                    <Select defaultValue="enabled">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Activadas</SelectItem>
                        <SelectItem value="disabled">Desactivadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {session.user.role === "PARENT" && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Notificaciones de Hijos</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Nuevas calificaciones</span>
                          <Select defaultValue="immediate">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediata</SelectItem>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Reportes de asistencia</span>
                          <Select defaultValue="immediate">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediata</SelectItem>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mensajes de profesores</span>
                          <Select defaultValue="immediate">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediata</SelectItem>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {session.user.role === "TEACHER" && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Notificaciones Académicas</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Nuevos mensajes de padres</span>
                          <Select defaultValue="immediate">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediata</SelectItem>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Recordatorios de calificaciones</span>
                          <Select defaultValue="weekly">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {session.user.role === "STUDENT" && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Notificaciones Estudiantiles</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Nuevas calificaciones</span>
                          <Select defaultValue="immediate">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediata</SelectItem>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Recordatorios de tareas</span>
                          <Select defaultValue="daily">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediata</SelectItem>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mensajes de profesores</span>
                          <Select defaultValue="immediate">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Inmediata</SelectItem>
                              <SelectItem value="daily">Diaria</SelectItem>
                              <SelectItem value="never">Nunca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Preferencias
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Privacidad</CardTitle>
                <CardDescription>
                  Controla quién puede ver tu información
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Perfil Público</h4>
                      <p className="text-sm text-gray-600">Permitir que otros usuarios vean tu perfil</p>
                    </div>
                    <Select defaultValue="school">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Público</SelectItem>
                        <SelectItem value="school">Solo escuela</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Contacto por Email</h4>
                      <p className="text-sm text-gray-600">Permitir que otros te contacten por email</p>
                    </div>
                    <Select defaultValue="enabled">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Activado</SelectItem>
                        <SelectItem value="disabled">Desactivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Información de Actividad</h4>
                      <p className="text-sm text-gray-600">Mostrar cuándo estuviste activo por última vez</p>
                    </div>
                    <Select defaultValue="contacts">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Todos</SelectItem>
                        <SelectItem value="contacts">Contactos</SelectItem>
                        <SelectItem value="nobody">Nadie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
                <CardDescription>
                  Acciones irreversibles para tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-800">Eliminar Cuenta</h4>
                    <p className="text-sm text-red-600">Esta acción no se puede deshacer</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Eliminar Cuenta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  )
}