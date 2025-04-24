
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const signUpSchema = z.object({
  displayName: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const EmailSignUpForm = () => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setIsLoading(true);
      await signUp(
        data.email, 
        data.password, 
        data.displayName
      );
      form.reset();
    } catch (error: any) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="nombre@empresa.com" {...field} />
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
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EmailSignUpForm;
