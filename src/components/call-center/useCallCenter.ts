
import { useState } from 'react';
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
  const [callsForToday, setCallsForToday] = useState<CallRecord[]>([
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
  ]);

  const lead = leads.find(l => l.id === selectedLead);

  const handleStartCall = async () => {
    if (!selectedLead) {
      toast.error("Por favor selecciona un lead para llamar");
      return;
    }
    
    setIsCallActive(true);
    toast.success(`Iniciando llamada a ${lead?.nombre}`);
    
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
    
    setIsCallActive(false);
    
    // Actualizar el estado del lead si fue contactado
    if (callResult === "Contactado") {
      onUpdateLeadStatus(selectedLead!, "Contactado");
    }
    
    // Guardar registro de llamada
    const fechaActual = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    const newCall: CallRecord = {
      id: callsForToday.length + 1,
      leadId: selectedLead!,
      nombreLead: lead?.nombre || "",
      fechaLlamada: fechaActual,
      horaLlamada: horaActual,
      duracion: callDuration,
      resultado: callResult as CallRecord["resultado"],
      notas: notes
    };
    
    setCallsForToday([...callsForToday, newCall]);
    
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
