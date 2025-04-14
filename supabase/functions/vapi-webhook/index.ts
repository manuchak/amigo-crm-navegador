
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Default assistant ID to use when none is provided in the request
const DEFAULT_ASSISTANT_ID = "0b7c2a96-0360-4fef-9956-e847fd696ea2";

serve(async (req) => {
  // Add detailed initial logging for troubleshooting
  console.log("Webhook request received:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  // Only accept POST requests for data submission
  if (req.method !== "POST") {
    console.log(`Method not allowed: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the webhook data from VAPI
    const webhookData = await req.json();
    console.log("Received VAPI webhook data:", JSON.stringify(webhookData, null, 2));

    // More flexible extraction of call ID from various possible payload structures
    const callId = extractCallId(webhookData);
    
    if (!callId) {
      console.error("Missing call ID in webhook data, but proceeding with processing anyway");
      console.log("Attempting to store data with generated ID");
      // Continue processing even without a call ID, we'll generate one later
    } else {
      console.log(`Processing call with ID: ${callId}`);
    }

    // Check if this is a test connection
    if (callId === "test-connection") {
      console.log("Test connection request detected");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Test connection successful. The webhook is properly configured." 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the call log in the vapi_call_logs table if we have a call ID
    let callLogData = null;
    if (callId) {
      console.log("Querying vapi_call_logs table for call ID:", callId);
      let { data: existingCallLog, error: callLogError } = await supabase
        .from("vapi_call_logs")
        .select("*")
        .eq("id", callId)
        .maybeSingle();

      if (callLogError) {
        console.error("Error fetching call log by ID:", callLogError);
      } else if (existingCallLog) {
        callLogData = existingCallLog;
        console.log("Found existing call log with ID:", callId);
      } else {
        // If not found by ID, try by log_id
        console.warn(`No call log found for ID: ${callId}, trying by log_id instead`);
        const { data: altCallLogData, error: altCallLogError } = await supabase
          .from("vapi_call_logs")
          .select("*")
          .eq("log_id", callId)
          .maybeSingle();

        if (altCallLogError) {
          console.error("Error fetching call log by log_id:", altCallLogError);
        } else if (altCallLogData) {
          callLogData = altCallLogData;
          console.log("Found call log by log_id");
        }
      }
    }

    // If no existing call log was found, store the webhook data directly
    if (!callLogData) {
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
          return new Response(JSON.stringify({ error: "Failed to store webhook data", details: insertError }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        console.log("Successfully stored direct webhook data:", insertedCallLog);
        callLogData = insertedCallLog;
      } catch (directStoreError) {
        console.error("Error in direct webhook data storage:", directStoreError);
        return new Response(JSON.stringify({ error: "Failed to process direct webhook", details: String(directStoreError) }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Extract phone number to link with leads table
    const phoneNumber = extractPhoneNumber(webhookData) || 
                      callLogData?.customer_number || 
                      callLogData?.caller_phone_number || 
                      callLogData?.phone_number;

    // Format phone number for search (removing non-digits)
    let leadData = null;
    if (phoneNumber) {
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
      } else if (foundLead) {
        leadData = foundLead;
        console.log("Found matching lead:", JSON.stringify(leadData, null, 2));
      } else {
        console.warn("No matching lead found for phone number:", phoneNumber);
      }
    }

    // Extract information from transcript if available
    const transcript = callLogData?.transcript || webhookData.transcript;
    let extractedInfo = {
      car_brand: null,
      car_model: null,
      car_year: null,
      custodio_name: null,
      security_exp: null,
      sedena_id: null
    };

    // Process transcript if available
    if (transcript) {
      console.log("Processing transcript to extract lead information");
      try {
        // Handle various transcript formats
        const transcriptData = typeof transcript === 'string' 
          ? JSON.parse(transcript) 
          : transcript;
        
        if (transcriptData) {
          // Convert to string for pattern matching - handles both array and object formats
          const transcriptText = JSON.stringify(transcriptData).toLowerCase();
          
          // Extract car information
          if (transcriptText.includes("marca") || transcriptText.includes("modelo") || 
              transcriptText.includes("vehículo") || transcriptText.includes("coche") || 
              transcriptText.includes("carro")) {
            
            // Extract car brand
            const brandMatch = transcriptText.match(/marca.*?(\w+)/i) || 
                            transcriptText.match(/tengo un (\w+)/i) ||
                            transcriptText.match(/mi (\w+)/i);
            if (brandMatch && brandMatch[1]) {
              extractedInfo.car_brand = brandMatch[1].charAt(0).toUpperCase() + brandMatch[1].slice(1);
            }
            
            // Extract car model
            const modelMatch = transcriptText.match(/modelo.*?(\w+)/i) ||
                            transcriptText.match(/un (\w+) del/i);
            if (modelMatch && modelMatch[1]) {
              extractedInfo.car_model = modelMatch[1].charAt(0).toUpperCase() + modelMatch[1].slice(1);
            }
            
            // Extract car year
            const yearMatch = transcriptText.match(/año.*?(\d{4})/i) ||
                           transcriptText.match(/del (\d{4})/i);
            if (yearMatch && yearMatch[1]) {
              extractedInfo.car_year = parseInt(yearMatch[1]);
            }
          }
          
          // Extract security experience
          if (transcriptText.includes("experiencia") || transcriptText.includes("seguridad")) {
            extractedInfo.security_exp = 
              transcriptText.includes("tengo experiencia") ? "SI" : "NO";
          }
          
          // Extract name
          const nameMatch = transcriptText.match(/me llamo (\w+ \w+)/i) ||
                         transcriptText.match(/nombre es (\w+ \w+)/i);
          if (nameMatch && nameMatch[1]) {
            extractedInfo.custodio_name = nameMatch[1];
          }
        }
      } catch (transcriptError) {
        console.error("Error processing transcript:", transcriptError);
      }
    }

    console.log("Extracted info from transcript:", JSON.stringify(extractedInfo));

    // Create a generated ID for the validated_leads entry
    const generatedCallId = callLogData?.id || callLogData?.log_id || `webhook-${new Date().getTime()}`;

    // Prepare data for validated_leads table
    const validatedLeadData = {
      lead_id: leadData?.id || null,
      car_brand: extractedInfo.car_brand || null,
      car_model: extractedInfo.car_model || null,
      car_year: extractedInfo.car_year || null,
      custodio_name: leadData?.nombre || extractedInfo.custodio_name || null,
      security_exp: leadData?.experienciaseguridad || extractedInfo.security_exp || null,
      sedena_id: extractedInfo.sedena_id || null,
      call_id: generatedCallId,
      vapi_call_data: callLogData || webhookData
    };

    console.log("Saving validated lead data:", JSON.stringify(validatedLeadData, null, 2));

    // Save to validated_leads table
    const { data: insertData, error: insertError } = await supabase
      .from("validated_leads")
      .upsert(
        validatedLeadData, 
        { onConflict: 'call_id', ignoreDuplicates: false }
      )
      .select();

    if (insertError) {
      console.error("Error inserting validated lead:", insertError);
      return new Response(JSON.stringify({ error: "Error saving validated lead", details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully inserted data, response:", JSON.stringify(insertData, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        message: "VAPI call data processed successfully",
        validated_lead_id: insertData?.[0]?.id,
        linked_lead_id: leadData?.id,
        extracted_info: extractedInfo
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to extract call ID from various payload structures
function extractCallId(data: any): string | null {
  // Check direct id fields
  if (data.call_id) return data.call_id;
  if (data.id) return data.id;
  
  // Check nested structures
  if (data.call && data.call.id) return data.call.id;
  if (data.call_data && data.call_data.id) return data.call_data.id;
  if (data.event && data.event.call_id) return data.event.call_id;
  if (data.event && data.event.id) return data.event.id;
  
  // Check for conversation_id as fallback
  if (data.conversation_id) return data.conversation_id;
  
  // No suitable ID found
  return null;
}

// Helper function to extract phone number from various payload structures
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

// New helper function to extract assistant ID from various payload structures
function extractAssistantId(data: any): string | null {
  // Check direct assistant fields
  if (data.assistant_id) return data.assistant_id;
  if (data.assistantId) return data.assistantId;
  
  // Check nested structures
  if (data.assistant && data.assistant.id) return data.assistant.id;
  if (data.call && data.call.assistant_id) return data.call.assistant_id;
  if (data.call && data.call.assistantId) return data.call.assistantId;
  
  // Check metadata for assistant ID
  if (data.metadata && data.metadata.assistant_id) return data.metadata.assistant_id;
  if (data.metadata && data.metadata.assistantId) return data.metadata.assistantId;
  
  // Check inside the event object
  if (data.event && data.event.assistant_id) return data.event.assistant_id;
  if (data.event && data.event.assistantId) return data.event.assistantId;
  
  // No suitable assistant ID found
  return null;
}

// New helper function to extract organization ID from various payload structures
function extractOrganizationId(data: any): string | null {
  // Check direct organization fields
  if (data.organization_id) return data.organization_id;
  if (data.organizationId) return data.organizationId;
  
  // Check nested structures
  if (data.organization && data.organization.id) return data.organization.id;
  if (data.call && data.call.organization_id) return data.call.organization_id;
  if (data.call && data.call.organizationId) return data.call.organizationId;
  
  // Check metadata for organization ID
  if (data.metadata && data.metadata.organization_id) return data.metadata.organization_id;
  if (data.metadata && data.metadata.organizationId) return data.metadata.organizationId;
  
  // Check inside the event object
  if (data.event && data.event.organization_id) return data.event.organization_id;
  if (data.event && data.event.organizationId) return data.event.organizationId;
  
  // No suitable organization ID found
  return null;
}
