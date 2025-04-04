
import { LeadData, createLeadDirectAPI } from '@/services/leadService';

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
  
  // Log the data being sent to webhook
  console.log("Sending to webhook:", { phoneObject, data });
  
  return fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "no-cors",
    // Send all lead data along with phone in a structured format
    body: JSON.stringify({
      ...phoneObject,
      lead_data: data
    }),
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

// Constants for Leads webhook
export const LEADS_WEBHOOK_URL = "https://hook.us2.make.com/3p8dr9wka8n5b84qo9wy1yplcbfjkr2e";
export const LEADS_WEBHOOK_NAME = "CustodiosCRM Leads Data";
export const LEADS_WEBHOOK_API_KEY = "cust_leads_api_43971892"; // API key for authentication

// Function to fetch leads with API key authentication
export const fetchLeadsFromExternalDatabase = async () => {
  try {
    console.log("Fetching leads data from external database...");
    const response = await fetch(`${LEADS_WEBHOOK_URL}?api_key=${LEADS_WEBHOOK_API_KEY}`, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LEADS_WEBHOOK_API_KEY}` // Also send in authorization header
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

// Helper function to create a webhook payload with API key for sending data
export const createWebhookPayloadWithAuth = (data: any) => {
  return {
    ...data,
    api_key: LEADS_WEBHOOK_API_KEY,
    timestamp: new Date().toISOString()
  };
};

// New function to handle incoming webhook data and add it to the leads table
export const processIncomingWebhookData = async (data: any) => {
  // Map the incoming webhook data to the LeadData format
  const leadData = mapWebhookDataToLeadData(data);
  
  // Use the existing createLead function to add the lead to the database
  try {
    const result = await createLeadDirectAPI(leadData);
    console.log("Lead created successfully from webhook data:", result);
    return result;
  } catch (error) {
    console.error("Error creating lead from webhook data:", error);
    throw error;
  }
};

// Helper function to map webhook data to LeadData format
function mapWebhookDataToLeadData(data: any): LeadData {
  // Default values
  const defaults = {
    nombre: 'Sin nombre',
    email: '',
    telefono: '',
    empresa: 'Custodio',
    estado: 'Nuevo',
    fuente: 'Make.com Webhook',
    fecha_creacion: new Date().toISOString(),
    tienevehiculo: 'NO',
    experienciaseguridad: 'NO',
    esmilitar: 'NO',
    credencialsedena: 'NO',
    esarmado: 'NO',
  };

  // Map the incoming data to our schema, using defaults for missing fields
  return {
    nombre: data.nombre || data.name || defaults.nombre,
    email: data.email || defaults.email,
    telefono: data.telefono || data.phone || defaults.telefono,
    empresa: data.empresa || data.company || defaults.empresa,
    estado: data.estado || data.status || defaults.estado,
    fuente: data.fuente || data.source || defaults.fuente,
    fecha_creacion: data.fecha_creacion || data.created_at || defaults.fecha_creacion,
    tienevehiculo: data.tienevehiculo || data.has_vehicle || defaults.tienevehiculo,
    experienciaseguridad: data.experienciaseguridad || data.security_experience || defaults.experienciaseguridad,
    esmilitar: data.esmilitar || data.is_military || defaults.esmilitar,
    credencialsedena: data.credencialsedena || data.sedena_credential || defaults.credencialsedena,
    esarmado: data.esarmado || data.is_armed || defaults.esarmado,
    anovehiculo: data.anovehiculo || data.vehicle_year || null,
    modelovehiculo: data.modelovehiculo || data.vehicle_model || null,
    valor: parseFloat(data.valor) || 0,
  };
}
