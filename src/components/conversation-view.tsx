"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, User, Reply, Send, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

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
  replies?: Message[]
}

interface ConversationViewProps {
  message: Message | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  onSendReply: (content: string, replyToId: string) => Promise<void>
}

export function ConversationView({ 
  message, 
  open, 
  onOpenChange, 
  currentUserId,
  onSendReply 
}: ConversationViewProps) {
  const [replyContent, setReplyContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])
  const [loadingConversation, setLoadingConversation] = useState(false)

  const loadConversation = useCallback(async (messageId: string) => {
    setLoadingConversation(true)
    try {
      const response = await fetch(`/api/conversations/${messageId}`)
      if (response.ok) {
        const data = await response.json()
        setConversationMessages(data.messages || [])
      } else {
        console.error('Error loading conversation')
        // Fallback: mostrar solo el mensaje original
        if (message) {
          setConversationMessages([message])
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      // Fallback: mostrar solo el mensaje original
      if (message) {
        setConversationMessages([message])
      }
    } finally {
      setLoadingConversation(false)
    }
  }, [message])

  useEffect(() => {
    if (message && open) {
      loadConversation(message.id)
    }
  }, [message, open, loadConversation])

  const handleSendReply = async () => {
    if (!replyContent.trim() || !message || isLoading) return

    setIsLoading(true)
    try {
      await onSendReply(replyContent, message.id)
      setReplyContent("")
      // Recargar la conversación para mostrar la nueva respuesta
      await loadConversation(message.id)
    } catch (error) {
      console.error("Error sending reply:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const isMyMessage = (msg: Message) => msg.sender.id === currentUserId

  if (!message) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-1 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle className="text-lg">{message.subject}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                  {getPriorityLabel(message.priority)}
                </Badge>
                {message.isBroadcast && (
                  <Badge variant="secondary" className="text-xs">
                    Comunicado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Conversación */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loadingConversation ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Cargando conversación...</div>
            </div>
          ) : (
            conversationMessages.map((msg) => (
              <Card 
                key={msg.id} 
                className={cn(
                  "transition-all",
                  isMyMessage(msg) 
                    ? "ml-8 border-primary/20 bg-primary/5" 
                    : "mr-8 border-border"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {msg.sender.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({getRoleLabel(msg.sender.role)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Responder - Solo para mensajes no broadcast */}
        {!message.isBroadcast && (
          <div className="flex-shrink-0 border-t pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="h-4 w-4" />
              <span>Responder a la conversación</span>
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Escribe tu respuesta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyContent("")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || isLoading}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isLoading ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}