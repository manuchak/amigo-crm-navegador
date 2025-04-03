import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationFormProps {
  onSuccess?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, interesado: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Determine the category based on responses
      let categoria = 'Custodio';
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
        categoria += ` (${atributos.join(', ')})`;
      }

      // Insert into Supabase with correct table structure
      const { error } = await supabase
        .from('leads')
        .insert({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          empresa: categoria,
          estado: 'Nuevo',
          fuente: 'Landing',
          tieneVehiculo: formData.tieneVehiculo,
          experienciaSeguridad: formData.experienciaSeguridad,
          esMilitar: formData.esMilitar,
          fecha_creacion: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success("¡Registro exitoso! Nos pondremos en contacto contigo pronto.", {
        duration: 5000
      });
      
      // Reset form
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
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
        <BadgeCheck className="h-16 w-16 text-green-500 mb-4" />
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
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
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
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefono" className="text-gray-200">Teléfono *</Label>
          <Input
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="55 1234 5678"
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
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
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">Sí</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="esMilitar" className="text-gray-200">¿Eres militar o ex-militar?</Label>
          <Select 
            value={formData.esMilitar} 
            onValueChange={(value) => handleSelectChange('esMilitar', value)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SI">Sí</SelectItem>
              <SelectItem value="NO">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="interesado" 
          checked={formData.interesado}
          onCheckedChange={handleCheckboxChange}
          className="border-white/30 data-[state=checked]:bg-primary"
        />
        <Label htmlFor="interesado" className="text-sm text-gray-200">
          Estoy interesado en recibir información sobre oportunidades como custodio
        </Label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
      </Button>
    </form>
  );
};

export default RegistrationForm;
