
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

// New function to receive webhook data from external sources
export const createWebhookReceiver = (endpoint: string) => {
  // This simulates a webhook endpoint that would normally be on a server
  // For client-side implementation, we will use a polling mechanism
  
  const fetchDataFromEndpoint = async () => {
    try {
      // First try with direct fetch (might be blocked by CORS)
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      // Parse response text - handle case when response is not JSON
      const text = await response.text();
      try {
        // Try to parse as JSON first
        return JSON.parse(text);
      } catch (e) {
        // If not JSON, return the text itself
        console.log("Response is not JSON:", text);
        return { message: text, status: response.status };
      }
    } catch (error) {
      console.error("Error fetching from webhook endpoint:", error);
      throw error;
    }
  };
  
  // Return the function for fetching data
  return fetchDataFromEndpoint;
};

// New function specifically for fetching leads data from external database
export const LEADS_WEBHOOK_URL = "https://hook.us2.make.com/3p8dr9wka8n5b84qo9wy1yplcbfjkr2e";

export const fetchLeadsFromExternalDatabase = async () => {
  try {
    console.log("Fetching leads data from external database...");
    const response = await fetch(LEADS_WEBHOOK_URL, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    // Parse response text - handle case when response is not JSON
    const text = await response.text();
    try {
      // Try to parse as JSON first
      return JSON.parse(text);
    } catch (e) {
      // If not JSON, return the text itself
      console.log("Response is not JSON:", text);
      return { message: text, status: response.status };
    }
  } catch (error) {
    console.error("Error fetching leads from external database:", error);
    throw error;
  }
};
