
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { executeWebhook } from '../utils/webhook';
import { incrementCallCount } from '@/services/leadService';
import { supabase } from '@/integrations/supabase/client';

interface UseActiveCallProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string; callCount?: number; lastCallDate?: string; telefono?: string }[];
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}

export const useActiveCall = ({ leads, onUpdateLeadStatus }: UseActiveCallProps) => {
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [callResult, setCallResult] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [callDuration, setCallDuration] = useState('00:00');
  const [isCallActive, setIsCallActive] = useState(false);
  const [vapiCallId, setVapiCallId] = useState<string | null>(null);

  // Listen for lead selection from the leads tab
  useEffect(() => {
    const handleSelectLead = (event: CustomEvent) => {
      setSelectedLead(event.detail);
    };

    window.addEventListener('selectLeadForCall', handleSelectLead as EventListener);

    return () => {
      window.removeEventListener('selectLeadForCall', handleSelectLead as EventListener);
    };
  }, []);

  // This ensures the selected lead is always valid
  useEffect(() => {
    if (selectedLead && !leads.some(l => l.id === selectedLead)) {
      setSelectedLead(null);
    }
  }, [leads, selectedLead]);

  const lead = leads.find(l => l.id === selectedLead);

  // Helper to initiate a VAPI call
  const initiateVapiCall = async (phoneNumber: string) => {
    try {
      // Call the VAPI API through our edge function
      const { data, error } = await supabase.functions.invoke('initiate-vapi-call', {
        body: { 
          phoneNumber: phoneNumber,
          leadName: lead?.nombre || 'Cliente',
          leadId: lead?.id || 0
        }
      });
      
      if (error) {
        throw new Error(`Error al iniciar llamada VAPI: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.message || 'Error desconocido al iniciar la llamada');
      }
      
      console.log('VAPI call initiated:', data);
      setVapiCallId(data.callId);
      
      return data.callId;
    } catch (err) {
      console.error('Failed to initiate VAPI call:', err);
      toast.error('No se pudo iniciar la llamada automática. Se continuará con llamada manual.');
      return null;
    }
  };

  const handleStartCall = async () => {
    if (!selectedLead) {
      toast.error("Por favor selecciona un lead para llamar");
      return;
    }
    
    if (!lead) {
      toast.error("Lead no encontrado");
      setSelectedLead(null);
      return;
    }
    
    setIsCallActive(true);
    toast.success(`Iniciando llamada a ${lead?.nombre}`);
    
    // Extract phone number from lead
    let phoneNumber = lead.telefono;
    if (!phoneNumber && lead.contacto) {
      // Try to extract from contacto field which might be in format "email | phone"
      const parts = lead.contacto.split('|');
      if (parts.length > 1) {
        phoneNumber = parts[1].trim();
      }
    }
    
    // If we have a phone number, try to initiate a VAPI call
    if (phoneNumber) {
      await initiateVapiCall(phoneNumber);
    }
    
    // Iniciar un temporizador para la duración de la llamada
    let seconds = 0;
    const timer = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      setCallDuration(`${mins}:${secs}`);
    }, 1000);
    
    // Guardamos el timer en un atributo para limpiarlo después
    (window as any).callTimer = timer;
    
    // Increment call count in Supabase
    try {
      await incrementCallCount(selectedLead);
    } catch (error) {
      console.error("Error incrementing call count:", error);
    }
    
    // Execute webhook
    try {
      await executeWebhook({
        leadName: lead?.nombre,
        leadId: selectedLead,
        timestamp: new Date().toISOString(),
        action: "call_started",
        vapiCallId: vapiCallId
      });
      
      console.log("Webhook executed successfully");
    } catch (error) {
      console.error("Error executing webhook:", error);
    }
  };

  const resetCallState = () => {
    setCallResult('');
    setNotes('');
    setCallDuration('00:00');
    setVapiCallId(null);
  };

  return {
    selectedLead,
    setSelectedLead,
    callResult,
    setCallResult,
    notes,
    setNotes,
    callDuration,
    isCallActive,
    setIsCallActive,
    lead,
    handleStartCall,
    resetCallState,
    vapiCallId
  };
};
