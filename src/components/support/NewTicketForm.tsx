
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupport } from '@/context/SupportContext';
import { useAuth } from '@/context/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ticketSchema = z.object({
  subject: z.string().min(5, {
    message: 'El asunto debe tener al menos 5 caracteres',
  }),
  description: z.string().min(20, {
    message: 'La descripción debe tener al menos 20 caracteres',
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Por favor seleccione una prioridad',
  }),
  customer_name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres',
  }),
  customer_email: z.string().email({
    message: 'Por favor ingrese un email válido',
  }),
  channel: z.enum(['web', 'email', 'phone', 'chat', 'social'], {
    required_error: 'Por favor seleccione un canal',
  }),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface NewTicketFormProps {
  onSuccess?: () => void;
}

const NewTicketForm: React.FC<NewTicketFormProps> = ({ onSuccess }) => {
  const { createTicket } = useSupport();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const defaultValues: Partial<TicketFormValues> = {
    priority: 'medium',
    channel: 'web',
    customer_name: currentUser?.displayName || '',
    customer_email: currentUser?.email || '',
  };
  
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: TicketFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createTicket(data);
      if (result) {
        toast.success('Ticket creado exitosamente');
        form.reset(defaultValues);
        onSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Crear Nuevo Ticket</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto</FormLabel>
                    <FormControl>
                      <Input placeholder="¿Sobre qué es tu consulta?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un canal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Teléfono</SelectItem>
                        <SelectItem value="chat">Chat</SelectItem>
                        <SelectItem value="social">Redes Sociales</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu correo electrónico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe tu consulta o problema en detalle..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              Te responderemos a la brevedad posible. La mayoría de las consultas se resuelven en menos de 24 horas.
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : 'Enviar Ticket'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewTicketForm;
