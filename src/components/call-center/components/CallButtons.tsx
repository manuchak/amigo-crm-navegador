
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
      toast.error("Selecciona un lead para llamar");
      return;
    }

    // Get the selected lead data
    const lead = leads.find(l => l.id === selectedLead);
    if (!lead) {
      toast.error("Lead no encontrado");
      return;
    }

    // Send data to webhook before starting the call
    try {
      await executeWebhook({
        leadName: lead.nombre,
        leadId: selectedLead,
        timestamp: new Date().toISOString(),
        action: "outbound_call_requested"
      });
      
      console.log("Webhook executed for outbound call");
      toast.success(`Llamada saliente solicitada para ${lead.nombre}`);
    } catch (error) {
      console.error("Error executing webhook:", error);
      toast.error("Error al solicitar la llamada saliente");
    }

    // Continue with the normal call start process
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
