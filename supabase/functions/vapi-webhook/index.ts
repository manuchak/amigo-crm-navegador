
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

    // Extract relevant information from the webhook data
    const callId = webhookData.call_id || webhookData.id;
    if (!callId) {
      console.error("Missing call ID in webhook data");
      return new Response(JSON.stringify({ error: "Missing call ID", data: webhookData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the call ID for debugging
    console.log(`Processing call with ID: ${callId}`);

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

    // Look up the call log in the vapi_call_logs table
    console.log("Querying vapi_call_logs table for call ID:", callId);
    let { data: callLogData, error: callLogError } = await supabase
      .from("vapi_call_logs")
      .select("*")
      .eq("id", callId)
      .maybeSingle();

    if (callLogError) {
      console.error("Error fetching call log by ID:", callLogError);
      return new Response(JSON.stringify({ error: "Error fetching call log", details: callLogError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If not found by ID, try by log_id
    if (!callLogData) {
      console.warn(`No call log found for ID: ${callId}, trying by log_id instead`);
      const { data: altCallLogData, error: altCallLogError } = await supabase
        .from("vapi_call_logs")
        .select("*")
        .eq("log_id", callId)
        .maybeSingle();

      if (altCallLogError) {
        console.error("Error fetching call log by log_id:", altCallLogError);
        return new Response(JSON.stringify({ error: "Error fetching call log", details: altCallLogError }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!altCallLogData) {
        console.error(`Call log not found with either ID or log_id: ${callId}`);
        
        // If this is a direct webhook from VAPI with no matching record
        // Try to store the data directly
        try {
          console.log("Attempting to store the webhook data directly from VAPI");
          const { data: insertedCallLog, error: insertError } = await supabase
            .from("vapi_call_logs")
            .insert({
              log_id: callId,
              assistant_id: webhookData.assistant_id || webhookData.assistant?.id || null,
              organization_id: webhookData.organization_id || null,
              conversation_id: webhookData.conversation_id || null,
              caller_phone_number: webhookData.phone_number || webhookData.customer_number || null,
              status: webhookData.status || "completed",
              transcript: webhookData.transcript || null,
              metadata: webhookData
            })
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
      } else {
        // If found by log_id, use this data instead
        callLogData = altCallLogData;
        console.log("Found call log by log_id");
      }
    }

    // Extract phone number to link with leads table
    const phoneNumber = callLogData?.customer_number || 
                        callLogData?.caller_phone_number || 
                        callLogData?.phone_number ||
                        webhookData.phone_number;

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

    // Prepare data for validated_leads table
    const validatedLeadData = {
      lead_id: leadData?.id || null,
      car_brand: extractedInfo.car_brand || null,
      car_model: extractedInfo.car_model || null,
      car_year: extractedInfo.car_year || null,
      custodio_name: leadData?.nombre || extractedInfo.custodio_name || null,
      security_exp: leadData?.experienciaseguridad || extractedInfo.security_exp || null,
      sedena_id: extractedInfo.sedena_id || null,
      call_id: callId,
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
