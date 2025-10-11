"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MessageSquare,
  User,
  Calendar,
  Mail,
  MailOpen,
  Reply,
  Star,
  Archive,
} from "lucide-react"

export default function StudentMessages() {
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

  if (!session || session.user.role !== "STUDENT") {
    redirect("/auth/signin")
  }

  // Mensajes de ejemplo
  const messages = [
    {
      id: 1,
      from: "Prof. María García",
      fromEmail: "maria.garcia@school.com",
      subject: "Felicitaciones por tu examen de matemáticas",
      content: "Hola Pedro, quería felicitarte por tu excelente desempeño en el último examen de matemáticas. Has mostrado una gran mejoría y tu dedicación se nota. ¡Sigue así!",
      date: new Date("2024-10-07T09:30:00"),
      isRead: false,
      type: "CONGRATULATIONS",
      priority: "normal",
      isStarred: true
    },
    {
      id: 2,
      from: "Prof. Ana Rodríguez", 
      fromEmail: "ana.rodriguez@school.com",
      subject: "Recordatorio: Proyecto de Ciencias",
      content: "Buenos días Pedro, te recuerdo que el proyecto sobre el sistema solar debe ser entregado el viernes 11 de octubre. Si tienes alguna duda, puedes consultarme durante el recreo.",
      date: new Date("2024-10-06T14:15:00"),
      isRead: true,
      type: "REMINDER",
      priority: "high",
      isStarred: false
    },
    {
      id: 3,
      from: "Prof. Carlos López",
      fromEmail: "carlos.lopez@school.com",
      subject: "Excelente ensayo sobre 'El Principito'",
      content: "Pedro, tu ensayo sobre El Principito fue muy bien estructurado y mostró una comprensión profunda de la obra. Te califiqué con A. ¡Muy buen trabajo!",
      date: new Date("2024-10-05T16:45:00"),
      isRead: true,
      type: "GRADE_FEEDBACK",
      priority: "normal",
      isStarred: false
    },
    {
      id: 4,
      from: "Coordinación Académica",
      fromEmail: "coordinacion@school.com",
      subject: "Invitación a Olimpiadas de Matemáticas",
      content: "Estimado estudiante, por tu excelente rendimiento en matemáticas, te invitamos a participar en las Olimpiadas de Matemáticas que se realizarán el próximo mes. Por favor confirma tu participación.",
      date: new Date("2024-10-04T11:20:00"),
      isRead: false,
      type: "INVITATION",
      priority: "high",
      isStarred: true
    },
    {
      id: 5,
      from: "Prof. Carmen Silva",
      fromEmail: "carmen.silva@school.com",
      subject: "Materiales para clase de Arte",
      content: "Hola Pedro, para la próxima clase de arte necesitarás: acuarelas, pinceles del #2 y #6, y papel especial para acuarela. Puedes conseguirlos en la librería del colegio.",
      date: new Date("2024-10-03T13:10:00"),
      isRead: true,
      type: "MATERIALS",
      priority: "normal",
      isStarred: false
    },
    {
      id: 6,
      from: "Biblioteca Escolar",
      fromEmail: "biblioteca@school.com",
      subject: "Recordatorio: Devolución de libros",
      content: "Tienes libros pendientes de devolución en la biblioteca. Por favor devuelve 'Aventuras en el Espacio' antes del 10 de octubre para evitar multas.",
      date: new Date("2024-10-02T08:30:00"),
      isRead: true,
      type: "LIBRARY",
      priority: "normal",
      isStarred: false
    }
  ]

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "CONGRATULATIONS":
        return <Star className="h-4 w-4 text-yellow-500" />
      case "REMINDER":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "GRADE_FEEDBACK":
        return <Badge className="h-4 w-4 text-green-500" />
      case "INVITATION":
        return <Mail className="h-4 w-4 text-purple-500" />
      case "MATERIALS":
        return <Archive className="h-4 w-4 text-orange-500" />
      case "LIBRARY":
        return <MessageSquare className="h-4 w-4 text-gray-500" />
      default:
        return <Mail className="h-4 w-4 text-gray-500" />
    }
  }

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case "CONGRATULATIONS":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Felicitación</Badge>
      case "REMINDER":
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Recordatorio</Badge>
      case "GRADE_FEEDBACK":
        return <Badge variant="default" className="bg-green-100 text-green-800">Calificación</Badge>
      case "INVITATION":
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Invitación</Badge>
      case "MATERIALS":
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Materiales</Badge>
      case "LIBRARY":
        return <Badge variant="secondary">Biblioteca</Badge>
      default:
        return <Badge variant="outline">General</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>
      case "normal":
        return <Badge variant="outline">Normal</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const unreadCount = messages.filter(msg => !msg.isRead).length
  const starredCount = messages.filter(msg => msg.isStarred).length

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mis Mensajes</h1>
          <p className="text-blue-100">
            Comunicaciones de tus profesores y el colegio
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Mensajes</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sin Leer</CardTitle>
              <Mail className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">Nuevos mensajes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Destacados</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{starredCount}</div>
              <p className="text-xs text-muted-foreground">Importantes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">De Profesores</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {messages.filter(msg => msg.from.includes("Prof.")).length}
              </div>
              <p className="text-xs text-muted-foreground">Mensajes académicos</p>
            </CardContent>
          </Card>
        </div>

        {/* Mensajes No Leídos */}
        {unreadCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Mensajes Sin Leer</span>
              </CardTitle>
              <CardDescription>Mensajes nuevos que requieren tu atención</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages
                  .filter(msg => !msg.isRead)
                  .map((message) => (
                    <div key={message.id} className="flex items-start space-x-4 p-4 border rounded-lg bg-blue-50">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {message.from.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{message.from}</h4>
                          <div className="flex items-center space-x-2">
                            {getMessageTypeIcon(message.type)}
                            {message.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          </div>
                        </div>
                        <h5 className="font-medium text-sm mb-1">{message.subject}</h5>
                        <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            {getMessageTypeBadge(message.type)}
                            {getPriorityBadge(message.priority)}
                          </div>
                          <span className="text-xs text-gray-500">
                            {message.date.toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Todos los Mensajes */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Mensajes</CardTitle>
            <CardDescription>Historial completo de comunicaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Asunto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id} className={!message.isRead ? "bg-blue-50" : ""}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {!message.isRead ? (
                          <Mail className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-gray-400" />
                        )}
                        {message.isStarred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {message.from.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{message.from}</p>
                          <p className="text-xs text-gray-500">{message.fromEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className={`font-medium ${!message.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">{message.content}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getMessageTypeBadge(message.type)}</TableCell>
                    <TableCell>{getPriorityBadge(message.priority)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {message.date.toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit'
                        })}
                        <br />
                        <span className="text-xs text-gray-500">
                          {message.date.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Reply className="h-3 w-3 mr-1" />
                          Responder
                        </Button>
                        <Button size="sm" variant="ghost">
                          Ver
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}