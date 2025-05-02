
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { DEFAULT_ASSISTANT_ID } from "../../lib/constants.ts";
import { 
  extractCallId,
  extractPhoneNumber,
  extractAssistantId,
  extractOrganizationId 
} from "../../utils/extractors.ts";

/**
 * Find an existing call log by ID
 */
export async function findExistingCallLog(callId: string | null, supabase: SupabaseClient) {
  if (!callId) return null;
  
  console.log("Querying vapi_call_logs table for call ID:", callId);
  
  // Try finding by direct ID
  let { data: existingCallLog, error: callLogError } = await supabase
    .from("vapi_call_logs")
    .select("*")
    .eq("id", callId)
    .maybeSingle();

  if (callLogError) {
    console.error("Error fetching call log by ID:", callLogError);
    return null;
  } 
  
  if (existingCallLog) {
    console.log("Found existing call log with ID:", callId);
    return existingCallLog;
  }
  
  // If not found by ID, try by log_id
  console.warn(`No call log found for ID: ${callId}, trying by log_id instead`);
  const { data: altCallLogData, error: altCallLogError } = await supabase
    .from("vapi_call_logs")
    .select("*")
    .eq("log_id", callId)
    .maybeSingle();

  if (altCallLogError) {
    console.error("Error fetching call log by log_id:", altCallLogError);
    return null;
  } 
  
  if (altCallLogData) {
    console.log("Found call log by log_id");
    return altCallLogData;
  }
  
  return null;
}

/**
 * Store webhook data as a new call log
 */
export async function storeWebhookDataAsCallLog(webhookData: any, callId: string | null, supabase: SupabaseClient) {
  console.log("No existing call log found, storing webhook data directly");
  
  try {
    // Generate a call ID if none was provided
    const finalCallId = callId || `manual-${new Date().getTime()}`;
    console.log("Using call ID for storage:", finalCallId);
    
    // Extract phone number from the webhook data
    const phoneNumber = extractPhoneNumber(webhookData);
    console.log("Extracted phone number:", phoneNumber);
    
    // Extract assistant ID with a fallback to the default
    const assistantId = extractAssistantId(webhookData) || DEFAULT_ASSISTANT_ID;
    console.log("Using assistant ID:", assistantId);
    
    // Extract organization ID or use a default
    const organizationId = extractOrganizationId(webhookData) || "manual-org";
    console.log("Using organization ID:", organizationId);
    
    // Extract success evaluation from various possible fields
    const successEvaluation = webhookData.success_evaluation || webhookData.success || webhookData.evaluation || null;
    console.log("Success evaluation:", successEvaluation);
    
    // Prepare data for storage
    const callLogInsertData = {
      log_id: finalCallId,
      assistant_id: assistantId,
      organization_id: organizationId,
      conversation_id: webhookData.conversation_id || null,
      caller_phone_number: phoneNumber,
      customer_number: phoneNumber,
      status: webhookData.status || "completed",
      transcript: webhookData.transcript || null,
      metadata: webhookData,
      success_evaluation: successEvaluation,
      ended_reason: webhookData.ended_reason || null
    };
    
    console.log("Inserting new call log with data:", JSON.stringify(callLogInsertData, null, 2));
    
    const { data: insertedCallLog, error: insertError } = await supabase
      .from("vapi_call_logs")
      .insert(callLogInsertData)
      .select()
      .single();
      
    if (insertError) {
      console.error("Error storing direct webhook data:", insertError);
      return null;
    }
    
    console.log("Successfully stored direct webhook data:", insertedCallLog);
    return insertedCallLog;
  } catch (directStoreError) {
    console.error("Error in direct webhook data storage:", directStoreError);
    return null;
  }
}

/**
 * Retrieves or creates call log data based on webhook input
 */
export async function getOrCreateCallLogData(webhookData: any, supabase: SupabaseClient) {
  // Extract call ID from webhook data
  const callId = extractCallId(webhookData);
  
  if (!callId) {
    console.error("Missing call ID in webhook data, but proceeding with processing anyway");
    console.log("Attempting to store data with generated ID");
  } else {
    console.log(`Processing call with ID: ${callId}`);
  }

  // Look up the call log in the vapi_call_logs table
  const callLogData = await findExistingCallLog(callId, supabase);

  // If no existing call log was found, store the webhook data directly
  const finalCallLogData = callLogData || await storeWebhookDataAsCallLog(webhookData, callId, supabase);
  
  if (!finalCallLogData) {
    console.error("Failed to store or retrieve call log data");
    return null;
  }
  
  // If the existing call log doesn't have success_evaluation but the webhook does, update it
  if (finalCallLogData && 
      (finalCallLogData.success_evaluation === null || finalCallLogData.success_evaluation === undefined) && 
      (webhookData.success_evaluation !== undefined || 
       webhookData.success !== undefined || 
       webhookData.evaluation !== undefined)) {
    
    const successEvaluation = webhookData.success_evaluation || webhookData.success || webhookData.evaluation;
    console.log(`Updating success_evaluation for existing call ${finalCallLogData.log_id} to: ${successEvaluation}`);
    
    try {
      const { error } = await supabase
        .from("vapi_call_logs")
        .update({ 
          success_evaluation: successEvaluation,
          updated_at: new Date().toISOString()
        })
        .eq("id", finalCallLogData.id);
        
      if (error) {
        console.error("Error updating success_evaluation on existing call log:", error);
      } else {
        finalCallLogData.success_evaluation = successEvaluation;
        console.log("Successfully updated success_evaluation on existing call log");
      }
    } catch (updateError) {
      console.error("Exception updating success_evaluation:", updateError);
    }
  }
  
  return finalCallLogData;
}
