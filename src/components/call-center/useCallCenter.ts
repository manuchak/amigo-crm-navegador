
import { useActiveCall } from './hooks/useActiveCall';
import { useCallHistory } from './hooks/useCallHistory';
import { CallRecord } from './types';
import { executeWebhook } from './utils/webhook';
import { toast } from 'sonner';

export interface UseCallCenterProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string }[];
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}

export const useCallCenter = ({ leads, onUpdateLeadStatus }: UseCallCenterProps) => {
  const { callsForToday, addCallRecord } = useCallHistory();
  
  const {
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
  } = useActiveCall({ leads, onUpdateLeadStatus });

  const handleEndCall = () => {
    if (!callResult) {
      toast.error("Por favor selecciona un resultado para la llamada");
      return;
    }
    
    if (!lead) {
      toast.error("Lead no encontrado");
      setIsCallActive(false);
      return;
    }
    
    setIsCallActive(false);
    
    // Detener el temporizador
    if ((window as any).callTimer) {
      clearInterval((window as any).callTimer);
      (window as any).callTimer = null;
    }
    
    // Actualizar el estado del lead si fue contactado
    if (callResult === "Contactado") {
      onUpdateLeadStatus(selectedLead!, "Contactado");
    }
    
    // Guardar registro de llamada
    const fechaActual = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const newCall: CallRecord = {
      id: Date.now(),
      leadId: selectedLead!,
      nombreLead: lead?.nombre || "",
      fechaLlamada: fechaActual,
      horaLlamada: horaActual,
      duracion: callDuration,
      resultado: callResult as CallRecord["resultado"],
      notas: notes
    };
    
    addCallRecord(newCall);
    
    // Execute webhook for call ended
    try {
      executeWebhook({
        leadName: lead?.nombre,
        leadId: selectedLead,
        timestamp: new Date().toISOString(),
        action: "call_ended",
        result: callResult,
        duration: callDuration
      });
    } catch (error) {
      console.error("Error executing webhook:", error);
    }
    
    // Resetear campos
    resetCallState();
    
    toast.success("Llamada registrada con éxito");
  };

  return {
    selectedLead,
    setSelectedLead,
    callResult,
    setCallResult,
    notes,
    setNotes,
    callDuration,
    callsForToday,
    isCallActive,
    handleStartCall,
    handleEndCall
  };
};
