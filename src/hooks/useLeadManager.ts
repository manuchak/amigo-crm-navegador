
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLeads } from '@/context/LeadsContext';
import { LeadFormValues } from '@/components/lead-form/types';
import { Lead } from '@/context/LeadsContext';

export function useLeadManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState<Lead | null>(null);
  const { toast } = useToast();
  const { addLead } = useLeads();

  const handleSubmitLeadForm = (formData: LeadFormValues) => {
    const tipoEmpresa = [];
    
    if (formData.tieneCarroPropio === "SI") {
      tipoEmpresa.push("con vehículo");
    }
    
    if (formData.esArmado === "SI") {
      tipoEmpresa.push("armado");
    }
    
    const empresaDescription = tipoEmpresa.length > 0 
      ? `Custodios (${tipoEmpresa.join(", ")})` 
      : "Custodios";
    
    const contacto = `${formData.email} | ${formData.telefono}`;
    
    // Generate a unique ID for the new lead
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    
    const newLead = {
      id: newId,
      nombre: formData.nombre,
      empresa: empresaDescription,
      contacto: contacto,
      estado: 'Nuevo',
      fechaCreacion: new Date().toISOString().split('T')[0],
    };

    setNewLeadData(newLead);
    setConfirmDialogOpen(true);
  };
  
  const confirmAddLead = () => {
    if (newLeadData) {
      addLead(newLeadData);
      
      toast({
        title: "Lead registrado",
        description: `${newLeadData.nombre} ha sido agregado a la lista de leads`,
      });
      
      setNewLeadData(null);
      setConfirmDialogOpen(false);
      setDialogOpen(false); 
    }
  };

  return {
    dialogOpen,
    setDialogOpen,
    confirmDialogOpen,
    setConfirmDialogOpen,
    newLeadData,
    handleSubmitLeadForm,
    confirmAddLead
  };
}
