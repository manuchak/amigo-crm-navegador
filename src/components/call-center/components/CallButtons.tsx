
import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { executeWebhook } from '../utils/webhook';
import { useLeads } from '@/context/LeadsContext';
import { toast } from 'sonner';

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
  const { leads } = useLeads();
  
  const handleCall = async () => {
    if (!selectedLead) {
      toast.error("Selecciona un custodio para llamar");
      return;
    }

    // Obtener datos del lead seleccionado
    const lead = leads.find(l => l.id === selectedLead);
    if (!lead) {
      toast.error("Custodio no encontrado");
      return;
    }

    // Extraer información de contacto
    const contactInfo = lead.contacto.split(' | ');
    const email = contactInfo[0] || '';
    const phone = contactInfo[1] || '';

    // Enviar datos completos al webhook antes de iniciar la llamada
    try {
      await executeWebhook({
        leadName: lead.nombre,
        leadId: selectedLead,
        empresa: lead.empresa,
        email: email,
        telefono: phone,
        estado: lead.estado,
        fechaCreacion: lead.fechaCreacion,
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested",
        contactInfo: lead.contacto
      });
      
      console.log("Webhook ejecutado para llamada saliente");
      toast.success(`Llamada saliente solicitada para ${lead.nombre}`);
    } catch (error) {
      console.error("Error al ejecutar webhook:", error);
      toast.error("Error al solicitar la llamada saliente");
    }

    // Continuar con el proceso normal de inicio de llamada
    await handleStartCall();
  };

  return (
    <div className="flex mt-4 space-x-3">
      {!isCallActive ? (
        <Button 
          onClick={handleCall} 
          disabled={!selectedLead} 
          className="bg-green-500 hover:bg-green-600"
        >
          <Phone className="mr-2 h-4 w-4" />
          Iniciar Llamada
        </Button>
      ) : (
        <Button 
          onClick={handleEndCall} 
          variant="destructive"
        >
          <PhoneOff className="mr-2 h-4 w-4" />
          Finalizar Llamada
        </Button>
      )}
    </div>
  );
};

export default CallButtons;
