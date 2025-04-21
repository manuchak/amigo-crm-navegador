
/**
 * Main lead validation processing logic
 */
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { extractPhoneNumber } from "./phoneUtils.ts";
import { findLeadByPhoneNumber } from "./leadFinder.ts";
import { extractInformation } from "./dataExtractor.ts";
import { storeValidatedLead } from "./leadStorage.ts";
import { ValidationResult } from "./types.ts";

/**
 * Process incoming webhook data to extract lead information
 */
export async function processLeadValidation(
  webhookData: any,
  callLogData: any,
  supabase: SupabaseClient
): Promise<ValidationResult> {
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
    const extractedInfo = extractInformation(webhookData, callLogData);
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
