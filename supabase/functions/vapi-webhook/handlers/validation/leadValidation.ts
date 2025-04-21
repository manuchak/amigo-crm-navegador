
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { extractInfoFromTranscript } from "../../utils/transcriptProcessor.ts";
import { extractPhoneNumber } from "../../utils/extractors.ts";

/**
 * Process incoming webhook data to extract lead information
 */
export async function processLeadValidation(
  webhookData: any,
  callLogData: any,
  supabase: SupabaseClient
) {
  try {
    // Enhanced logging for debugging
    console.log("VAPI Webhook processing started with data:", JSON.stringify(webhookData, null, 2));
    console.log("Call log data:", JSON.stringify(callLogData, null, 2));
    
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
    const leadId = leadData?.id || webhookData?.leadId || webhookData?.lead_id;
    console.log("Lead ID for validation:", leadId);
    
    // Process the webhook data or transcript to extract information
    let extractedInfo;
    
    // First try to extract from the direct webhook data
    if (webhookData && typeof webhookData === 'object' && (webhookData.car_brand || webhookData.car_model || webhookData.lead_name)) {
      console.log("Extracting info from direct webhook data");
      extractedInfo = extractInfoFromDirectData(webhookData);
    } else {
      // Fall back to transcript if available
      const transcript = callLogData?.transcript || webhookData.transcript;
      console.log("Extracting info from transcript");
      extractedInfo = extractInfoFromTranscript(transcript);
    }
    
    console.log("Extracted information:", JSON.stringify(extractedInfo, null, 2));

    // If no lead ID was found, we need to handle this special case
    if (!leadId) {
      console.warn("No lead ID found in any data source - creating a temporary validation record");
      
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
    console.log("Using lead ID for validation:", effectiveLeadId);

    // Store lead validation data - improved with better error handling
    try {
      const validationResult = await storeValidatedLead(
        { id: effectiveLeadId, ...leadData }, // Ensure ID is always present
        extractedInfo || {}, 
        callLogData || webhookData,
        supabase,
        phoneNumber // Pass the phone number for international formatting
      );

      console.log("Validation result:", JSON.stringify(validationResult, null, 2));

      return {
        success: !validationResult.error,
        data: validationResult.data,
        error: validationResult.error,
        validated_lead_id: validationResult.data?.[0]?.id,
        linked_lead_id: effectiveLeadId,
        extracted_info: extractedInfo
      };
    } catch (storeError) {
      console.error("Critical error in storeValidatedLead:", storeError);
      return {
        success: false,
        error: storeError,
        message: "Failed to store validated lead data",
        extracted_info: extractedInfo
      };
    }
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
 * Helper to extract information directly from webhook data
 */
function extractInfoFromDirectData(data: any) {
  // Extract relevant fields from direct data
  return {
    car_brand: data.car_brand || data.carBrand || null,
    car_model: data.car_model || data.carModel || null,
    car_year: data.car_year || data.carYear || null,
    custodio_name: data.custodio_name || data.lead_name || data.nombre || null,
    security_exp: data.security_exp || data.security_experience || data.experienciaseguridad || null,
    sedena_id: data.sedena_id || data.credencialsedena || null
  };
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
 * Format phone number to international format
 */
function formatPhoneNumberIntl(phoneNumber: string | null | undefined): string | null {
  if (!phoneNumber) {
    return null;
  }

  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  // Get the last 10 digits for Mexican numbers
  const lastTenDigits = digitsOnly.slice(-10);

  // Add the +52 prefix for Mexican numbers
  return lastTenDigits ? `+52${lastTenDigits}` : null;
}

/**
 * Store validated lead data - improved with enhanced error handling and robust type checking
 */
export async function storeValidatedLead(
  leadData: any, 
  extractedInfo: any, 
  callData: any,
  supabase: SupabaseClient,
  phoneNumber: string | null | undefined
) {
  // Detailed logging of all input data for debugging
  console.log("Store validated lead - input data:");
  console.log("- Lead data:", JSON.stringify(leadData, null, 2));
  console.log("- Extracted info:", JSON.stringify(extractedInfo, null, 2));
  console.log("- Call data:", JSON.stringify(callData, null, 2));
  console.log("- Phone number:", phoneNumber);
  
  // Double-check for valid lead ID - this is critical since id field is NOT NULL
  if (!leadData?.id) {
    console.error("CRITICAL ERROR: No lead ID provided to storeValidatedLead function");
    return { 
      error: { message: "Missing required lead ID" }, 
      data: null 
    };
  }
  
  // Convert string ID to number if needed - validated_leads.id is a bigint
  let leadId: number;
  try {
    // Check if it's already a number
    if (typeof leadData.id === 'number') {
      leadId = leadData.id;
    } 
    // If it's a string, try to parse as an integer
    else if (typeof leadData.id === 'string') {
      // Remove any non-numeric characters first
      const cleanIdString = leadData.id.replace(/\D/g, '');
      leadId = parseInt(cleanIdString, 10);
    }
    // Otherwise, we can't process this ID
    else {
      throw new Error(`Invalid lead ID type: ${typeof leadData.id}`);
    }
    
    // Final validation
    if (isNaN(leadId) || leadId <= 0) {
      throw new Error(`Invalid lead ID value: ${leadData.id} (parsed as ${leadId})`);
    }
    
    console.log(`Successfully converted lead ID to number: ${leadId}`);
  } catch (error) {
    console.error("Error converting lead ID to number:", error);
    return { 
      error: { message: `Invalid lead ID format: ${leadData.id}` }, 
      data: null 
    };
  }

  // Format the phone number for international format
  const phoneNumberIntl = formatPhoneNumberIntl(phoneNumber);
  console.log("Formatted international phone number:", phoneNumberIntl);
  
  // Extract raw phone number (numeric) for storage
  let rawPhoneNumber: number | null = null;
  if (phoneNumber) {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const lastTenDigits = digitsOnly.slice(-10);
    rawPhoneNumber = lastTenDigits ? Number(lastTenDigits) : null;
  }
  
  // Prepare data for validated_leads table - only include fields that exist in the table
  const validatedLeadData = {
    id: leadId, // Use the validated numeric ID
    car_brand: extractedInfo?.car_brand || null,
    car_model: extractedInfo?.car_model || null,
    car_year: extractedInfo?.car_year ? Number(extractedInfo.car_year) : null, // Ensure numeric
    custodio_name: leadData?.nombre || extractedInfo?.custodio_name || null,
    security_exp: extractedInfo?.security_exp || null,
    sedena_id: extractedInfo?.sedena_id || null,
    call_id: callData?.log_id || callData?.id || callData?.call_id || null,
    phone_number: rawPhoneNumber,
    phone_number_intl: phoneNumberIntl,
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

  // Check if record already exists for this lead
  const { data: existingRecord, error: checkError } = await supabase
    .from("validated_leads")
    .select("id")
    .eq("id", validatedLeadData.id)
    .maybeSingle();
    
  if (checkError) {
    console.error("Error checking for existing record:", checkError);
    return { error: checkError, data: null };
  }
  
  let result;
  
  // If record exists, update it; otherwise insert new record
  if (existingRecord) {
    console.log(`Record already exists for lead ID ${validatedLeadData.id}, updating...`);
    result = await supabase
      .from("validated_leads")
      .update(validatedLeadData)
      .eq("id", validatedLeadData.id)
      .select();
  } else {
    console.log(`No existing record for lead ID ${validatedLeadData.id}, inserting new record...`);
    result = await supabase
      .from("validated_leads")
      .insert(validatedLeadData)
      .select();
  }
    
  if (result.error) {
    console.error("Error inserting/updating validated lead:", result.error);
    console.error("Full error details:", JSON.stringify(result.error, null, 2));
    console.error("Validation Lead Data:", JSON.stringify(validatedLeadData, null, 2));
  } else {
    console.log("Successfully processed validated lead:", result.data);
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
  if (data.telefono) return data.telefono;
  
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
