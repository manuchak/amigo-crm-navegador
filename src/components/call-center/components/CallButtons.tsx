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

    const lead = leads.find(l => l.id === selectedLead);
    if (!lead) {
      toast.error("Custodio no encontrado");
      return;
    }

    // Extract only the phone number information
    const contactInfo = lead.contacto.split(' | ');
    const phoneNumber = contactInfo[1] || '';
    
    try {
      // Send only the phone number to the webhook
      await executeWebhook({
        telefono: phoneNumber,
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested"
      });
      
      console.log("Webhook ejecutado para llamada saliente");
      toast.success(`Llamada saliente iniciada para ${lead.nombre}`);
      
      // Continue with the call process
      await handleStartCall();
      
    } catch (error) {
      console.error("Error al ejecutar webhook:", error);
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
