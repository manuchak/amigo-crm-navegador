
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  // Only accept POST requests for data submission
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the webhook data from VAPI
    const webhookData = await req.json();
    console.log("Received VAPI webhook data:", JSON.stringify(webhookData));

    // Extract relevant information from the webhook data
    const callId = webhookData.call_id || webhookData.id;
    if (!callId) {
      return new Response(JSON.stringify({ error: "Missing call ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the call log in the vapi_call_logs table
    let { data: callLogData, error: callLogError } = await supabase
      .from("vapi_call_logs")
      .select("*")
      .eq("id", callId)
      .maybeSingle();

    if (callLogError) {
      console.error("Error fetching call log:", callLogError);
      return new Response(JSON.stringify({ error: "Error fetching call log" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!callLogData) {
      console.warn(`No call log found for ID: ${callId}`);
      // Try fetching by log_id instead
      const { data: altCallLogData, error: altCallLogError } = await supabase
        .from("vapi_call_logs")
        .select("*")
        .eq("log_id", callId)
        .maybeSingle();

      if (altCallLogError || !altCallLogData) {
        return new Response(JSON.stringify({ error: "Call log not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // If found by log_id, use this data instead
      callLogData = altCallLogData;
    }

    // Extract phone number to link with leads table
    const phoneNumber = callLogData.customer_number || 
                        callLogData.caller_phone_number || 
                        callLogData.phone_number;

    if (!phoneNumber) {
      console.warn("No phone number found in call log");
      return new Response(JSON.stringify({ warning: "No phone number found to link with leads" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format phone number for search (removing non-digits)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const lastTenDigits = formattedPhone.slice(-10);
    
    // Look up lead by phone number
    const { data: leadData, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .or(`telefono.ilike.%${lastTenDigits}%`)
      .maybeSingle();

    if (leadError) {
      console.error("Error fetching lead:", leadError);
    }

    // Extract information from transcript if available
    const transcript = callLogData.transcript;
    let extractedInfo = {
      car_brand: null,
      car_model: null,
      car_year: null,
      custodio_name: null,
      security_exp: null,
      sedena_id: null
    };

    // Extract lead information from transcript or metadata if available
    if (transcript) {
      console.log("Processing transcript to extract lead information");
      // Simple extraction logic - can be enhanced based on transcript structure
      if (typeof transcript === 'object') {
        // Search through transcript turns for keywords
        const transcriptText = JSON.stringify(transcript).toLowerCase();
        
        // Extract car information
        if (transcriptText.includes("modelo") || transcriptText.includes("vehiculo") || transcriptText.includes("coche")) {
          const carBrandMatches = transcriptText.match(/marca.*?(\w+)/i);
          if (carBrandMatches && carBrandMatches[1]) {
            extractedInfo.car_brand = carBrandMatches[1].charAt(0).toUpperCase() + carBrandMatches[1].slice(1);
          }
          
          const carModelMatches = transcriptText.match(/modelo.*?(\w+)/i);
          if (carModelMatches && carModelMatches[1]) {
            extractedInfo.car_model = carModelMatches[1].charAt(0).toUpperCase() + carModelMatches[1].slice(1);
          }
          
          const carYearMatches = transcriptText.match(/año.*?(\d{4})/i) || transcriptText.match(/(\d{4}).*?modelo/i);
          if (carYearMatches && carYearMatches[1]) {
            extractedInfo.car_year = parseInt(carYearMatches[1]);
          }
        }
        
        // Extract security experience info
        if (transcriptText.includes("experiencia") || transcriptText.includes("seguridad") || transcriptText.includes("militar")) {
          extractedInfo.security_exp = transcriptText.includes("si tiene experiencia") || 
                                       transcriptText.includes("tiene experiencia") ? 
                                       "SI" : "NO";
        }
        
        // Extract Sedena ID if mentioned
        const sedenaMatches = transcriptText.match(/sedena.*?(\w+\d+)/i) || 
                             transcriptText.match(/credencial.*?(\w+\d+)/i);
        if (sedenaMatches && sedenaMatches[1]) {
          extractedInfo.sedena_id = sedenaMatches[1];
        }
      }
    }

    // Use lead data if available, fallback to extracted info
    const validatedLeadData = {
      lead_id: leadData?.id,
      car_brand: extractedInfo.car_brand,
      car_model: extractedInfo.car_model,
      car_year: extractedInfo.car_year,
      custodio_name: leadData?.nombre || extractedInfo.custodio_name,
      security_exp: leadData?.experienciaseguridad || extractedInfo.security_exp,
      sedena_id: extractedInfo.sedena_id,
      call_id: callId,
      vapi_call_data: callLogData
    };

    // Save to validated_leads table
    const { data: insertData, error: insertError } = await supabase
      .from("validated_leads")
      .upsert(
        validatedLeadData, 
        { onConflict: 'id', ignoreDuplicates: false }
      )
      .select();

    if (insertError) {
      console.error("Error inserting validated lead:", insertError);
      return new Response(JSON.stringify({ error: "Error saving validated lead", details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "VAPI call data processed successfully",
        validated_lead_id: insertData?.[0]?.id,
        linked_lead_id: leadData?.id
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
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
