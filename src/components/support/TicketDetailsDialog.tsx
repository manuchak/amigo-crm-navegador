import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ticket, TicketComment, useSupport } from '@/context/SupportContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/auth'; // Updated import path
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  MessageSquare, Send, Lock, Clock, AlertCircle, 
  User, Calendar, Tag, Mail, Phone 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface TicketDetailsDialogProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
  isAgent: boolean;
}

const TicketDetailsDialog: React.FC<TicketDetailsDialogProps> = ({
  ticket,
  open,
  onClose,
  isAgent
}) => {
  const { getTicketComments, addComment, updateTicket } = useSupport();
  const { currentUser } = useAuth();
  
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Define status and priority with proper typing
  const [status, setStatus] = useState<Ticket['status']>(ticket.status);
  const [priority, setPriority] = useState<Ticket['priority']>(ticket.priority);
  
  useEffect(() => {
    if (open && ticket) {
      setLoading(true);
      setStatus(ticket.status);
      setPriority(ticket.priority);
      
      const fetchComments = async () => {
        const fetchedComments = await getTicketComments(ticket.id);
        setComments(fetchedComments);
        setLoading(false);
      };
      
      fetchComments();
    }
  }, [open, ticket, getTicketComments]);
  
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const addedComment = await addComment(ticket.id, newComment, isInternal);
      if (addedComment) {
        setComments([...comments, addedComment]);
        setNewComment("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateTicket = async () => {
    if (status === ticket.status && priority === ticket.priority) {
      return;
    }
    
    const updates: Partial<Ticket> = {};
    
    if (status !== ticket.status) {
      updates.status = status;
    }
    
    if (priority !== ticket.priority) {
      updates.priority = priority;
    }
    
    const success = await updateTicket(ticket.id, updates);
    if (success) {
      toast.success("Ticket actualizado correctamente");
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Abierto</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En Progreso</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Pendiente</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Resuelto</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Cerrado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Alta</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Media</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Baja</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-muted-foreground font-normal">{ticket.ticket_number}:</span>
            {ticket.subject}
          </DialogTitle>
          <DialogDescription>
            Creado por {ticket.customer_name} ({ticket.customer_email}) – {formatDate(ticket.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="conversation" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="px-1">
              <TabsTrigger value="conversation" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>Conversación</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>Detalles</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversation" className="flex-1 flex flex-col overflow-hidden pt-4">
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <p className="text-muted-foreground">Cargando conversación...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No hay mensajes en esta conversación.</p>
                    <p className="text-xs text-muted-foreground">
                      Sé el primero en responder a esta solicitud.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-1">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{ticket.customer_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{ticket.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">Solicitud Original</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-line">{ticket.description}</p>
                    </div>
                    
                    {comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className={`${comment.is_internal 
                          ? 'bg-amber-50 border border-amber-100' 
                          : 'bg-muted/50'} rounded-lg p-4`}
                      >
                        <div className="flex items-start gap-2 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{comment.author_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{comment.author_name}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                              </div>
                              {comment.is_internal && (
                                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Nota Interna
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-line">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <Separator className="my-4" />
              
              <div className="flex flex-col gap-3">
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                
                <div className="flex justify-between">
                  {isAgent && (
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsInternal(!isInternal)}
                        className={isInternal ? "bg-amber-50 border-amber-200 text-amber-800" : ""}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        {isInternal ? "Nota Interna" : "Respuesta Pública"}
                      </Button>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleSubmitComment}
                    disabled={isSubmitting || !newComment.trim()}
                    className="ml-auto"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Enviar
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información del ticket</h3>
                  
                  <div className="grid grid-cols-2 gap-y-4">
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Número
                      </p>
                      <p>{ticket.ticket_number}</p>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Creado
                      </p>
                      <p>{formatDate(ticket.created_at)}</p>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Última actualización
                      </p>
                      <p>{formatDate(ticket.updated_at)}</p>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> Canal
                      </p>
                      <p className="capitalize">{ticket.channel}</p>
                    </div>
                  </div>
                  
                  {isAgent && (
                    <>
                      <h3 className="text-lg font-medium pt-2">Gestión del ticket</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Estado</p>
                          <Select 
                            value={status} 
                            onValueChange={(value: Ticket['status']) => setStatus(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Abierto</SelectItem>
                              <SelectItem value="in_progress">En Progreso</SelectItem>
                              <SelectItem value="pending">Pendiente</SelectItem>
                              <SelectItem value="resolved">Resuelto</SelectItem>
                              <SelectItem value="closed">Cerrado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Prioridad</p>
                          <Select 
                            value={priority} 
                            onValueChange={(value: Ticket['priority']) => setPriority(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                      
                      <Button 
                        className="w-full" 
                        onClick={handleUpdateTicket}
                        disabled={status === ticket.status && priority === ticket.priority}
                      >
                        Guardar Cambios
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información del cliente</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Nombre
                      </p>
                      <p>{ticket.customer_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </p>
                      <p>{ticket.customer_email}</p>
                    </div>
                    
                    {ticket.resolved_at && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Tiempo de resolución
                        </p>
                        <p>
                          {ticket.resolution_time_seconds
                            ? `${Math.floor(ticket.resolution_time_seconds / 3600)} horas, ${Math.floor((ticket.resolution_time_seconds % 3600) / 60)} minutos`
                            : 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-medium pt-2">Etiquetas y Categorías</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">El cliente está esperando</Badge>
                    <Badge variant="outline">Requiere seguimiento</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsDialog;
