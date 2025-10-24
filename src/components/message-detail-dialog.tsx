"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Users, Reply, Forward } from "lucide-react"

interface Message {
  id: string
  subject: string
  content: string
  createdAt: string
  isRead: boolean
  isBroadcast: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
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
}

interface MessageDetailDialogProps {
  message: Message | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReply?: (message: Message) => void
}

export function MessageDetailDialog({ message, open, onOpenChange, onReply }: MessageDetailDialogProps) {
  if (!message) return null

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TEACHER': return 'Profesor/a'
      case 'PARENT': return 'Padre/Madre'
      case 'ADMIN': return 'Administrador'
      case 'STUDENT': return 'Estudiante'
      default: return role
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">{message.subject}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>De: {message.sender.name} ({getRoleLabel(message.sender.role)})</span>
              <Calendar className="h-4 w-4 ml-4" />
              <span>{new Date(message.createdAt).toLocaleString()}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Badges informativos */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={message.isBroadcast ? "secondary" : "default"}>
              {message.isBroadcast ? (
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Comunicado
                </div>
              ) : (
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  Mensaje Directo
                </div>
              )}
            </Badge>
            
            <Badge variant={getPriorityColor(message.priority)}>
              {getPriorityLabel(message.priority)}
            </Badge>

            {message.isBroadcast && (
              <Badge variant="outline">
                {message.targetRole ? 
                  `Para: ${message.targetRole === 'TEACHER' ? 'Profesores' : 
                           message.targetRole === 'PARENT' ? 'Padres' : 
                           message.targetRole === 'STUDENT' ? 'Estudiantes' : 'Todos'}` : 
                  'Para: Todos los usuarios'}
              </Badge>
            )}

            {!message.isBroadcast && message.receiver && (
              <Badge variant="outline">
                Para: {message.receiver.name}
              </Badge>
            )}
          </div>

          {/* Contenido del mensaje */}
          <div className="min-h-[200px] w-full border rounded-md p-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>

          {/* Información del remitente */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Información del Remitente</h4>
            <div className="text-sm space-y-1">
              <div><strong>Nombre:</strong> {message.sender.name}</div>
              <div><strong>Email:</strong> {message.sender.email}</div>
              <div><strong>Rol:</strong> {getRoleLabel(message.sender.role)}</div>
            </div>
          </div>
        </div>

        {/* Acciones - Siempre visibles en la parte inferior */}
        {!message.isBroadcast && onReply && (
          <div className="flex-shrink-0 flex gap-2 pt-4 border-t mt-4">
            <Button 
              onClick={() => onReply(message)} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Reply className="h-4 w-4" />
              Responder
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Forward className="h-4 w-4" />
              Reenviar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}