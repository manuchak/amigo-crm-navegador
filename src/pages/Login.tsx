
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { signIn, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if user is already authenticated
  useEffect(() => {
    if (currentUser) {
      console.log("User already logged in, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setLoginError(null);
      
      console.log("Attempting to login with:", values.email);
      
      const { user, error } = await signIn(values.email, values.password);
      
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
        const errorMsg = "No se pudo iniciar sesión";
        setLoginError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      toast.success('Sesión iniciada con éxito');
      console.log("Login successful, navigating to dashboard");
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error("Login submission error:", err);
      setLoginError(err?.message || "Error al iniciar sesión");
      toast.error(err?.message || "Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="nombre@empresa.com" 
                        autoComplete="email"
                        disabled={isSubmitting || authLoading}
                        {...field} 
                      />
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
                      <Input 
                        type="password" 
                        autoComplete="current-password"
                        disabled={isSubmitting || authLoading}
                        {...field} 
                      />
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
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || authLoading}
              >
                {(isSubmitting || authLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Cargando...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center">
            <Link 
              to="/auth?mode=reset" 
              className="text-sm text-blue-600 hover:text-blue-800 transition"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/auth?mode=register">Registrarse</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
