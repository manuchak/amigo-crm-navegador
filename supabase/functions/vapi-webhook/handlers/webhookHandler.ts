
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { DEFAULT_ASSISTANT_ID } from "../lib/constants.ts";
import { 
  extractCallId,
  extractPhoneNumber,
  extractAssistantId,
  extractOrganizationId 
} from "../utils/extractors.ts";
import { extractInfoFromTranscript } from "../utils/transcriptProcessor.ts";

/**
 * Handles test connection requests
 */
export function handleTestConnection(corsHeaders: HeadersInit) {
  console.log("Test connection request detected");
  return new Response(JSON.stringify({ 
    success: true, 
    message: "Test connection successful. The webhook is properly configured." 
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Main handler for webhook data processing
 */
export async function processWebhookData(
  webhookData: any, 
  supabase: SupabaseClient, 
  corsHeaders: HeadersInit
) {
  try {
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
      return new Response(JSON.stringify({ error: "Failed to store or retrieve call log data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract phone number to link with leads table
    const phoneNumber = extractPhoneNumber(webhookData) || 
                      finalCallLogData?.customer_number || 
                      finalCallLogData?.caller_phone_number || 
                      finalCallLogData?.phone_number;

    // Find matching lead by phone number
    const leadData = await findLeadByPhoneNumber(phoneNumber, supabase);

    // Extract information from transcript if available
    const transcript = finalCallLogData?.transcript || webhookData.transcript;
    const extractedInfo = extractInfoFromTranscript(transcript);

    // Create a generated ID for the validated_leads entry
    const generatedCallId = finalCallLogData?.id || finalCallLogData?.log_id || `webhook-${new Date().getTime()}`;

    // Store lead validation data
    const validationResult = await storeValidatedLead(
      leadData, 
      extractedInfo, 
      finalCallLogData || webhookData,
      supabase
    );

    if (validationResult.error) {
      return new Response(JSON.stringify({ 
        error: "Error saving validated lead", 
        details: validationResult.error 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "VAPI call data processed successfully",
        validated_lead_id: validationResult.data?.[0]?.id,
        linked_lead_id: leadData?.id,
        extracted_info: extractedInfo
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in processWebhookData:", error);
    throw error; // Let the main handler catch this
  }
}

/**
 * Find an existing call log by ID
 */
async function findExistingCallLog(callId: string | null, supabase: SupabaseClient) {
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
async function storeWebhookDataAsCallLog(webhookData: any, callId: string | null, supabase: SupabaseClient) {
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
      metadata: webhookData
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
 * Find a lead by phone number
 */
async function findLeadByPhoneNumber(phoneNumber: string | null | undefined, supabase: SupabaseClient) {
  if (!phoneNumber) return null;
  
  // Format phone number for search (removing non-digits)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const lastTenDigits = formattedPhone.slice(-10);
  console.log(`Searching for lead with phone number: ${lastTenDigits}`);
  
  // Look up lead by phone number
  const { data: foundLead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .or(`telefono.ilike.%${lastTenDigits}`)
    .maybeSingle();

  if (leadError) {
    console.error("Error fetching lead:", leadError);
    return null;
  } 
  
  if (foundLead) {
    console.log("Found matching lead:", JSON.stringify(foundLead, null, 2));
    return foundLead;
  }
  
  console.warn("No matching lead found for phone number:", phoneNumber);
  return null;
}

/**
 * Store validated lead data
 */
async function storeValidatedLead(
  leadData: any, 
  extractedInfo: any, 
  callData: any,
  supabase: SupabaseClient
) {
  // Prepare data for validated_leads table
  const validatedLeadData = {
    lead_id: leadData?.id || null,
    car_brand: extractedInfo.car_brand || null,
    car_model: extractedInfo.car_model || null,
    car_year: extractedInfo.car_year || null,
    custodio_name: leadData?.nombre || extractedInfo.custodio_name || null,
    security_exp: leadData?.experienciaseguridad || extractedInfo.security_exp || null,
    sedena_id: extractedInfo.sedena_id || null,
    vapi_call_data: callData
  };

  console.log("Saving validated lead data:", JSON.stringify(validatedLeadData, null, 2));

  // Save to validated_leads table
  return await supabase
    .from("validated_leads")
    .insert(validatedLeadData)
    .select();
}
