import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { createLead, LeadData } from '@/services/leadService';
import { executeWebhook } from '@/components/call-center/utils/webhook';

interface RegistrationFormProps {
  onSuccess?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    telefonoPrefijo: '+52', 
    tieneVehiculo: 'NO',
    experienciaSeguridad: 'NO',
    esMilitar: 'NO',
    interesado: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrefixChange = (value: string) => {
    setFormData(prev => ({ ...prev, telefonoPrefijo: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, interesado: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.telefono) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Combine prefix with phone number for full phone number
      const fullPhoneNumber = `${formData.telefonoPrefijo}${formData.telefono}`;
      
      console.log('Form data being submitted:', formData);
      
      let empresa = 'Custodio';
      const atributos = [];
      
      if (formData.tieneVehiculo === 'SI') {
        atributos.push('con vehículo');
      }
      
      if (formData.experienciaSeguridad === 'SI') {
        atributos.push('con experiencia');
      }
      
      if (formData.esMilitar === 'SI') {
        atributos.push('militar');
      }
      
      if (atributos.length > 0) {
        empresa += ` (${atributos.join(', ')})`;
      }

      // Format phone number for database - store as string to match Supabase schema
      let phoneNumber = '';
      if (fullPhoneNumber) {
        // Clean the phone number but keep it as a string
        phoneNumber = fullPhoneNumber.replace(/[^\d+]/g, '');
      }

      // Map form data to database column names exactly
      const leadData: LeadData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: phoneNumber, // Store as string
        empresa: empresa,
        estado: 'Nuevo',
        fuente: 'Landing',
        fecha_creacion: new Date().toISOString(),
        tienevehiculo: formData.tieneVehiculo,
        experienciaseguridad: formData.experienciaSeguridad,
        esmilitar: formData.esMilitar,
        credencialsedena: 'NO',  // Default value
        esarmado: 'NO'           // Default value
      };
      
      console.log('Prepared lead data for Supabase:', leadData);
      
      // Execute webhook (optional - don't let it block form submission)
      try {
        const leadId = Date.now();
        await executeWebhook({
          telefono: fullPhoneNumber, // Use original format for webhook
          leadName: formData.nombre,
          leadId: leadId,
          empresa: empresa,
          email: formData.email,
          estado: 'Nuevo',
          fechaCreacion: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString(),
          action: "lead_created",
          contactInfo: `${formData.email} | ${fullPhoneNumber}`,
          fuente: "Landing"
        });
        console.log('Webhook executed successfully');
      } catch (webhookError) {
        console.error('Error executing webhook:', webhookError);
        // Continue with lead creation even if webhook fails
      }
      
      // Create the lead in Supabase
      const result = await createLead(leadData);
      console.log('Lead creation result:', result);
      
      setIsSuccess(true);
      toast.success("¡Registro exitoso! Nos pondremos en contacto contigo pronto.", {
        duration: 5000
      });
      
      // Reset form
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        telefonoPrefijo: '+52', // Reset to default
        tieneVehiculo: 'NO',
        experienciaSeguridad: 'NO',
        esMilitar: 'NO',
        interesado: true
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Hubo un problema al enviar tus datos. Inténtalo de nuevo.", {
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <BadgeCheck className="h-16 w-16 text-accent mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">¡Registro exitoso!</h3>
        <p className="text-gray-200 text-center mb-6">
          Hemos recibido tus datos. Un representante se pondrá en contacto contigo pronto.
        </p>
        <Button 
          onClick={() => setIsSuccess(false)}
          className="bg-white/20 hover:bg-white/30 text-white"
        >
          Registrar otro candidato
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Regístrate ahora</h3>
      
      <div className="space-y-2">
        <Label htmlFor="nombre" className="text-gray-200">Nombre completo *</Label>
        <Input
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Tu nombre completo"
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-200">Correo electrónico *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-gray-200">Teléfono *</Label>
          <div className="flex space-x-2">
            <Select
              value={formData.telefonoPrefijo}
              onValueChange={handlePrefixChange}
            >
              <SelectTrigger className="w-[90px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="+52" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+52">+52 (México)</SelectItem>
                <SelectItem value="+1">+1 (USA)</SelectItem>
                <SelectItem value="+34">+34 (España)</SelectItem>
                <SelectItem value="+57">+57 (Colombia)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="55 1234 5678"
              required
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-10"
            />
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-white mt-4 mb-2">Experiencia y recursos</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tieneVehiculo" className="text-gray-200">¿Tienes vehículo propio?</Label>
          <Select 
            value={formData.tieneVehiculo} 
            onValueChange={(value) => handleSelectChange('tieneVehiculo', value)}
          >
            <SelectTrigger id="tieneVehiculo" className="bg-white/10 border-white/20 text-white h-10">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">Sí</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="experienciaSeguridad" className="text-gray-200">¿Experiencia en seguridad?</Label>
          <Select 
            value={formData.experienciaSeguridad} 
            onValueChange={(value) => handleSelectChange('experienciaSeguridad', value)}
          >
            <SelectTrigger id="experienciaSeguridad" className="bg-white/10 border-white/20 text-white h-10">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">Sí</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="esMilitar" className="text-gray-200">¿Militar en situación de retiro?</Label>
          <Select 
            value={formData.esMilitar} 
            onValueChange={(value) => handleSelectChange('esMilitar', value)}
          >
            <SelectTrigger id="esMilitar" className="bg-white/10 border-white/20 text-white h-10">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">Sí</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-start space-x-2 mt-4">
        <Checkbox 
          id="interesado" 
          checked={formData.interesado}
          onCheckedChange={handleCheckboxChange}
          className="border-white/30 data-[state=checked]:bg-accent mt-1"
        />
        <Label htmlFor="interesado" className="text-sm text-gray-200">
          Estoy interesado en recibir información sobre oportunidades como custodio
        </Label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent/90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
      </Button>
    </form>
  );
};

export default RegistrationForm;
