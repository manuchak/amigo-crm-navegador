
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  apiKey: z.string().min(1, { message: 'La clave API es requerida' })
});

interface VapiSecretFormProps {
  onSuccess?: () => void;
  defaultApiKey?: string;
}

const VapiSecretForm: React.FC<VapiSecretFormProps> = ({ onSuccess, defaultApiKey = '4e1d9a9c-de28-4e68-926c-3b5ca5a3ecb9' }) => {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: defaultApiKey
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('store-vapi-key', {
        body: { apiKey: values.apiKey },
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        toast.success('Clave API guardada correctamente');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data?.message || 'Error al guardar la clave API');
      }
    } catch (error) {
      console.error('Error saving VAPI API key:', error);
      toast.error(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <KeyRound className="h-4 w-4" /> 
                Clave API de VAPI
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ingresa la clave API de VAPI" 
                  {...field} 
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Clave API
        </Button>
      </form>
    </Form>
  );
};

export default VapiSecretForm;
