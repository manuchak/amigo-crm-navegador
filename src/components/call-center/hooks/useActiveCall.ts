
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { executeWebhook } from '../utils/webhook';

interface UseActiveCallProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string }[];
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}

export const useActiveCall = ({ leads, onUpdateLeadStatus }: UseActiveCallProps) => {
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [callResult, setCallResult] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [callDuration, setCallDuration] = useState('00:00');
  const [isCallActive, setIsCallActive] = useState(false);

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
    
    // Execute webhook
    try {
      await executeWebhook({
        leadName: lead?.nombre,
        leadId: selectedLead,
        timestamp: new Date().toISOString(),
        action: "call_started"
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
    resetCallState
  };
};
