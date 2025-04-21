
import { supabase } from "@/integrations/supabase/client";

/**
 * Functions for processing webhook data
 */
export const webhookProcessing = {
  /**
   * Trigger a manual webhook call to process a specific VAPI call
   * @param callId The VAPI call ID to process (can be empty for testing)
   * @param useApiKey Whether to include the API key in the request
   */
  async triggerManualWebhookProcessing(callId: string, useApiKey: boolean = true): Promise<{success: boolean, data?: any, error?: string}> {
    try {
      // Construct a payload with the call ID (if provided)
      const payload: any = {
        manual_trigger: true,
        timestamp: new Date().toISOString()
      };
      
      // Only add call_id if it's not empty
      if (callId.trim()) {
        payload.call_id = callId;
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
  },

  /**
   * Process a webhook with lead data directly
   * @param leadId The lead ID to associate with the validation
   * @param data The validation data
   */
  async processLeadValidation(leadId: number | string, data: any): Promise<{success: boolean, data?: any, error?: string}> {
    try {
      console.log(`Processing lead validation for lead ID: ${leadId}`);
      
      const payload = {
        leadId, 
        ...data,
        timestamp: new Date().toISOString()
      };
      
      const { data: responseData, error } = await supabase.functions.invoke("vapi-webhook", {
        body: payload
      });
      
      if (error) {
        console.error("Error invoking webhook function:", error);
        return {
          success: false,
          error: error.message || "Failed to process lead validation"
        };
      }
      
      console.log("Webhook response:", responseData);
      return {
        success: true,
        data: responseData
      };
    } catch (error: any) {
      console.error("Error processing lead validation:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred"
      };
    }
  }
};
