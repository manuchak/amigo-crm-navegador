
import { supabase } from "@/integrations/supabase/client";

/**
 * Functions for sending test data to the webhook
 */
export const webhookTestData = {
  /**
   * Send test lead data to the webhook endpoint
   * This is used to verify that the edge function is correctly saving data
   * to the validated leads table
   * @param useApiKey Whether to include the API key in the request
   */
  async sendTestLeadData(useApiKey: boolean = true): Promise<{success: boolean, data?: any, error?: string}> {
    try {
      console.log("Sending test lead data to webhook");
      
      // Create a sample lead record with complete data that matches what VAPI would send
      // This test data is designed to be recognized and processed by the webhook handler
      const sampleData = {
        lead_id: 999, // Use a test lead ID that won't conflict with real data
        leadId: 999,  // Include both formats to test both cases
        phone_number: "+5215512345678",
        customer_number: "+5215512345678",
        car_brand: "Toyota", // Add direct vehicle information for testing
        car_model: "Corolla",
        car_year: 2018,
        security_exp: true, // Add direct qualification information
        sedena_id: true,
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
        timestamp: new Date().toISOString(),
        custodio_name: "Juan Pérez Test" // Add a test name
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
        
        // After successful request, check if data was saved in validated_leads
        try {
          const { data: validatedLead, error: fetchError } = await supabase
            .from("validated_leads")
            .select("*")
            .eq("id", 999)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Error fetching validated lead:", fetchError);
          } else {
            console.log("Validated lead record:", validatedLead);
            // Include this data in the response
            data.saved_record = validatedLead;
          }
        } catch (checkError) {
          console.error("Error checking if data was saved:", checkError);
        }
        
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
};
