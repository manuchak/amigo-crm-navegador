
interface ContactInfo {
  email: string;
  telefono: string;
}

interface Calificaciones {
  esArmado: boolean;
  tieneVehiculo: boolean;
}

interface LeadData {
  id: number;
  nombre: string;
  empresa: string;
  contacto: ContactInfo;
  calificaciones: Calificaciones;
}

interface WebhookData {
  leadData?: LeadData;
  leadName?: string;
  leadId?: number;
  empresa?: string;
  email?: string;
  telefono?: string;
  estado?: string;
  fechaCreacion?: string;
  timestamp: string;
  action: string;
  result?: string;
  duration?: string;
  contactInfo?: string;
  modeloVehiculo?: string;
  anoVehiculo?: string;
  tieneVehiculo?: string;
  experienciaSeguridad?: string;
  credencialSedena?: string;
  esArmado?: string;
}

export const executeWebhook = async (data: WebhookData) => {
  const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
  
  console.log("Enviando datos al webhook:", JSON.stringify(data, null, 2));
  
  return fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "no-cors",
    body: JSON.stringify(data),
  });
};
