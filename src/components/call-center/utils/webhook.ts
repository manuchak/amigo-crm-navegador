
interface WebhookData {
  [key: string]: any; // Allow for any key-value pairs to support flat structure
}

export const executeWebhook = async (data: WebhookData) => {
  const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
  
  // Create a bundle structure first
  const jsonBundle = { bundle: data };
  
  // Transform the JSON as requested
  const jsonTransformado = Object.values(jsonBundle.bundle);
  
  console.log("JSON original:", JSON.stringify(data, null, 2));
  console.log("JSON transformado:", JSON.stringify(jsonTransformado, null, 2));
  
  return fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "no-cors",
    // Send the transformed data
    body: JSON.stringify(jsonTransformado),
  });
};
