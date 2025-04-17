
import { supabase } from "@/integrations/supabase/client";

/**
 * Functions for handling webhook URLs
 */
export const webhookUrls = {
  /**
   * Get the webhook URL for the VAPI integration
   * @param includeApiKey Whether to include the API key in the URL (for external services)
   * @returns The webhook URL for the VAPI integration
   */
  getVapiWebhookUrl(includeApiKey: boolean = false): string {
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
};
