
import { useState, useEffect } from 'react';
import { CallRecord } from '../types';

export const useCallHistory = () => {
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

  const addCallRecord = (newCall: CallRecord) => {
    setCallsForToday([newCall, ...callsForToday]);
  };

  return {
    callsForToday,
    addCallRecord
  };
};
