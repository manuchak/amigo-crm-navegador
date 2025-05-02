
import { supabase } from "@/integrations/supabase/client";

// Export the webhook utilities for use in components
export const vapiWebhookUtils = {
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
  },

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
  },

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
   * Send test lead data to webhook for testing
   */
  async sendTestLeadData(useApiKey: boolean = true): Promise<{success: boolean, data?: any, error?: string}> {
    try {
      const testLeadId = 1001; // Using a test lead ID - you can change this to match a real lead ID in your database
      
      const testData = {
        leadId: testLeadId,
        car_brand: "Toyota",
        car_model: "Corolla",
        car_year: "2021",
        custodio_name: "Test Custodio",
        security_exp: "YES",
        sedena_id: "12345678",
        phone_number: "+5219981234567",
        call_id: `test-call-${Date.now()}`,
        test_data: true,
        timestamp: new Date().toISOString()
      };
      
      console.log("Sending test lead data to webhook:", testData);
      
      let response;
      if (useApiKey) {
        // Call the edge function directly via supabase.functions.invoke
        const { data, error } = await supabase.functions.invoke("vapi-webhook", {
          body: testData
        });
        
        if (error) {
          console.error("Error invoking webhook function:", error);
          return {
            success: false,
            error: error.message || "Failed to process test data"
          };
        }
        
        response = data;
      } else {
        // Call without API key directly via fetch
        const projectId = "beefjsdgrdeiymzxwxru";
        const webhookUrl = `https://${projectId}.supabase.co/functions/v1/vapi-webhook`;
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testData)
        });
        
        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          throw new Error(`Webhook server responded with ${webhookResponse.status}: ${errorText}`);
        }
        
        response = await webhookResponse.json();
      }
      
      console.log("Test data webhook response:", response);
      
      // Check if validated_leads record was created/updated
      if (response.validated_lead_id || response.saved_record) {
        // Try to fetch the record to confirm it was saved
        const { data: validatedLead, error: fetchError } = await supabase
          .from("validated_leads")
          .select("*")
          .eq("id", testLeadId)
          .maybeSingle();
          
        if (fetchError) {
          console.warn("Warning: Test data appears to have processed successfully, but could not verify record:", fetchError);
        } else if (validatedLead) {
          console.log("Test data was successfully saved to validated_leads table:", validatedLead);
          response.saved_record = validatedLead;
        } else {
          console.warn("Warning: Test data appears to have processed successfully, but no record found in validated_leads");
        }
      }
      
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      console.error("Error sending test data:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred"
      };
    }
  },

  /**
   * Initiate a VAPI call through the Supabase edge function
   * @param phoneNumber The phone number to call
   * @param leadName The name of the lead to call
   * @param leadId The ID of the lead
   * @returns Promise with the call result
   */
  async initiateVapiCall(phoneNumber: string, leadName: string, leadId: number): Promise<{
    success: boolean, 
    callId?: string, 
    message?: string,
    error?: string
  }> {
    try {
      if (!phoneNumber) {
        throw new Error("Phone number is required");
      }

      console.log(`Initiating VAPI call to ${phoneNumber} for lead ${leadName} (ID: ${leadId})`);
      
      // Call the edge function to initiate the VAPI call
      const { data, error } = await supabase.functions.invoke("initiate-vapi-call", {
        body: { 
          phoneNumber: phoneNumber,
          leadName: leadName,
          leadId: leadId
        }
      });
      
      if (error) {
        console.error("Error invoking VAPI call function:", error);
        return {
          success: false,
          error: error.message || "Failed to initiate call"
        };
      }
      
      if (!data?.success) {
        return {
          success: false,
          message: data?.message || "Unknown error occurred"
        };
      }
      
      console.log("VAPI call successfully initiated:", data);
      
      return {
        success: true,
        callId: data.callId,
        message: "VAPI call initiated successfully"
      };
    } catch (error: any) {
      console.error("Error initiating VAPI call:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred"
      };
    }
  },

  /**
   * Helper functions for processing webhook data
   * Can be expanded later as needed
   */
  parseWebhookData: (data: any): any => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      console.error('Error parsing webhook data:', e);
      return data;
    }
  }
};
