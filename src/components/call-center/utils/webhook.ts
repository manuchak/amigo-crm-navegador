
interface WebhookData {
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
}

export const executeWebhook = async (data: WebhookData) => {
  const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
  
  console.log("Sending data to webhook:", JSON.stringify(data, null, 2));
  
  return fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "no-cors",
    body: JSON.stringify(data),
  });
};
