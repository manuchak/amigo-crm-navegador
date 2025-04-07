
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

const OWNER_EMAIL = 'manuel.chacon@detectasecurity.io';
const DEFAULT_PASSWORD = 'Custodios2024';

const EmailSignInForm: React.FC<{ onSuccess?: () => void; onForgotPassword?: () => void }> = ({ 
  onSuccess,
  onForgotPassword 
}) => {
  const { signIn, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [autoLoginAttempts, setAutoLoginAttempts] = useState(0);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: OWNER_EMAIL,
      password: DEFAULT_PASSWORD,
    },
  });

  // Attempt auto-login for owner account with multiple retries
  useEffect(() => {
    if (autoLoginAttempted || autoLoginAttempts >= 3) return;
    
    const attemptAutoLogin = async () => {
      setIsSubmitting(true);
      
      try {
        console.log(`Attempting auto-login for owner (attempt ${autoLoginAttempts + 1})...`);
        const userData = await signIn(OWNER_EMAIL, DEFAULT_PASSWORD);
        
        if (userData) {
          toast.success('¡Bienvenido administrador!');
          if (onSuccess) onSuccess();
          setAutoLoginAttempted(true);
        } else {
          // If login fails but no error is thrown, we'll retry
          setAutoLoginAttempts(prev => prev + 1);
          setTimeout(() => {
            if (autoLoginAttempts < 2) {
              // This will trigger useEffect again
              setAutoLoginAttempts(prev => prev + 1);
            } else {
              setAutoLoginAttempted(true);
            }
          }, 1500);
        }
      } catch (error: any) {
        console.error("Auto-login failed:", error);
        // Silent fail - user can still log in manually
        setAutoLoginAttempted(true);
      } finally {
        setIsSubmitting(false);
      }
    };
    
    // Small delay before attempting auto-login
    const timer = setTimeout(() => {
      attemptAutoLogin();
    }, 800);
    
    return () => clearTimeout(timer);
  }, [signIn, autoLoginAttempted, onSuccess, autoLoginAttempts]);

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      const userData = await signIn(data.email, data.password);
      
      if (userData) {
        if (data.email === OWNER_EMAIL) {
          toast.success('¡Bienvenido administrador!');
        } else {
          toast.success('¡Inicio de sesión exitoso!');
        }
        
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine the component loading state with the auth loading state
  const isLoading = authLoading || isSubmitting;

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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {onForgotPassword && (
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="link" 
              onClick={onForgotPassword}
              className="p-0 h-auto"
              disabled={isLoading}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
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
