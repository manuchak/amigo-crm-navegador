
interface WebhookData {
  [key: string]: any; // Allow for any key-value pairs to support flat structure
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
