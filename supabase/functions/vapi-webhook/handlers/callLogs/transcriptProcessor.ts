
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { extractInfoFromTranscript } from "../../utils/transcriptProcessor.ts";

interface CallLogData {
  id: string;
  log_id: string;
  success_evaluation: boolean | null;
}

/**
 * Process and store transcript data from webhook data
 */
export async function processAndStoreTranscript(
  webhookData: any, 
  callLogData: CallLogData, 
  supabase: SupabaseClient
): Promise<void> {
  try {
    // Skip if no transcript is available
    if (!webhookData.transcript) {
      console.log(`No transcript available for call ${callLogData.log_id}, skipping transcript processing`);
      return;
    }

    console.log(`Processing transcript for call ${callLogData.log_id}`);
    
    // Extract information from the transcript
    const extractedInfo = extractInfoFromTranscript(webhookData.transcript);
    
    // Update the call log with the transcript data if we have useful information
    if (Object.keys(extractedInfo).length > 0) {
      const { data, error } = await supabase
        .from("vapi_call_logs")
        .update({ 
          transcript_data: extractedInfo,
          updated_at: new Date().toISOString()
        })
        .eq("id", callLogData.id);
        
      if (error) {
        console.error("Error updating transcript_data:", error);
      } else {
        console.log("Successfully updated transcript_data with extracted information:", extractedInfo);
      }
    } else {
      console.log("No useful information extracted from transcript");
    }
  } catch (error) {
    console.error("Error processing transcript:", error);
    // Don't throw the error to prevent it from stopping the webhook process
  }
}
