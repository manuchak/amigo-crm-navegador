
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { extractCallId } from "../utils/extractors.ts";
import { handleTestConnection } from "./testing/testConnectionHandler.ts";
import { getOrCreateCallLogData } from "./callLogs/callLogManager.ts";
import { processLeadValidation } from "./validation/leadValidation.ts";

/**
 * Main handler for webhook data processing
 */
export async function processWebhookData(
  webhookData: any, 
  supabase: SupabaseClient, 
  corsHeaders: HeadersInit
) {
  try {
    console.log("Processing webhook data:", JSON.stringify(webhookData, null, 2));

    // Extract lead ID from webhook data if present
    if (webhookData.leadId || webhookData.lead_id) {
      console.log("Lead ID found in webhook data:", webhookData.leadId || webhookData.lead_id);
    }

    // Get or create the call log data
    const finalCallLogData = await getOrCreateCallLogData(webhookData, supabase);
    
    if (!finalCallLogData) {
      return new Response(JSON.stringify({ error: "Failed to store or retrieve call log data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process lead validation
    const validationResult = await processLeadValidation(webhookData, finalCallLogData, supabase);

    if (validationResult.error) {
      console.error("Error in lead validation:", validationResult.error);
      return new Response(JSON.stringify({ 
        error: "Error validating lead", 
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
        validated_lead_id: validationResult.validated_lead_id,
        linked_lead_id: validationResult.linked_lead_id,
        extracted_info: validationResult.extracted_info
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

export { handleTestConnection };
