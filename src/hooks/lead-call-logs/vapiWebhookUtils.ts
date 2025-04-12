
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
    const webhookUrl = getVapiWebhookUrl();
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        call_id: callId,
        manual_trigger: true
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error triggering manual webhook:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export the webhook utilities for use in components
 */
export const vapiWebhookUtils = {
  getVapiWebhookUrl,
  registerVapiWebhook,
  triggerManualWebhookProcessing
};
