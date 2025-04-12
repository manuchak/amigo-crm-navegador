
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
    
    // You might store the webhook configuration in Supabase for reference
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
      manual_trigger: true
    };
    
    // First try to invoke the function via Supabase client
    try {
      const { data, error } = await supabase.functions.invoke("vapi-webhook", {
        body: payload
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (invokeError) {
      console.log("Could not invoke function directly, trying with fetch:", invokeError);
      
      // Fallback to direct fetch if invoke doesn't work (e.g., in dev environment)
      const webhookUrl = getVapiWebhookUrl();
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse the response as text first to handle potential JSON parse errors
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { message: responseText };
      }
      
      return {
        success: true,
        data: responseData
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
 */
export async function testWebhookConnection(): Promise<{success: boolean, message: string}> {
  try {
    const result = await triggerManualWebhookProcessing("test-connection");
    if (result.success) {
      return { success: true, message: "Webhook connection successful" };
    } else {
      return { success: false, message: result.error || "Unknown error" };
    }
  } catch (error: any) {
    return { success: false, message: error.message || "Connection test failed" };
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
