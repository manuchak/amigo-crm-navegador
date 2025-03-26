import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CallRecord } from './types';

export interface UseCallCenterProps {
  leads: { id: number; nombre: string; empresa: string; contacto: string; estado: string; fechaCreacion: string }[];
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}

export const useCallCenter = ({ leads, onUpdateLeadStatus }: UseCallCenterProps) => {
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [callResult, setCallResult] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [callDuration, setCallDuration] = useState('00:00');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callsForToday, setCallsForToday] = useState<CallRecord[]>([]);

  // Load call history from localStorage on mount
  useEffect(() => {
    const savedCalls = localStorage.getItem('callHistory');
    if (savedCalls) {
      setCallsForToday(JSON.parse(savedCalls));
    } else {
      // Default call records for demo if none exist
      const defaultCalls: CallRecord[] = [
        { 
          id: 1, 
          leadId: 1, 
          nombreLead: "Carlos Rodríguez", 
          fechaLlamada: "2023-10-15", 
          horaLlamada: "10:30", 
          duracion: "02:45", 
          resultado: "Contactado", 
          notas: "Cliente interesado en el servicio premium" 
        },
        {
          id: 2,
          leadId: 2,
          nombreLead: "María García",
          fechaLlamada: "2023-10-15",
          horaLlamada: "11:15",
          duracion: "01:30",
          resultado: "No contestó",
          notas: "Intentar llamar nuevamente mañana"
        },
      ];
      setCallsForToday(defaultCalls);
      localStorage.setItem('callHistory', JSON.stringify(defaultCalls));
    }
  }, []);

  // Save call history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('callHistory', JSON.stringify(callsForToday));
  }, [callsForToday]);

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
      const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
      
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          leadName: lead?.nombre,
          leadId: selectedLead,
          timestamp: new Date().toISOString(),
          action: "call_started"
        }),
      });
      
      console.log("Webhook executed successfully");
    } catch (error) {
      console.error("Error executing webhook:", error);
    }
  };

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
    
    setCallsForToday([newCall, ...callsForToday]);
    
    // Execute webhook for call ended
    try {
      const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
      
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          leadName: lead?.nombre,
          leadId: selectedLead,
          timestamp: new Date().toISOString(),
          action: "call_ended",
          result: callResult,
          duration: callDuration
        }),
      });
    } catch (error) {
      console.error("Error executing webhook:", error);
    }
    
    // Resetear campos
    setCallResult('');
    setNotes('');
    setCallDuration('00:00');
    
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
