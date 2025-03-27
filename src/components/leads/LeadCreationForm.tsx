
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useLeads } from '@/context/LeadsContext';
import { executeWebhook } from '../call-center/utils/webhook';

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

type FormValues = z.infer<typeof formSchema>;

const LeadCreationForm = () => {
  const { addLead } = useLeads();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => String(currentYear - i));
  
  const form = useForm<FormValues>({
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
  
  const watchTieneVehiculo = form.watch('tieneVehiculo');
  
  const onSubmit = async (data: FormValues) => {
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
        telefono: fullPhoneNumber, // This will be extracted as a separate object
        leadName: data.nombre,
        leadId: nuevoLead.id,
        empresa: categoria,
        email: data.email,
        estado: 'Nuevo',
        fechaCreacion: nuevoLead.fechaCreacion,
        timestamp: new Date().toISOString(),
        action: "lead_created",
        contactInfo: contacto
      });
      
      // Añadir lead a la base de datos local
      addLead(nuevoLead);
      
      // Notificar al usuario
      toast.success('Lead creado correctamente');
      
      // Resetear formulario
      form.reset();
      
    } catch (error) {
      console.error('Error al crear lead:', error);
      toast.error('Error al crear el lead');
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>Registro de Nuevo Custodio</CardTitle>
        <CardDescription>
          Ingresa los datos del candidato a custodio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información de contacto */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Información de contacto</h3>
                
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre y apellidos" {...field} />
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
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="prefijo"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Prefijo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Prefijo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="+52">+52 (México)</SelectItem>
                            <SelectItem value="+1">+1 (USA/Canadá)</SelectItem>
                            <SelectItem value="+34">+34 (España)</SelectItem>
                            <SelectItem value="+57">+57 (Colombia)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Número telefónico</FormLabel>
                        <FormControl>
                          <Input placeholder="10 dígitos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Calificaciones */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Calificaciones</h3>
                
                <FormField
                  control={form.control}
                  name="tieneVehiculo"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>¿Cuenta con vehículo propio?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="SI" />
                            </FormControl>
                            <FormLabel className="font-normal">Sí</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="NO" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchTieneVehiculo === 'SI' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200">
                    <FormField
                      control={form.control}
                      name="modeloVehiculo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo del vehículo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Nissan Versa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="anoVehiculo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Año del vehículo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar año" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="experienciaSeguridad"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>¿Tiene experiencia en seguridad?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="SI" />
                            </FormControl>
                            <FormLabel className="font-normal">Sí</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="NO" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="credencialSedena"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>¿Cuenta con credencial SEDENA?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="SI" />
                            </FormControl>
                            <FormLabel className="font-normal">Sí</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="NO" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="esArmado"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>¿Es armado?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="SI" />
                            </FormControl>
                            <FormLabel className="font-normal">Sí</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="NO" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Registrar custodio
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LeadCreationForm;
