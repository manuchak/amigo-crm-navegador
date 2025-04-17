import { supabase } from "@/integrations/supabase/client";

/**
 * Get the webhook URL for the VAPI integration
 * @param includeApiKey Whether to include the API key in the URL (for external services)
 * @returns The webhook URL for the VAPI integration
 */
export function getVapiWebhookUrl(includeApiKey: boolean = false): string {
  // Construct the webhook URL from the Supabase project ID
  const projectId = "beefjsdgrdeiymzxwxru";
  const baseUrl = `https://${projectId}.supabase.co/functions/v1/vapi-webhook`;
  
  if (includeApiKey) {
    // Get the anon key from the supabase client
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w";
    return `${baseUrl}?apikey=${anonKey}`;
  }
  
  return baseUrl;
}

/**
 * Register a webhook URL with the VAPI service
 * This would typically be done through the VAPI dashboard or API
 * @param webhookUrl The webhook URL to register
 */
export async function registerVapiWebhook(webhookUrl: string): Promise<boolean> {
  try {
    // This is a placeholder - actual implementation would depend on VAPI's API
    console.log(`To register webhook with VAPI, use this URL: ${webhookUrl}`);
    console.log("This URL should be configured in your VAPI dashboard or via their API");
    
    // Store the webhook configuration in Supabase for reference
    const { error } = await supabase
      .from("secrets")
      .upsert({
        name: "VAPI_WEBHOOK_URL",
        value: webhookUrl,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Failed to store webhook URL:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error registering webhook:", error);
    return false;
  }
}

/**
 * Trigger a manual webhook call to process a specific VAPI call
 * @param callId The VAPI call ID to process (can be empty for testing)
 * @param useApiKey Whether to include the API key in the request
 */
export async function triggerManualWebhookProcessing(callId: string, useApiKey: boolean = true): Promise<{success: boolean, data?: any, error?: string}> {
  try {
    // Construct a payload with the call ID (if provided)
    const payload = {
      manual_trigger: true,
      timestamp: new Date().toISOString()
    };
    
    // Only add call_id if it's not empty
    if (callId.trim()) {
      Object.assign(payload, { call_id: callId });
    }
    
    console.log(`Triggering manual webhook processing${callId ? ` for call ID: ${callId}` : ' without call ID'}`);
    
    if (useApiKey) {
      // Call the edge function directly via supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke("vapi-webhook", {
        body: payload
      });
      
      if (error) {
        console.error("Error invoking webhook function:", error);
        return {
          success: false,
          error: error.message || "Failed to process call"
        };
      }
      
      console.log("Webhook response:", data);
      return {
        success: true,
        data: data
      };
    } else {
      // Call without API key directly via fetch
      const projectId = "beefjsdgrdeiymzxwxru";
      const webhookUrl = `https://${projectId}.supabase.co/functions/v1/vapi-webhook`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook server responded with ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    }
  } catch (error: any) {
    console.error("Error triggering manual webhook:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    };
  }
}

/**
 * Test the webhook connection by sending a simple ping
 * @param useApiKey Whether to include the API key in the request
 */
export async function testWebhookConnection(useApiKey: boolean = true): Promise<{success: boolean, message: string}> {
  try {
    console.log("Testing webhook connection with apiKey:", useApiKey);
    
    if (useApiKey) {
      // Using supabase client (includes API key in headers)
      const { data, error } = await supabase.functions.invoke("vapi-webhook", {
        body: { call_id: "test-connection" }
      });
      
      if (error) {
        console.error("Webhook connection test failed:", error);
        return { 
          success: false, 
          message: error.message || "Connection test failed" 
        };
      }
      
      console.log("Webhook connection test result:", data);
      return { 
        success: true, 
        message: "Webhook connection successful" 
      };
    } else {
      // Using direct fetch without API key
      const projectId = "beefjsdgrdeiymzxwxru";
      const webhookUrl = `https://${projectId}.supabase.co/functions/v1/vapi-webhook`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ call_id: "test-connection" })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        return { 
          success: false, 
          message: `Server responded with ${response.status}: ${errorText}` 
        };
      }
      
      const data = await response.json();
      return { 
        success: true, 
        message: "Webhook connection successful without API key" 
      };
    }
  } catch (error: any) {
    console.error("Error testing webhook connection:", error);
    return { 
      success: false, 
      message: error.message || "Connection test failed" 
    };
  }
}

/**
 * Send test lead data to the webhook endpoint
 * This is used to verify that the edge function is correctly saving data
 * to the validated leads table
 * @param useApiKey Whether to include the API key in the request
 */
export async function sendTestLeadData(useApiKey: boolean = true): Promise<{success: boolean, data?: any, error?: string}> {
  try {
    console.log("Sending test lead data to webhook");
    
    // Create a sample lead record with complete data
    const sampleData = {
      lead_id: 999, // Use a test lead ID that won't conflict with real data
      leadId: 999,  // Include both formats to test both cases
      phone_number: "+5215512345678",
      customer_number: "+5215512345678",
      transcript: [
        { role: "assistant", content: "Hello, is this Juan Pérez? I'm calling from Custodios about your job application." },
        { role: "user", content: "Yes, this is Juan. I'm interested in the security position." },
        { role: "assistant", content: "Great! Do you have any security experience?" },
        { role: "user", content: "Yes, I worked for 2 years as a security guard at a hotel." },
        { role: "assistant", content: "Do you have your own vehicle? What make and model?" },
        { role: "user", content: "Yes, I drive a 2018 Toyota Corolla." },
        { role: "assistant", content: "Do you have a SEDENA credential?" },
        { role: "user", content: "Yes, I have my SEDENA ID and all required documentation." }
      ],
      call_id: `test-${Date.now()}`,
      test_data: true,
      timestamp: new Date().toISOString()
    };
    
    if (useApiKey) {
      // Call the edge function directly via supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke("vapi-webhook", {
        body: sampleData
      });
      
      if (error) {
        console.error("Error invoking webhook function with test data:", error);
        return {
          success: false,
          error: error.message || "Failed to process test data"
        };
      }
      
      console.log("Webhook response to test data:", data);
      return {
        success: true,
        data: data
      };
    } else {
      // Call without API key directly via fetch
      const projectId = "beefjsdgrdeiymzxwxru";
      const webhookUrl = `https://${projectId}.supabase.co/functions/v1/vapi-webhook`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sampleData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook server responded with ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    }
  } catch (error: any) {
    console.error("Error sending test data:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    };
  }
}

/**
 * Export the webhook utilities for use in components
 */
export const vapiWebhookUtils = {
  getVapiWebhookUrl,
  registerVapiWebhook,
  triggerManualWebhookProcessing,
  testWebhookConnection,
  sendTestLeadData
};
