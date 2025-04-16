
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

    console.log("Attempting to find lead with phone number:", phoneNumber);
    
    // Find matching lead by phone number
    const leadData = await findLeadByPhoneNumber(phoneNumber, supabase);
    
    // Log the found lead data
    if (leadData) {
      console.log("Found lead by phone number:", JSON.stringify(leadData, null, 2));
    } else {
      console.log("No lead found by phone number:", phoneNumber);
    }
    
    // Check if we have any ID, either from the found lead or in the webhook data
    const hasLeadId = leadData?.id || webhookData?.leadId || webhookData?.lead_id;
    
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

    // If no lead ID was found, we need to handle this special case
    if (!hasLeadId) {
      console.warn("No lead ID found in any data source - creating a temporary validation record");
      
      // We could create a new lead here, but for now let's just return the extracted info
      return {
        success: true,
        error: null,
        message: "No lead ID found, but information was extracted successfully",
        validated_lead_id: null,
        linked_lead_id: null,
        extracted_info: extractedInfo,
        requires_lead_assignment: true
      };
    }

    // Get lead ID from either the found lead or the webhook data
    const effectiveLeadId = leadData?.id || webhookData?.leadId || webhookData?.lead_id;
    console.log("Using lead ID:", effectiveLeadId);

    // Store lead validation data
    const validationResult = await storeValidatedLead(
      { id: effectiveLeadId, ...leadData }, // Ensure ID is always present
      extractedInfo || {}, 
      callLogData || webhookData,
      supabase
    );

    return {
      success: !validationResult.error,
      data: validationResult.data,
      error: validationResult.error,
      validated_lead_id: validationResult.data?.[0]?.id,
      linked_lead_id: leadData?.id || webhookData?.leadId || webhookData?.lead_id,
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
  if (!phoneNumber) {
    console.log("No phone number provided to findLeadByPhoneNumber");
    return null;
  }
  
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
  // Detailed logging of all input data for debugging
  console.log("Lead data:", JSON.stringify(leadData, null, 2));
  console.log("Extracted info:", JSON.stringify(extractedInfo, null, 2));
  console.log("Call data:", JSON.stringify(callData, null, 2));
  
  // Double-check for valid lead ID - this is critical since id field is NOT NULL
  if (!leadData?.id) {
    console.error("CRITICAL ERROR: No lead ID provided to storeValidatedLead function");
    return { 
      error: { message: "Missing required lead ID" }, 
      data: null 
    };
  }
  
  // Ensure ID is numeric - database expects bigint for lead ID
  let leadId: number;
  try {
    leadId = typeof leadData.id === 'string' ? parseInt(leadData.id, 10) : leadData.id;
    if (isNaN(leadId)) {
      throw new Error(`Invalid lead ID: ${leadData.id} (cannot convert to number)`);
    }
  } catch (error) {
    console.error("Error converting lead ID to number:", error);
    return { 
      error: { message: `Invalid lead ID format: ${leadData.id}` }, 
      data: null 
    };
  }
  
  // Prepare data for validated_leads table - only include fields that exist in the table
  const validatedLeadData = {
    id: leadId, // Use the converted numeric ID
    car_brand: extractedInfo?.car_brand || null,
    car_model: extractedInfo?.car_model || null,
    car_year: extractedInfo?.car_year || null,
    custodio_name: leadData?.nombre || extractedInfo?.custodio_name || null,
    security_exp: extractedInfo?.security_exp || null,
    sedena_id: extractedInfo?.sedena_id || null,
    call_id: callData?.log_id || callData?.id || null,
    vapi_call_data: callData || null
  };

  console.log("Saving validated lead data:", JSON.stringify(validatedLeadData, null, 2));

  // Final validation check before insertion
  if (validatedLeadData.id === null || validatedLeadData.id === undefined) {
    console.error("VALIDATION FAILED: Still have null/undefined ID after all processing");
    return { 
      error: { message: "Cannot insert null value for primary key 'id'" }, 
      data: null 
    };
  }

  // Save to validated_leads table
  const result = await supabase
    .from("validated_leads")
    .insert(validatedLeadData)
    .select();
    
  if (result.error) {
    console.error("Error inserting validated lead:", result.error);
    // Log the full error details for debugging
    console.error("Validation Lead Data:", JSON.stringify(validatedLeadData, null, 2));
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
