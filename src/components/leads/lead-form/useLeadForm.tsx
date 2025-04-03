
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLeads } from '@/context/LeadsContext';
import { executeWebhook } from '@/components/call-center/utils/webhook';
import { toast } from 'sonner';
import { createLead, LeadData } from '@/services/leadService';

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
      
      // Construct the full phone number with prefix
      const fullPhoneNumber = `${data.prefijo}${data.telefono}`;
      
      // Generate a unique ID for the new lead
      const newId = Date.now();
      
      // Crear nuevo lead for context
      const nuevoLead = {
        id: newId,
        nombre: data.nombre,
        empresa: categoria,
        contacto: `${data.email} | ${fullPhoneNumber}`,
        estado: 'Nuevo',
        fechaCreacion: new Date().toISOString().split('T')[0],
        email: data.email,
        telefono: fullPhoneNumber
      };
      
      // Enviar datos al webhook with phone as a separate field
      try {
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
          contactInfo: nuevoLead.contacto,
          fuente: "Form"
        });
        console.log('Webhook executed successfully');
      } catch (webhookError) {
        console.error('Error executing webhook:', webhookError);
        // Continue with lead creation even if webhook fails
      }
      
      console.log('Enviando lead a Supabase:', nuevoLead);
      
      // Prepare lead data for Supabase - matching the exact column names in database
      const leadData: LeadData = {
        nombre: data.nombre,
        email: data.email,
        telefono: fullPhoneNumber,
        empresa: categoria,
        estado: 'Nuevo',
        fuente: 'Form',
        original_id: newId,
        fecha_creacion: nuevoLead.fechaCreacion,
        tienevehiculo: data.tieneVehiculo,
        experienciaseguridad: data.experienciaSeguridad,
        credencialsedena: data.credencialSedena,
        esarmado: data.esArmado,
        modelovehiculo: data.modeloVehiculo || null,
        anovehiculo: data.anoVehiculo || null,
        valor: 0
      };
      
      // Use the leadService to create the lead
      const result = await createLead(leadData);
      console.log('Lead creation result:', result);
      
      // Add lead to local context
      await addLead(nuevoLead);
      
      toast.success('Lead registrado correctamente');
      
      // Reset form
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
