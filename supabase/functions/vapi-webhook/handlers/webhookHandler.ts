
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { getOrCreateCallLogData } from "./callLogs/callLogManager.ts";
import { processAndStoreTranscript } from "./callLogs/transcriptProcessor.ts";
import { updateLeadWithCallData } from "./leads/leadProcessor.ts";

/**
 * Process VAPI Webhook Data 
 */
export async function processWebhookData(webhookData: any, supabase: SupabaseClient, corsHeaders: Record<string, string>) {
  try {
    // Extract critical data for logging
    console.log("Processing webhook data:", {
      call_id: webhookData.call_id || webhookData.id || "unknown",
      status: webhookData.status || "unknown",
      has_transcript: webhookData.transcript ? true : false,
      has_success_evaluation: webhookData.success_evaluation !== undefined || webhookData.success !== undefined || webhookData.evaluation !== undefined
    });

    // Get or create the call log entry
    const callLogData = await getOrCreateCallLogData(webhookData, supabase);
    
    if (!callLogData) {
      throw new Error("Failed to create or retrieve call log");
    }
    
    // Process and store transcript data if present
    await processAndStoreTranscript(webhookData, callLogData, supabase);
    
    // Update lead with call data
    await updateLeadWithCallData(webhookData, callLogData, supabase);
    
    // Check for success_evaluation
    const successEvaluation = webhookData.success_evaluation || webhookData.success || webhookData.evaluation;
    
    // If success evaluation is present but not stored yet, update it
    if (successEvaluation !== undefined && callLogData.success_evaluation === null) {
      console.log(`Updating success_evaluation for call ${callLogData.log_id} to: ${successEvaluation}`);
      
      const { data, error } = await supabase
        .from("vapi_call_logs")
        .update({ 
          success_evaluation: successEvaluation,
          updated_at: new Date().toISOString()
        })
        .eq("id", callLogData.id);
        
      if (error) {
        console.error("Error updating success_evaluation:", error);
      } else {
        console.log("Successfully updated success_evaluation");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook data processed successfully",
        call_id: webhookData.call_id || webhookData.id || null
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in processWebhookData:", error);
    throw error;
  }
}

/**
 * Handle test connection requests
 */
export function handleTestConnection(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Test connection successful!",
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    }
  );
}
