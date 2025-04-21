
import { supabase } from "@/integrations/supabase/client";

/**
 * Functions for generating and sending test webhook data
 */
export const webhookTestData = {
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
  }
};
