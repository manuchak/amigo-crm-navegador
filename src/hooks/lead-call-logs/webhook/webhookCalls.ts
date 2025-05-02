
import { supabase } from "@/integrations/supabase/client";

/**
 * Functions for initiating VAPI calls
 */
export const webhookCalls = {
  /**
   * Initiate a call through the Make.com webhook
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

      console.log(`Initiating call to ${phoneNumber} for lead ${leadName} (ID: ${leadId})`);
      
      // Format phone number to ensure it's valid (remove spaces, add country code if needed)
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+52' + formattedPhone.replace(/^0+/, '');
      }
      formattedPhone = formattedPhone.replace(/\s+/g, '');
      
      // Send webhook to Make.com directly
      const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl";
      
      console.log(`Sending webhook to Make.com for phone number ${formattedPhone}`);
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          lead_name: leadName,
          lead_id: leadId,
          timestamp: new Date().toISOString(),
          action: "initiate_call"
        })
      });
      
      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        throw new Error(`Make.com webhook error: ${webhookResponse.status} - ${errorText}`);
      }
      
      console.log("Make.com webhook response:", await webhookResponse.text());
      
      // If success, return positive result
      return {
        success: true,
        callId: `make-${Date.now()}`,
        message: "Call requested successfully via Make.com"
      };
    } catch (error: any) {
      console.error("Error initiating call via webhook:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred"
      };
    }
  }
};
