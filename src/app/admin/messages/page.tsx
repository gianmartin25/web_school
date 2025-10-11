"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Send,
  Inbox,
  SendHorizontal,
  Archive,
  AlertCircle,
  CheckCircle,
  Info,
  User,
  Calendar,
  Reply,
  Forward,
  Trash2
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Message {
  id: string
  subject: string
  content: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  isRead: boolean
  sentAt: string
  sender: User
  receiver: User
}

export default function AdminMessagesPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '') {
      return 'Fecha no disponible'
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Fecha inválida'
      }
      return format(date, 'dd/MM/yyyy HH:mm', { locale: es })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Error en fecha'
    }
  }
  const [selectedView, setSelectedView] = useState<'inbox' | 'sent'>('inbox')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({
    receiverId: '',
    subject: '',
    content: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?view=${selectedView}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedView])

  useEffect(() => {
    fetchMessages()
    fetchUsers()
  }, [fetchMessages])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const sendMessage = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage)
      })

      if (response.ok) {
        setIsNewMessageOpen(false)
        setNewMessage({
          receiverId: '',
          subject: '',
          content: '',
          priority: 'MEDIUM'
        })
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH'
      })

      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        ))
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <AlertCircle className="h-4 w-4" />
      case 'HIGH': return <AlertCircle className="h-4 w-4" />
      case 'MEDIUM': return <Info className="h-4 w-4" />
      case 'LOW': return <CheckCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const unreadCount = messages.filter(msg => !msg.isRead && selectedView === 'inbox').length

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestión de Mensajes</h2>
            <p className="text-muted-foreground">
              Administra la comunicación del sistema educativo
            </p>
          </div>
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Mensaje
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Enviar Nuevo Mensaje</DialogTitle>
                <DialogDescription>
                  Envía un mensaje a usuarios del sistema educativo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destinatario</label>
                  <Select
                    value={newMessage.receiverId}
                    onValueChange={(value) => setNewMessage({ ...newMessage, receiverId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un destinatario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{user.name} ({user.role})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridad</label>
                  <Select
                    value={newMessage.priority}
                    onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => 
                      setNewMessage({ ...newMessage, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Baja</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asunto</label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    placeholder="Ingresa el asunto del mensaje"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensaje</label>
                  <Textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewMessageOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={sendMessage}>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensaje
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bandeja de Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedView === 'inbox' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('inbox')}
              >
                <Inbox className="mr-2 h-4 w-4" />
                Recibidos
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant={selectedView === 'sent' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedView('sent')}
              >
                <SendHorizontal className="mr-2 h-4 w-4" />
                Enviados
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedView === 'inbox' ? 'Mensajes Recibidos' : 'Mensajes Enviados'}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar mensajes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="URGENT">Urgente</SelectItem>
                      <SelectItem value="HIGH">Alta</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="LOW">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando mensajes...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No hay mensajes</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        !message.isRead && selectedView === 'inbox' ? 'bg-blue-50 border-blue-200' : ''
                      } ${selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (!message.isRead && selectedView === 'inbox') {
                          markAsRead(message.id)
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {selectedView === 'inbox' ? message.sender.name : message.receiver.name}
                            </span>
                            <Badge className={getPriorityColor(message.priority)}>
                              {getPriorityIcon(message.priority)}
                              <span className="ml-1">{message.priority}</span>
                            </Badge>
                            {!message.isRead && selectedView === 'inbox' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <h3 className="font-medium mt-1 truncate">{message.subject}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(message.sentAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedMessage && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>{selectedMessage.subject}</span>
                    <Badge className={getPriorityColor(selectedMessage.priority)}>
                      {getPriorityIcon(selectedMessage.priority)}
                      <span className="ml-1">{selectedMessage.priority}</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>
                        {selectedView === 'inbox' 
                          ? `De: ${selectedMessage.sender.name}` 
                          : `Para: ${selectedMessage.receiver.name}`
                        }
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(selectedMessage.sentAt)}
                      </span>
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Reply className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
                  <Button variant="outline" size="sm">
                    <Forward className="h-4 w-4 mr-2" />
                    Reenviar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Archive className="h-4 w-4 mr-2" />
                    Archivar
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  )
}