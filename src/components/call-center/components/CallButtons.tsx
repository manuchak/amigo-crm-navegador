
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
      
      // Send webhook directly to Make.com with all relevant data
      const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
      
      // Format phone number to ensure it's valid (remove spaces, add country code if needed)
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+52' + formattedPhone.replace(/^0+/, '');
      }
      formattedPhone = formattedPhone.replace(/\s+/g, '');
      
      console.log(`Sending direct webhook to Make.com for phone ${formattedPhone}`);
      
      const makeResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          lead_name: lead.nombre || 'Cliente', 
          lead_id: lead.id,
          lead_data: lead,
          timestamp: new Date().toISOString(),
          action: "initiate_outbound_call"
        })
      });
      
      if (!makeResponse.ok) {
        const errorText = await makeResponse.text();
        throw new Error(`Make.com webhook error: ${makeResponse.status} - ${errorText}`);
      }
      
      console.log("Make.com webhook called successfully");
      toast.success(`Llamada iniciada para ${lead.nombre}`);
      
      // Continue with the call process
      await handleStartCall();
      
    } catch (error) {
      console.error("Error al iniciar llamada:", error);
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
