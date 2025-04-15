
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { extractInfoFromTranscript } from "../../utils/transcriptProcessor.ts";

/**
 * Process incoming webhook data to extract lead information
 */
export async function processLeadValidation(
  webhookData: any,
  callLogData: any,
  supabase: SupabaseClient
) {
  try {
    // Extract phone number to link with leads table
    const phoneNumber = extractPhoneNumber(webhookData) || 
                       callLogData?.customer_number || 
                       callLogData?.caller_phone_number || 
                       callLogData?.phone_number;

    // Find matching lead by phone number
    const leadData = await findLeadByPhoneNumber(phoneNumber, supabase);

    // Process the webhook data or transcript to extract information
    let extractedInfo;
    
    // First try to extract from the direct webhook data
    if (webhookData && typeof webhookData === 'object' && (webhookData.car_brand || webhookData.car_model || webhookData.lead_name)) {
      console.log("Extracting info from direct webhook data");
      extractedInfo = extractInfoFromTranscript(webhookData);
    } else {
      // Fall back to transcript if available
      const transcript = callLogData?.transcript || webhookData.transcript;
      console.log("Extracting info from transcript");
      extractedInfo = extractInfoFromTranscript(transcript);
    }
    
    console.log("Extracted information:", JSON.stringify(extractedInfo, null, 2));

    // Store lead validation data
    const validationResult = await storeValidatedLead(
      leadData, 
      extractedInfo, 
      callLogData || webhookData,
      supabase
    );

    return {
      success: !validationResult.error,
      data: validationResult.data,
      error: validationResult.error,
      validated_lead_id: validationResult.data?.[0]?.id,
      linked_lead_id: leadData?.id,
      extracted_info: extractedInfo
    };
  } catch (error) {
    console.error("Error in processLeadValidation:", error);
    return {
      success: false,
      error: error,
      message: "Failed to process lead validation"
    };
  }
}

/**
 * Find a lead by phone number
 */
export async function findLeadByPhoneNumber(phoneNumber: string | null | undefined, supabase: SupabaseClient) {
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
export async function storeValidatedLead(
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
  const result = await supabase
    .from("validated_leads")
    .insert(validatedLeadData)
    .select();
    
  if (result.error) {
    console.error("Error inserting validated lead:", result.error);
  } else {
    console.log("Successfully inserted validated lead:", result.data);
  }
  
  return result;
}

/**
 * Helper function to extract phone number from various payload structures
 */
function extractPhoneNumber(data: any): string | null {
  // Check direct phone fields
  if (data.phone_number) return data.phone_number;
  if (data.caller_phone_number) return data.caller_phone_number;
  if (data.customer_number) return data.customer_number;
  
  // Check nested structures
  if (data.call && data.call.phone_number) return data.call.phone_number;
  if (data.call && data.call.customer_number) return data.call.customer_number;
  if (data.caller && data.caller.phone_number) return data.caller.phone_number;
  if (data.customer && data.customer.phone_number) return data.customer.phone_number;
  
  // Check metadata for phone numbers
  if (data.metadata && data.metadata.phone_number) return data.metadata.phone_number;
  if (data.metadata && data.metadata.caller_phone_number) return data.metadata.caller_phone_number;
  if (data.metadata && data.metadata.customer_number) return data.metadata.customer_number;
  
  // Check inside the event object
  if (data.event && data.event.phone_number) return data.event.phone_number;
  
  // No suitable phone number found
  return null;
}
