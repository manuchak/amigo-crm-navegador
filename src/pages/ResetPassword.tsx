
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof formSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Obtener el hash del token de la URL
    const hashParam = window.location.hash.substring(1);
    if (hashParam) {
      const params = new URLSearchParams(hashParam);
      const type = params.get('type');
      const accessToken = params.get('access_token');
      
      if (type === 'recovery' && accessToken) {
        setHash(accessToken);
        console.log('Token de recuperación encontrado');
      } else {
        console.error('Parámetros de recuperación de contraseña no válidos');
        toast.error('Enlace de restablecimiento no válido');
        setTimeout(() => navigate('/login'), 3000);
      }
    } else {
      console.error('No se encontró hash en la URL');
      toast.error('Enlace de restablecimiento no válido');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  const onSubmit = async (data: FormData) => {
    if (!hash) {
      toast.error('Token de recuperación no encontrado');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Intentando actualizar contraseña...');
      
      // Actualizar la contraseña usando el token de acceso
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) {
        console.error('Error al actualizar contraseña:', error);
        throw error;
      }
      
      toast.success('Contraseña actualizada con éxito');
      setIsSuccess(true);
      
      // Redirigir al login después de unos segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      toast.error('Error al actualizar la contraseña. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Restablecer contraseña
          </CardTitle>
          <CardDescription className="text-center">
            Crea una nueva contraseña para tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Contraseña actualizada con éxito</h3>
              <p className="mt-2 text-sm text-gray-600">
                Serás redirigido a la página de inicio de sesión en unos segundos...
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva contraseña</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar contraseña</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading || !hash}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    'Guardar nueva contraseña'
                  )}
                </Button>
                
                <div className="text-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={() => navigate('/login')}
                    className="mt-2"
                  >
                    Volver a inicio de sesión
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
