
import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { executeWebhook } from '../utils/webhook';
import { useLeads } from '@/context/LeadsContext';
import { toast } from 'sonner';
import { vapiWebhookUtils } from '@/hooks/lead-call-logs/webhook';

interface CallButtonsProps {
  isCallActive: boolean;
  selectedLead: number | null;
  handleStartCall: () => Promise<void>;
  handleEndCall: () => void;
}

const CallButtons: React.FC<CallButtonsProps> = ({
  isCallActive,
  selectedLead,
  handleStartCall,
  handleEndCall
}) => {
  const { leads, updateLeadStatus } = useLeads();
  
  const handleCall = async () => {
    if (!selectedLead) {
      toast.error("Selecciona un custodio para llamar");
      return;
    }

    const lead = leads.find(l => l.id === selectedLead);
    if (!lead) {
      toast.error("Custodio no encontrado");
      return;
    }

    // Extract phone number information - improved to handle multiple formats
    let phoneNumber = '';
    
    // First check if there's a direct telefono property
    if (lead.telefono) {
      phoneNumber = lead.telefono;
    } 
    // Then check if phone is in contacto format "email | phone"
    else if (lead.contacto && lead.contacto.includes('|')) {
      const contactParts = lead.contacto.split('|');
      phoneNumber = contactParts[1].trim();
    }
    
    if (!phoneNumber) {
      toast.warning("No se encontró un número telefónico para este custodio");
      return;
    }
    
    try {
      // Update lead status to "Contacto Llamado"
      await updateLeadStatus(selectedLead, "Contacto Llamado");
      
      // Initiate VAPI call using the webhook utility
      const callResult = await vapiWebhookUtils.initiateVapiCall(
        phoneNumber,
        lead.nombre || 'Cliente', 
        lead.id
      );

      if (!callResult.success) {
        throw new Error(callResult.error || callResult.message || "Error al iniciar llamada VAPI");
      }

      // Also send all lead data to the webhook for tracking
      await executeWebhook({
        telefono: phoneNumber,
        id: lead.id,
        nombre: lead.nombre,
        empresa: lead.empresa,
        contacto: lead.contacto,
        estado: "Contacto Llamado", // Update to new status
        fechaCreacion: lead.fechaCreacion,
        email: lead.email,
        tieneVehiculo: lead.tieneVehiculo,
        experienciaSeguridad: lead.experienciaSeguridad,
        esMilitar: lead.esMilitar,
        callCount: lead.callCount || 0,
        lastCallDate: lead.lastCallDate,
        valor: lead.valor,
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested",
        vapiCallId: callResult.callId
      });
      
      console.log("Webhook ejecutado para llamada saliente con teléfono:", phoneNumber);
      toast.success(`Llamada VAPI iniciada para ${lead.nombre}`);
      
      // Continue with the call process
      await handleStartCall();
      
    } catch (error) {
      console.error("Error al iniciar llamada VAPI:", error);
      toast.error("Error al iniciar la llamada saliente");
    }
  };

  return (
    <div className="flex mt-4 space-x-3">
      {!isCallActive ? (
        <Button 
          onClick={handleCall} 
          disabled={!selectedLead}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Phone className="mr-2 h-4 w-4" />
          Iniciar Llamada
        </Button>
      ) : (
        <Button 
          onClick={handleEndCall}
          variant="destructive"
          className="w-full"
        >
          <PhoneOff className="mr-2 h-4 w-4" />
          Finalizar Llamada
        </Button>
      )}
    </div>
  );
};

export default CallButtons;
