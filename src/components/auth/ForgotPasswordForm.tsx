
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuthMethods } from '@/hooks/auth';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

type FormData = z.infer<typeof formSchema>;

const ForgotPasswordForm: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Using local password reset function
      console.log(`Password reset requested for ${data.email}. In a real app, an email would be sent.`);
      toast.success('Si tu cuenta existe, recibirás un correo con instrucciones para restablecer tu contraseña');
      
      // Clear the form
      form.reset();
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      // Don't show specific errors for security reasons
      toast.success('Si tu cuenta existe, recibirás un correo con instrucciones para restablecer tu contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="tucorreo@ejemplo.com"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex space-x-2">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Recuperar contraseña'
            )}
          </Button>
          
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
