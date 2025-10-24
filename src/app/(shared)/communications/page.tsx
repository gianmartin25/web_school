"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Megaphone, Send, Search, Filter, User } from "lucide-react"
import { MessageDetailDialog } from "@/components/message-detail-dialog"
import { ConversationView } from "@/components/conversation-view"
import { MultiUserCombobox } from "@/components/multi-user-combobox"

interface Message {
  id: string
  subject: string
  content: string
  createdAt: string
  isRead: boolean
  isBroadcast: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  threadId?: string
  replyToId?: string
  sender: {
    id: string
    name: string
    email: string
    role: string
  }
  receiver?: {
    id: string
    name: string
    email: string
    role: string
  }
  targetRole?: string
  replyTo?: {
    id: string
    subject: string
    sender: {
      name: string
    }
  }
  _count?: {
    replies: number
  }
  participants?: Array<{
    id: string
    name: string
    email: string
    role: string
  }>
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function UnifiedCommunications() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("ALL")
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isMessageDetailOpen, setIsMessageDetailOpen] = useState(false)
  const [isConversationViewOpen, setIsConversationViewOpen] = useState(false)

  // Form state
  const [newMessage, setNewMessage] = useState<{
    subject: string;
    content: string;
    receiverIds: string[];
    targetRole: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    isBroadcast: boolean;
  }>({
    subject: "",
    content: "",
    receiverIds: [],
    targetRole: "ALL",
    priority: "MEDIUM",
    isBroadcast: false
  })

  // Cargar mensajes
  const fetchMessages = async (type = "all", view = activeTab) => {
    try {
      const params = new URLSearchParams({ type, view })
      const response = await fetch(`/api/unified-messages?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuarios para envío de mensajes
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/messaging/users')
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        
        if (data.users?.length === 0) {
          console.warn('No users available for messaging')
        }
      } else {
        console.error('Failed to fetch messaging users:', response.status, response.statusText)
        setUsers([])
      }
    } catch (error) {
      console.error("Error loading messaging users:", error)
      setUsers([])
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchUsers()
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  // Crear nuevo mensaje
  const [sendingMessage, setSendingMessage] = useState(false);
  const handleSendMessage = async () => {
    if (sendingMessage) return;
    setSendingMessage(true);
    try {
      const response = await fetch('/api/unified-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      })

      const responseData = await response.text()

      if (response.ok) {
        toast({
          title: "Mensaje enviado",
          description: newMessage.isBroadcast ? "Comunicado enviado exitosamente" : "Mensaje enviado exitosamente"
        })
        setIsNewMessageDialogOpen(false)
        setNewMessage({
          subject: "",
          content: "",
          receiverIds: [],
          targetRole: "ALL",
          priority: "MEDIUM",
          isBroadcast: false
        })
        fetchMessages()
      } else {
        const errorData = JSON.parse(responseData)
        throw new Error(errorData.error || "Error al enviar mensaje")
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar el mensaje",
        variant: "destructive"
      })
    } finally {
      setSendingMessage(false);
    }
  }

  // Enviar respuesta en conversación
  const handleSendReply = async (content: string, replyToId: string) => {
    try {
      const originalMessage = messages.find(m => m.id === replyToId)
      if (!originalMessage) throw new Error("Mensaje original no encontrado")

      const replyData = {
        subject: `Re: ${originalMessage.subject}`,
        content,
        receiverId: originalMessage.sender.id, // Responder al remitente original (campo individual para respuestas)
        priority: "MEDIUM" as const,
        isBroadcast: false,
        replyToId, // Incluir referencia al mensaje original
        threadId: originalMessage.threadId || originalMessage.id // Usar threadId existente o crear nuevo hilo
      }

      const response = await fetch('/api/unified-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData)
      })

      if (response.ok) {
        toast({
          title: "Respuesta enviada",
          description: "Tu respuesta ha sido enviada exitosamente"
        })
        fetchMessages() // Recargar mensajes para mostrar la respuesta
      } else {
        throw new Error("Error al enviar respuesta")
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive"
      })
    }
  }

  // Abrir conversación
  const handleOpenConversation = (message: Message) => {
    setSelectedMessage(message)
    setIsConversationViewOpen(true)
  }

  // Marcar como leído
  const markAsRead = async (messageId: string) => {
    try {
      await fetch('/api/unified-messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, isRead: true })
      })
      fetchMessages()
    } catch (error) {
      console.error("Error marking as read:", error)
    }
  }

  // Abrir detalle del mensaje
  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message)
    setIsMessageDetailOpen(true)
    
    // Marcar como leído si no lo está
    if (!message.isRead && message.sender.id !== session?.user?.id) {
      markAsRead(message.id)
    }
  }

  // Responder mensaje - abrir conversación
  const handleReplyMessage = (message: Message) => {
    setIsMessageDetailOpen(false)
    handleOpenConversation(message)
  }

  // Filtrar mensajes
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === "ALL" || message.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'default'
      case 'LOW': return 'secondary'
      default: return 'default'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'Urgente'
      case 'HIGH': return 'Alta prioridad'
      case 'MEDIUM': return 'Media prioridad'
      case 'LOW': return 'Baja prioridad'
      default: return priority
    }
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sistema de Comunicaciones</h1>
        
        <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              // Para padres y estudiantes, establecer automáticamente como mensaje directo
              if (session?.user?.role === 'PARENT' || session?.user?.role === 'STUDENT') {
                setNewMessage(prev => ({ ...prev, isBroadcast: false }))
              }
            }}>
              <Send className="h-4 w-4 mr-2" />
              Nuevo Mensaje
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Mensaje</DialogTitle>
              <DialogDescription>
                Envía un mensaje directo o crea un comunicado para múltiples usuarios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Indicador para padres y estudiantes */}
              {(session?.user?.role === 'PARENT' || session?.user?.role === 'STUDENT') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Tipo:</Label>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">Mensaje Directo</span>
                      <Badge variant="secondary" className="text-xs">Solo mensajes directos disponibles</Badge>
                    </div>
                  </div>
                </div>
              )}
              {/* Solo mostrar selector de tipo para administradores y profesores */}
              {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="messageType" className="text-right">Tipo:</Label>
                  <div className="col-span-3">
                    <Select 
                      value={newMessage.isBroadcast ? "broadcast" : "direct"}
                      onValueChange={(value) => setNewMessage(prev => ({ 
                        ...prev, 
                        isBroadcast: value === "broadcast",
                        receiverIds: [],
                        targetRole: "ALL"
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Mensaje Directo
                          </div>
                        </SelectItem>
                        <SelectItem value="broadcast">
                          <div className="flex items-center">
                            <Megaphone className="h-4 w-4 mr-2" />
                            Comunicado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {newMessage.isBroadcast ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetRole" className="text-right">Dirigido a:</Label>
                  <div className="col-span-3">
                    <Select 
                      value={newMessage.targetRole}
                      onValueChange={(value) => setNewMessage(prev => ({ ...prev, targetRole: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar destinatarios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos los usuarios</SelectItem>
                        <SelectItem value="TEACHER">Solo Profesores</SelectItem>
                        <SelectItem value="PARENT">Solo Padres</SelectItem>
                        <SelectItem value="STUDENT">Solo Estudiantes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="receiver" className="text-right">Destinatarios:</Label>
                  <div className="col-span-3">
                    <MultiUserCombobox
                      users={users.map(user => ({ 
                        id: user.id, 
                        name: user.name, 
                        email: user.email, 
                        role: user.role 
                      }))}
                      values={newMessage.receiverIds}
                      onValuesChange={(values: string[]) => setNewMessage(prev => ({ ...prev, receiverIds: values }))}
                      placeholder="Buscar y seleccionar destinatarios..."
                      maxSelections={20}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">Prioridad:</Label>
                <div className="col-span-3">
                  <Select 
                    value={newMessage.priority}
                    onValueChange={(value: "LOW" | "MEDIUM" | "HIGH" | "URGENT") => setNewMessage(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baja prioridad</SelectItem>
                      <SelectItem value="MEDIUM">Media prioridad</SelectItem>
                      <SelectItem value="HIGH">Alta prioridad</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">Asunto:</Label>
                <div className="col-span-3">
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Escriba el asunto del mensaje"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">Mensaje:</Label>
                <div className="col-span-3">
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    placeholder="Escriba el contenido del mensaje"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.subject || !newMessage.content || (!newMessage.isBroadcast && newMessage.receiverIds.length === 0)}
              >
                <Send className="h-4 w-4 mr-2" />
                {newMessage.isBroadcast ? 'Enviar Comunicado' : 'Enviar Mensaje'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar mensajes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las prioridades</SelectItem>
            <SelectItem value="URGENT">Urgente</SelectItem>
            <SelectItem value="HIGH">Alta prioridad</SelectItem>
            <SelectItem value="MEDIUM">Media prioridad</SelectItem>
            <SelectItem value="LOW">Baja prioridad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox">
            <MessageSquare className="h-4 w-4 mr-2" />
            Bandeja de Entrada
          </TabsTrigger>
          <TabsTrigger value="sent">Enviados</TabsTrigger>
          <TabsTrigger value="broadcasts">
            <Megaphone className="h-4 w-4 mr-2" />
            Comunicados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Mensajes Recibidos
                <Badge variant="secondary">
                  {filteredMessages.filter(m => !m.isRead && m.sender.id !== session?.user?.id).length} sin leer
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando mensajes...</div>
              ) : filteredMessages.filter(m => m.sender.id !== session?.user?.id).length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No tienes mensajes recibidos.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages
                    .filter(m => m.sender.id !== session?.user?.id)
                    .map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200 ${
                        !message.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                      }`}
                      title={message.isBroadcast ? "Clic para ver detalles" : "Clic para abrir conversación"}
                      onClick={() => {
                        if (!message.isRead) markAsRead(message.id)
                        if (!message.isBroadcast) {
                          handleOpenConversation(message)
                        } else {
                          handleViewMessage(message)
                        }
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>
                            {message.sender.name}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className={`text-sm text-gray-600 ${!message.isRead ? 'font-semibold' : ''}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex items-center mt-2 gap-2">
                          <Badge variant={message.isBroadcast ? "secondary" : "default"} className="text-xs">
                            {message.isBroadcast ? "Comunicado" : "Directo"}
                          </Badge>
                          <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                            {getPriorityLabel(message.priority)}
                          </Badge>
                          {!message.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              Nuevo
                            </Badge>
                          )}
                          {message._count?.replies && message._count.replies > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {message._count.replies} respuesta{message._count.replies !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {message.replyTo && (
                            <Badge variant="outline" className="text-xs">
                              Respuesta a: {message.replyTo.sender.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {!message.isBroadcast && (
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando mensajes...</div>
              ) : filteredMessages.filter(m => m.sender.id === session?.user?.id).length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No has enviado mensajes recientemente.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages
                    .filter(m => m.sender.id === session?.user?.id)
                    .map((message) => (
                    <div 
                      key={message.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200"
                      title={message.isBroadcast ? "Clic para ver detalles" : "Clic para abrir conversación"}
                      onClick={() => {
                        if (!message.isBroadcast) {
                          handleOpenConversation(message)
                        } else {
                          handleViewMessage(message)
                        }
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">
                            {message.isBroadcast ? 
                              `Para: ${message.targetRole ? 
                                (message.targetRole === 'TEACHER' ? 'Profesores' : 
                                 message.targetRole === 'PARENT' ? 'Padres' : 
                                 message.targetRole === 'STUDENT' ? 'Estudiantes' : 'Todos') 
                                : 'Todos los usuarios'}` : 
                              message.participants && message.participants.length > 1 ?
                                `Para: ${message.participants.filter(p => p.id !== session?.user?.id).map(p => p.name).join(', ')}` :
                                `Para: ${message.receiver?.name}`}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{message.subject}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex items-center mt-2 gap-2">
                          <Badge variant={message.isBroadcast ? "secondary" : "default"} className="text-xs">
                            {message.isBroadcast ? "Comunicado" : "Directo"}
                          </Badge>
                          <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                            {getPriorityLabel(message.priority)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {!message.isBroadcast && (
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Comunicados del Colegio
                </div>
                {(session?.user?.role === 'ADMIN' || session?.user?.role === 'TEACHER') ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setNewMessage(prev => ({ ...prev, isBroadcast: true }))
                      setIsNewMessageDialogOpen(true)
                    }}
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    Crear Comunicado
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Solo lectura
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando comunicados...</div>
              ) : filteredMessages.filter(m => m.isBroadcast).length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No hay comunicados disponibles.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages
                    .filter(m => m.isBroadcast)
                    .map((message) => (
                    <div 
                      key={message.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all duration-200"
                      title="Clic para ver detalles"
                      onClick={() => handleViewMessage(message)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{message.subject}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Por: {message.sender.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex items-center mt-2 gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {message.targetRole ? 
                              (message.targetRole === 'TEACHER' ? 'Para Profesores' : 
                               message.targetRole === 'PARENT' ? 'Para Padres' : 
                               message.targetRole === 'STUDENT' ? 'Para Estudiantes' : 'Para Todos') 
                              : 'Para todos los usuarios'}
                          </Badge>
                          <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                            {getPriorityLabel(message.priority)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalle del mensaje */}
      <MessageDetailDialog
        message={selectedMessage}
        open={isMessageDetailOpen}
        onOpenChange={setIsMessageDetailOpen}
        onReply={handleReplyMessage}
      />

      {/* Vista de conversación */}
      <ConversationView
        message={selectedMessage}
        open={isConversationViewOpen}
        onOpenChange={setIsConversationViewOpen}
        currentUserId={session?.user?.id || ""}
        onSendReply={handleSendReply}
      />
    </div>
  )
}