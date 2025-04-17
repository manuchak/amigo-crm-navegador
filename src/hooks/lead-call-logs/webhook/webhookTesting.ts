
import { supabase } from "@/integrations/supabase/client";

/**
 * Functions for testing webhook connections
 */
export const webhookTesting = {
  /**
   * Test the webhook connection by sending a simple ping
   * @param useApiKey Whether to include the API key in the request
   */
  async testWebhookConnection(useApiKey: boolean = true): Promise<{success: boolean, message: string}> {
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
};
