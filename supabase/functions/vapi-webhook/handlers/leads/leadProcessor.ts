import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { processLeadValidation } from "../validation/leadValidation.ts";

interface CallLogData {
  id: string;
  log_id: string;
  customer_number?: string;
  caller_phone_number?: string;
  phone_number?: string;
}

/**
 * Update lead record with call data from webhook
 */
export async function updateLeadWithCallData(
  webhookData: any, 
  callLogData: CallLogData, 
  supabase: SupabaseClient
): Promise<void> {
  try {
    // Only proceed if we have call data to work with
    if (!callLogData || !callLogData.log_id) {
      console.log("No call log data available to update lead");
      return;
    }

    console.log(`Processing lead data for call ${callLogData.log_id}`);
    
    // Determine the phone number to use for lead lookup
    const phoneNumber = callLogData.customer_number || 
                        callLogData.caller_phone_number || 
                        callLogData.phone_number ||
                        webhookData.customer_number ||
                        webhookData.caller_phone_number ||
                        webhookData.phone_number;
    
    if (!phoneNumber) {
      console.log("No phone number found to match with lead");
      return;
    }
    
    // Format phone number by keeping only digits (simple normalization)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const lastTenDigits = formattedPhone.slice(-10);
    
    // Try to find a matching lead by phone number
    const { data: matchingLeads, error: searchError } = await supabase
      .from("leads")
      .select("*")
      .or(`telefono.ilike.%${lastTenDigits}`)
      .limit(1);
      
    if (searchError) {
      console.error("Error searching for lead by phone:", searchError);
      return;
    }
    
    // If no lead found, log and exit
    if (!matchingLeads || matchingLeads.length === 0) {
      console.log(`No matching lead found for phone: ${phoneNumber}`);
      return;
    }
    
    const lead = matchingLeads[0];
    console.log(`Found matching lead: ${lead.id} - ${lead.nombre}`);
    
    // Update the lead with call information
    const { error: updateError } = await supabase
      .from("leads")
      .update({ 
        last_call_id: callLogData.log_id,
        last_call_date: new Date().toISOString(),
        call_count: (lead.call_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", lead.id);
      
    if (updateError) {
      console.error("Error updating lead with call data:", updateError);
    } else {
      console.log(`Successfully updated lead ${lead.id} with call data`);
    }
    
    // Process lead validation if we have transcript data
    if (webhookData.transcript) {
      try {
        await processLeadValidation(webhookData, callLogData, supabase);
      } catch (validationError) {
        console.error("Error in lead validation processing:", validationError);
      }
    }
  } catch (error) {
    console.error("Error updating lead with call data:", error);
    // Don't throw the error to prevent it from stopping the webhook process
  }
}
