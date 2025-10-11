'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { SidebarLayout } from '@/components/sidebar-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { 
  MessageSquare,
  Send,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  UserCheck,
  Search,
  FileText,
  Target
} from 'lucide-react'

interface Message {
  id: string
  title: string
  content: string
  type: 'announcement' | 'notification' | 'urgent' | 'general'
  recipients: 'all' | 'parents' | 'teachers' | 'students' | 'custom'
  recipientsList?: string[]
  sentBy: string
  sentAt: string
  status: 'draft' | 'sent' | 'scheduled'
  scheduledFor?: string
  readCount: number
  totalRecipients: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  attachments?: string[]
}

interface Recipient {
  id: string
  name: string
  email: string
  role: 'parent' | 'teacher' | 'student'
  class?: string
  selected: boolean
}

interface CommunicationTemplate {
  id: string
  name: string
  content: string
  type: 'announcement' | 'notification' | 'urgent' | 'general'
  category: string
  isActive: boolean
}

export default function AdminCommunicationsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('messages')
  const [loading, setLoading] = useState(true)
  
  // Estados para mensajes
  const [messages, setMessages] = useState<Message[]>([])
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null)
  
  // Estados para destinatarios
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  
  // Estados para plantillas
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([])
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  
  // Estados para formularios
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    type: 'general' as 'announcement' | 'notification' | 'urgent' | 'general',
    recipients: 'all' as 'all' | 'parents' | 'teachers' | 'students' | 'custom',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    scheduledFor: '',
    isScheduled: false
  })
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: '',
    type: 'general' as 'announcement' | 'notification' | 'urgent' | 'general',
    category: ''
  })
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Cargar datos reales desde la API
  useEffect(() => {
    const fetchCommunicationsData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/communications')
        
        if (!response.ok) {
          throw new Error('Error al cargar datos de comunicaciones')
        }

        const data = await response.json()
        
        setMessages(data.messages || [])
        setRecipients(data.recipients || [])
        setTemplates(data.templates || [])
        
      } catch (error) {
        console.error('Error fetching communications:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las comunicaciones",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCommunicationsData()
  }, [])

  // Funciones para mensajes
  const handleCreateMessage = () => {
    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      title: messageForm.title,
      content: messageForm.content,
      type: messageForm.type,
      recipients: messageForm.recipients,
      recipientsList: messageForm.recipients === 'custom' ? selectedRecipients : undefined,
      sentBy: session?.user?.name || 'Administrador',
      sentAt: messageForm.isScheduled ? '' : new Date().toISOString(),
      status: messageForm.isScheduled ? 'scheduled' : 'sent',
      scheduledFor: messageForm.isScheduled ? messageForm.scheduledFor : undefined,
      readCount: 0,
      totalRecipients: getRecipientCount(),
      priority: messageForm.priority
    }

    setMessages([newMessage, ...messages])
    resetMessageForm()
    
    toast({
      title: "Éxito",
      description: messageForm.isScheduled 
        ? "Mensaje programado exitosamente" 
        : "Mensaje enviado exitosamente"
    })
  }

  const handleDeleteMessage = (messageId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      setMessages(messages.filter(m => m.id !== messageId))
      toast({
        title: "Éxito",
        description: "Mensaje eliminado exitosamente"
      })
    }
  }

  const handleEditMessage = () => {
    toast({
      title: "Información",
      description: "Funcionalidad de edición disponible para mensajes no enviados"
    })
  }

  const resetMessageForm = () => {
    setMessageForm({
      title: '',
      content: '',
      type: 'general',
      recipients: 'all',
      priority: 'medium',
      scheduledFor: '',
      isScheduled: false
    })
    setSelectedRecipients([])
  }

  const getRecipientCount = () => {
    switch (messageForm.recipients) {
      case 'all': return 325
      case 'parents': return 180
      case 'teachers': return 18
      case 'students': return 325
      case 'custom': return selectedRecipients.length
      default: return 0
    }
  }

  // Funciones para plantillas
  const handleCreateTemplate = () => {
    const newTemplate: CommunicationTemplate = {
      id: (templates.length + 1).toString(),
      name: templateForm.name,
      content: templateForm.content,
      type: templateForm.type,
      category: templateForm.category,
      isActive: true
    }

    setTemplates([...templates, newTemplate])
    setShowTemplateDialog(false)
    resetTemplateForm()
    
    toast({
      title: "Éxito",
      description: "Plantilla creada exitosamente"
    })
  }

  const handleUseTemplate = (template: CommunicationTemplate) => {
    setMessageForm({
      ...messageForm,
      title: template.name,
      content: template.content,
      type: template.type
    })
    setActiveTab('compose')
  }

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      content: '',
      type: 'general',
      category: ''
    })
  }

  // Filtrar mensajes
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter
    const matchesType = typeFilter === 'all' || message.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Función para obtener color según tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'announcement': return 'bg-blue-100 text-blue-800'
      case 'notification': return 'bg-yellow-100 text-yellow-800'
      case 'general': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Función para obtener color según prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
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
            <p className="mt-4 text-gray-600">Cargando sistema de comunicaciones...</p>
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
              Sistema de Comunicaciones
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona comunicados, notificaciones y mensajería institucional
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensajes
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Crear Mensaje
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="recipients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Destinatarios
            </TabsTrigger>
          </TabsList>

          {/* Lista de Mensajes */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Mensajes Enviados</h2>
                <p className="text-gray-600">Historial de comunicaciones enviadas</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar mensajes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sent">Enviados</SelectItem>
                    <SelectItem value="scheduled">Programados</SelectItem>
                    <SelectItem value="draft">Borradores</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="announcement">Anuncio</SelectItem>
                    <SelectItem value="notification">Notificación</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card key={message.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{message.title}</CardTitle>
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(message.priority)}`}></div>
                          <Badge className={getTypeColor(message.type)}>
                            {message.type === 'urgent' ? 'Urgente' :
                             message.type === 'announcement' ? 'Anuncio' :
                             message.type === 'notification' ? 'Notificación' : 'General'}
                          </Badge>
                          <Badge variant={message.status === 'sent' ? 'default' : 'secondary'}>
                            {message.status === 'sent' ? 'Enviado' :
                             message.status === 'scheduled' ? 'Programado' : 'Borrador'}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {message.content}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {message.status === 'scheduled' && message.scheduledFor
                              ? `Programado para: ${new Date(message.scheduledFor).toLocaleString()}`
                              : message.sentAt ? `Enviado: ${new Date(message.sentAt).toLocaleString()}` : 'Borrador'
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {message.recipients === 'all' ? 'Todos' :
                             message.recipients === 'parents' ? 'Padres' :
                             message.recipients === 'teachers' ? 'Profesores' :
                             message.recipients === 'students' ? 'Estudiantes' : 'Personalizado'}
                          </span>
                          {message.status === 'sent' && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Leído: {message.readCount}/{message.totalRecipients}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {message.status !== 'sent' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditMessage}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {filteredMessages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron mensajes</h3>
                <p className="text-gray-600">
                  No hay mensajes que coincidan con tu búsqueda.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Crear Mensaje */}
          <TabsContent value="compose" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Crear Nuevo Mensaje
                  </CardTitle>
                  <CardDescription>
                    Compone y envía comunicados a la comunidad educativa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="messageTitle">Título del Mensaje *</Label>
                      <Input
                        id="messageTitle"
                        value={messageForm.title}
                        onChange={(e) => setMessageForm({...messageForm, title: e.target.value})}
                        placeholder="Ej: Reunión de Padres de Familia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="messageType">Tipo de Mensaje *</Label>
                      <Select 
                        value={messageForm.type} 
                        onValueChange={(value: 'announcement' | 'notification' | 'urgent' | 'general') => 
                          setMessageForm({...messageForm, type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="announcement">Anuncio</SelectItem>
                          <SelectItem value="notification">Notificación</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="messageRecipients">Destinatarios *</Label>
                      <Select 
                        value={messageForm.recipients} 
                        onValueChange={(value: 'all' | 'parents' | 'teachers' | 'students' | 'custom') => 
                          setMessageForm({...messageForm, recipients: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar destinatarios" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toda la comunidad</SelectItem>
                          <SelectItem value="parents">Solo padres</SelectItem>
                          <SelectItem value="teachers">Solo profesores</SelectItem>
                          <SelectItem value="students">Solo estudiantes</SelectItem>
                          <SelectItem value="custom">Selección personalizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="messagePriority">Prioridad</Label>
                      <Select 
                        value={messageForm.priority} 
                        onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                          setMessageForm({...messageForm, priority: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="messageContent">Contenido del Mensaje *</Label>
                    <Textarea
                      id="messageContent"
                      value={messageForm.content}
                      onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                      placeholder="Escribe aquí el contenido de tu mensaje..."
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isScheduled"
                      checked={messageForm.isScheduled}
                      onCheckedChange={(checked: boolean) => setMessageForm({...messageForm, isScheduled: checked})}
                    />
                    <Label htmlFor="isScheduled">Programar envío</Label>
                  </div>

                  {messageForm.isScheduled && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduledFor">Fecha y Hora de Envío</Label>
                      <Input
                        id="scheduledFor"
                        type="datetime-local"
                        value={messageForm.scheduledFor}
                        onChange={(e) => setMessageForm({...messageForm, scheduledFor: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex items-center justify-between text-sm">
                      <span>Destinatarios estimados:</span>
                      <span className="font-medium">{getRecipientCount()} personas</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={resetMessageForm}>
                      Limpiar
                    </Button>
                    <Button onClick={handleCreateMessage}>
                      <Send className="h-4 w-4 mr-2" />
                      {messageForm.isScheduled ? 'Programar Envío' : 'Enviar Mensaje'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plantillas */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Plantillas de Mensajes</h2>
                <p className="text-gray-600">Plantillas predefinidas para comunicaciones frecuentes</p>
              </div>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Plantilla
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Plantilla</DialogTitle>
                    <DialogDescription>
                      Crea una plantilla reutilizable para comunicaciones frecuentes
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateName">Nombre de la Plantilla *</Label>
                        <Input
                          id="templateName"
                          value={templateForm.name}
                          onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                          placeholder="Ej: Convocatoria Reunión"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="templateCategory">Categoría</Label>
                        <Input
                          id="templateCategory"
                          value={templateForm.category}
                          onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                          placeholder="Ej: Reuniones"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="templateType">Tipo de Mensaje</Label>
                      <Select 
                        value={templateForm.type} 
                        onValueChange={(value: 'announcement' | 'notification' | 'urgent' | 'general') => 
                          setTemplateForm({...templateForm, type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="announcement">Anuncio</SelectItem>
                          <SelectItem value="notification">Notificación</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="templateContent">Contenido de la Plantilla *</Label>
                      <Textarea
                        id="templateContent"
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                        placeholder="Usa [VARIABLES] para campos que se completarán después..."
                        rows={6}
                      />
                      <p className="text-xs text-gray-500">
                        Tip: Usa variables como [FECHA], [HORA], [LUGAR] para personalizar después
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setShowTemplateDialog(false)
                      resetTemplateForm()
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateTemplate}>
                      Crear Plantilla
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getTypeColor(template.type)}>
                        {template.type === 'urgent' ? 'Urgente' :
                         template.type === 'announcement' ? 'Anuncio' :
                         template.type === 'notification' ? 'Notificación' : 'General'}
                      </Badge>
                    </div>
                    <CardDescription>{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {template.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Usar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTemplateForm({
                              name: template.name,
                              content: template.content,
                              type: template.type,
                              category: template.category
                            })
                            setShowTemplateDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay plantillas</h3>
                <p className="text-gray-600">
                  Crea la primera plantilla para agilizar tus comunicaciones.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Destinatarios */}
          <TabsContent value="recipients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Gestión de Destinatarios</h2>
                <p className="text-gray-600">Administra las listas de contactos para comunicaciones</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Importar Contactos
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Padres de Familia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">180</div>
                  <p className="text-sm text-gray-600">Contactos activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    Profesores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-sm text-gray-600">Docentes activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Estudiantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">325</div>
                  <p className="text-sm text-gray-600">Estudiantes matriculados</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Contactos</CardTitle>
                <CardDescription>
                  Administra los contactos de tu comunidad educativa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={recipient.selected}
                          onCheckedChange={(checked: boolean) => {
                            const updated = recipients.map(r => 
                              r.id === recipient.id 
                                ? { ...r, selected: checked }
                                : r
                            )
                            setRecipients(updated)
                          }}
                        />
                        <div>
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-gray-600">{recipient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {recipient.role === 'parent' ? 'Padre' :
                           recipient.role === 'teacher' ? 'Profesor' : 'Estudiante'}
                        </Badge>
                        {recipient.class && (
                          <Badge variant="secondary">{recipient.class}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para ver mensaje completo */}
        <Dialog open={!!viewingMessage} onOpenChange={() => setViewingMessage(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {viewingMessage?.title}
              </DialogTitle>
              <DialogDescription>
                Enviado por {viewingMessage?.sentBy} - {viewingMessage?.sentAt ? new Date(viewingMessage.sentAt).toLocaleString() : 'Borrador'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(viewingMessage?.type || 'general')}>
                  {viewingMessage?.type === 'urgent' ? 'Urgente' :
                   viewingMessage?.type === 'announcement' ? 'Anuncio' :
                   viewingMessage?.type === 'notification' ? 'Notificación' : 'General'}
                </Badge>
                <Badge variant="outline">
                  {viewingMessage?.recipients === 'all' ? 'Todos' :
                   viewingMessage?.recipients === 'parents' ? 'Padres' :
                   viewingMessage?.recipients === 'teachers' ? 'Profesores' :
                   viewingMessage?.recipients === 'students' ? 'Estudiantes' : 'Personalizado'}
                </Badge>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <p className="whitespace-pre-wrap">{viewingMessage?.content}</p>
              </div>
              
              {viewingMessage?.status === 'sent' && (
                <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded">
                  <span>Estado de lectura:</span>
                  <span className="font-medium">
                    {viewingMessage.readCount}/{viewingMessage.totalRecipients} personas han leído
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingMessage(null)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  )
}