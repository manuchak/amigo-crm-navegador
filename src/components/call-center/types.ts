
export interface CallRecord {
  id: number;
  leadId: number;
  nombreLead: string;
  fechaLlamada: string;
  horaLlamada: string;
  duracion: string;
  resultado: "Contactado" | "No contestó" | "Buzón de voz" | "Número equivocado" | "Programada";
  notas: string;
}

export interface CallCenterProps {
  leads: any[]; // This will be populated via context
  onUpdateLeadStatus: (leadId: number, newStatus: string) => void;
}
