import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClientFormProps {
  onClientAdded: () => void;
}

const initialFormState = {
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  etapa: 'Prospecto',
  valor: ''
};

const ClientForm: React.FC<ClientFormProps> = ({ onClientAdded }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, etapa: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create lead data for Supabase
      const { error } = await supabase
        .from('leads')
        .insert({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          empresa: formData.empresa,
          estado: formData.etapa,
          fuente: 'CRM',
          valor: parseFloat(formData.valor) || 0,
          fecha_creacion: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Cliente agregado",
        description: "El cliente ha sido agregado exitosamente",
      });
      
      setFormData(initialFormState);
      onClientAdded();
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar el cliente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre del cliente"
          required
          className="transition-all-medium focus:ring-2 focus:ring-primary/20 h-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
            className="transition-all-medium focus:ring-2 focus:ring-primary/20 h-10"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+34 600 000 000"
            required
            className="transition-all-medium focus:ring-2 focus:ring-primary/20 h-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="empresa">Empresa</Label>
        <Input
          id="empresa"
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
          placeholder="Nombre de la empresa"
          required
          className="transition-all-medium focus:ring-2 focus:ring-primary/20 h-10"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="etapa">Etapa</Label>
          <Select 
            value={formData.etapa} 
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="transition-all-medium focus:ring-2 focus:ring-primary/20 h-10">
              <SelectValue placeholder="Seleccionar etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Prospecto">Prospecto</SelectItem>
              <SelectItem value="Contactado">Contactado</SelectItem>
              <SelectItem value="Negociación">Negociación</SelectItem>
              <SelectItem value="Ganado">Ganado</SelectItem>
              <SelectItem value="Perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (€)</Label>
          <Input
            id="valor"
            name="valor"
            type="number"
            value={formData.valor}
            onChange={handleChange}
            placeholder="0.00"
            required
            className="transition-all-medium focus:ring-2 focus:ring-primary/20 h-10"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full transition-all-medium"
      >
        {isSubmitting ? 'Agregando...' : 'Agregar Cliente'}
      </Button>
    </form>
  );
};

export default ClientForm;
