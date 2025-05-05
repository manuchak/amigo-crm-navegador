
import { supabase } from "@/integrations/supabase/client";
import { webhookUrls } from "./webhookUrls";

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
      const webhookUrl = webhookUrls.LEADS_WEBHOOK_URL;
      
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
  },
  
  /**
   * Initiate a batch call through the Make.com batch webhook
   * @param leads Array of lead objects to call
   * @param batchType 'progressive' or 'predictive'
   * @returns Promise with the call result
   */
  async initiateBatchCall(leads: any[], batchType: 'progressive' | 'predictive'): Promise<{
    success: boolean,
    message?: string,
    error?: string
  }> {
    try {
      if (!leads || leads.length === 0) {
        throw new Error("At least one lead is required");
      }

      console.log(`Initiating ${batchType} batch call for ${leads.length} leads`);
      
      // Send webhook to Make.com batch endpoint
      const webhookUrl = webhookUrls.BATCH_WEBHOOK_URL;
      
      console.log(`Sending ${leads.length} leads to batch webhook`);
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leads: leads,
          batch_type: batchType,
          timestamp: new Date().toISOString(),
          action: `batch_call_${batchType}`,
          total_leads: leads.length
        })
      });
      
      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        throw new Error(`Make.com batch webhook error: ${webhookResponse.status} - ${errorText}`);
      }
      
      console.log("Make.com batch webhook response:", await webhookResponse.text());
      
      // If success, return positive result
      return {
        success: true,
        message: `Batch ${batchType} call requested successfully for ${leads.length} leads`
      };
    } catch (error: any) {
      console.error("Error initiating batch call via webhook:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred"
      };
    }
  }
};
