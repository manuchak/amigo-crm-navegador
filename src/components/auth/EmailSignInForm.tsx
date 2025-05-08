
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type FormData = z.infer<typeof formSchema>;

interface EmailSignInFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

const EmailSignInForm: React.FC<EmailSignInFormProps> = ({ 
  onSuccess,
  onForgotPassword 
}) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      console.log("Attempting to login with:", data.email);
      
      const { user, error } = await signIn(data.email, data.password);
      
      if (error) {
        console.error("Login error:", error);
        
        // Extract error message based on error code
        let errorMessage = 'Error al iniciar sesión';
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Email no verificado';
        } else if (error.message?.includes('User not found')) {
          errorMessage = 'Usuario no encontrado';
        }
        
        setLoginError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      if (!user) {
        setLoginError("No se pudo iniciar sesión");
        toast.error("No se pudo iniciar sesión");
        return;
      }
      
      toast.success('Sesión iniciada con éxito');
      
      if (onSuccess) {
        console.log("Login successful, calling onSuccess callback");
        onSuccess();
      } else {
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error("Login submission error:", error);
      setLoginError(error?.message || "Error al iniciar sesión");
      toast.error(error?.message || "Error al iniciar sesión");
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
                    type="email"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {loginError && (
          <div className="text-sm text-red-500 mt-2">
            {loginError}
          </div>
        )}
        
        {onForgotPassword && (
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="link" 
              onClick={onForgotPassword}
              className="p-0 h-auto"
              disabled={isSubmitting}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EmailSignInForm;
