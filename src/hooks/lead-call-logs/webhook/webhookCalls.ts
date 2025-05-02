
import { supabase } from "@/integrations/supabase/client";

/**
 * Functions for initiating VAPI calls
 */
export const webhookCalls = {
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
      
      // Also send the data to the Make.com webhook
      try {
        const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
        
        // Get full lead data to send to webhook
        const { data: leadData } = await supabase
          .from("leads")
          .select("*")
          .eq("id", leadId)
          .single();
        
        // Send webhook with lead data and call information
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: "vapi_call_initiated",
            timestamp: new Date().toISOString(),
            vapi_call_id: data.callId,
            phone_number: phoneNumber,
            lead: leadData || {
              id: leadId,
              nombre: leadName
            }
          })
        });
        
        console.log("Make.com webhook notification sent");
      } catch (webhookError) {
        // Log webhook error but don't fail the call if webhook fails
        console.error("Error sending to Make.com webhook:", webhookError);
      }
      
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
  }
};
