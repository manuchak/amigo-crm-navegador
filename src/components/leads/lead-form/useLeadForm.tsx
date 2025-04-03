
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLeads } from '@/context/LeadsContext';
import { executeWebhook } from '@/components/call-center/utils/webhook';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Schema de validación para el formulario
const formSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  prefijo: z.string().default('+52'),
  telefono: z.string().min(10, { message: 'Ingresa un número de 10 dígitos' }),
  tieneVehiculo: z.enum(['SI', 'NO']),
  modeloVehiculo: z.string().optional(),
  anoVehiculo: z.string().optional(),
  experienciaSeguridad: z.enum(['SI', 'NO']),
  credencialSedena: z.enum(['SI', 'NO']),
  esArmado: z.enum(['SI', 'NO']),
});

export type LeadFormValues = z.infer<typeof formSchema>;

export const useLeadForm = () => {
  const { addLead } = useLeads();
  
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      email: '',
      prefijo: '+52',
      telefono: '',
      tieneVehiculo: 'NO',
      experienciaSeguridad: 'NO',
      credencialSedena: 'NO',
      esArmado: 'NO',
    },
  });
  
  const onSubmit = async (data: LeadFormValues) => {
    try {
      // Crear categoría basada en las respuestas
      let categoria = 'Custodio';
      const atributos = [];
      
      if (data.tieneVehiculo === 'SI') {
        atributos.push('con vehículo');
      }
      
      if (data.esArmado === 'SI') {
        atributos.push('armado');
      }
      
      if (atributos.length > 0) {
        categoria += ` (${atributos.join(' y ')})`;
      }
      
      // Formar datos de contacto
      const contacto = `${data.email} | ${data.prefijo}${data.telefono}`;
      
      // Crear nuevo lead
      const nuevoLead = {
        id: Date.now(),
        nombre: data.nombre,
        empresa: categoria,
        contacto: contacto,
        estado: 'Nuevo',
        fechaCreacion: new Date().toISOString().split('T')[0],
      };
      
      // Construct the full phone number with prefix
      const fullPhoneNumber = `${data.prefijo}${data.telefono}`;
      
      // Enviar datos al webhook with phone as a separate field
      await executeWebhook({
        telefono: fullPhoneNumber,
        leadName: data.nombre,
        leadId: nuevoLead.id,
        empresa: categoria,
        email: data.email,
        estado: 'Nuevo',
        fechaCreacion: nuevoLead.fechaCreacion,
        timestamp: new Date().toISOString(),
        action: "lead_created",
        contactInfo: contacto,
        fuente: "Form"
      });
      
      console.log('Enviando lead a Supabase:', nuevoLead);
      
      // Insertar los datos en el formato correcto para Supabase
      const { error } = await supabase
        .from('leads')
        .insert([{
          datos: {
            nombre: data.nombre,
            email: data.email,
            telefono: fullPhoneNumber,
            empresa: categoria,
            estado: 'Nuevo',
            fuente: 'Form',
            original_id: nuevoLead.id,
            fecha_creacion: nuevoLead.fechaCreacion,
            tieneVehiculo: data.tieneVehiculo,
            experienciaSeguridad: data.experienciaSeguridad,
            credencialSedena: data.credencialSedena,
            esArmado: data.esArmado
          }
        }]);
      
      if (error) {
        console.error('Error al insertar en Supabase:', error);
        throw error;
      }
      
      // Añadir lead al contexto local
      await addLead(nuevoLead);
      
      toast.success('Lead registrado correctamente');
      
      // Resetear formulario
      form.reset();
      
    } catch (error) {
      console.error('Error al crear lead:', error);
      toast.error('Error al crear el lead');
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit)
  };
};
