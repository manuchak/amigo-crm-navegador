
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
  
  // Create a bundle structure first
  const jsonBundle = { 
    bundle: data,
    // Add the phone number as a separate object in the JSON
    ...phoneObject
  };
  
  // Transform the JSON as requested
  const jsonTransformado = Object.values(jsonBundle.bundle);
  
  console.log("JSON original:", JSON.stringify(data, null, 2));
  console.log("JSON transformado con teléfono separado:", JSON.stringify(jsonBundle, null, 2));
  
  return fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "no-cors",
    // Send the transformed data with the phone as a separate object
    body: JSON.stringify({
      data: jsonTransformado,
      ...phoneObject
    }),
  });
};
