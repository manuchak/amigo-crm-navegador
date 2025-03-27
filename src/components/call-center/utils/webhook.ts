interface WebhookData {
  [key: string]: any; // Allow for any key-value pairs to support flat structure
}

export const executeWebhook = async (data: WebhookData) => {
  const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
  
  // Extract phone number if present and create a separate phone object
  let phoneObject = {};
  if (data.telefono) {
    phoneObject = { phone: data.telefono };
    // Remove phone from original data to avoid duplication
    delete data.telefono;
  }
  
  // Only send the minimal required data
  console.log("Phone object:", phoneObject);
  
  // If we want to keep other data as a separate array, transform it
  const jsonTransformado = Object.values(data);
  
  return fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "no-cors",
    // Only send the phone as a separate object if we have a phone number
    body: Object.keys(phoneObject).length > 0 
      ? JSON.stringify(phoneObject)
      : JSON.stringify(data),
  });
};
