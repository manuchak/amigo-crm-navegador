
import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupport } from '@/context/SupportContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

const ticketSchema = z.object({
  subject: z.string().min(3, { message: "El asunto debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  channel: z.enum(['web', 'email', 'phone', 'whatsapp']).default('web'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface NewTicketFormProps {
  onSuccess?: () => void;
}

const NewTicketForm: React.FC<NewTicketFormProps> = ({ onSuccess }) => {
  const { createTicket } = useSupport();
  const { currentUser } = useAuth();
  
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'medium',
      channel: 'web',
    },
  });
  
  const onSubmit = async (data: TicketFormValues) => {
    if (!currentUser) {
      toast.error("Debe iniciar sesión para crear un ticket");
      return;
    }
    
    const ticket = {
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      channel: data.channel,
      customer_email: currentUser.email || '',
      customer_name: currentUser.displayName || 'Usuario',
    };
    
    const createdTicket = await createTicket(ticket);
    
    if (createdTicket && onSuccess) {
      form.reset();
      onSuccess();
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Nuevo Ticket de Soporte</h2>
        <p className="text-muted-foreground">
          Complete el formulario a continuación para crear una nueva solicitud de soporte.
          Nuestro equipo responderá lo más pronto posible.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asunto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Problema con mi cuenta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describa su problema o consulta en detalle..."
                    className="min-h-32"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Por favor incluya toda la información relevante para ayudarnos a resolver su problema.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una prioridad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleccione la prioridad según la urgencia de su solicitud.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un canal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Teléfono</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Canal por el que prefiere recibir actualizaciones.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" className="w-full">
            Enviar Ticket
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewTicketForm;
