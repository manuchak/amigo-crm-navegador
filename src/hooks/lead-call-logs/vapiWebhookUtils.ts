
import { supabase } from "@/integrations/supabase/client";

/**
 * Get the webhook URL for the VAPI integration
 * @returns The webhook URL for the VAPI integration
 */
export function getVapiWebhookUrl(): string {
  // Construct the webhook URL from the Supabase project ID
  const projectId = "beefjsdgrdeiymzxwxru";
  return `https://${projectId}.supabase.co/functions/v1/vapi-webhook`;
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
 * @param callId The VAPI call ID to process
 */
export async function triggerManualWebhookProcessing(callId: string): Promise<{success: boolean, data?: any, error?: string}> {
  try {
    // Construct a payload with the call ID
    const payload = {
      call_id: callId,
      manual_trigger: true,
      timestamp: new Date().toISOString()
    };
    
    console.log("Triggering manual webhook processing for call ID:", callId);
    
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
 */
export async function testWebhookConnection(): Promise<{success: boolean, message: string}> {
  try {
    console.log("Testing webhook connection...");
    
    // Send a test connection request to the webhook
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
  } catch (error: any) {
    console.error("Error testing webhook connection:", error);
    return { 
      success: false, 
      message: error.message || "Connection test failed" 
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
  testWebhookConnection
};
