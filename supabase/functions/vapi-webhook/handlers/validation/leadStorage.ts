/**
 * Functions for storing validated lead data
 */
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { formatPhoneNumberIntl, extractRawPhoneNumber } from "./phoneUtils.ts";
import { ValidatedLeadData } from "./types.ts";

/**
 * Store validated lead data - with enhanced error handling and robust type checking
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
  const rawPhoneNumber = extractRawPhoneNumber(phoneNumber);
  
  // Prepare data for validated_leads table - only include fields that exist in the table
  const validatedLeadData: ValidatedLeadData = {
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
