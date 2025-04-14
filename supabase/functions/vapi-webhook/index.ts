
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
        
        // Check if this is a manual test
        if (callId === "test-connection") {
          console.log("Test connection request detected");
          return new Response(JSON.stringify({ 
            success: true, 
            message: "Test connection successful. No call logs were processed." 
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "Call log not found", callId }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // If found by log_id, use this data instead
      callLogData = altCallLogData;
      console.log("Found call log by log_id");
    }

    // Log full call data for debugging
    console.log("Call log data:", JSON.stringify(callLogData, null, 2));

    // Extract phone number to link with leads table - try multiple potential fields
    const phoneNumber = callLogData.customer_number || 
                        callLogData.caller_phone_number || 
                        callLogData.phone_number ||
                        webhookData.phone_number;

    if (!phoneNumber) {
      console.warn("No phone number found in call log or webhook data");
      return new Response(JSON.stringify({ 
        warning: "No phone number found to link with leads",
        call_data: callLogData
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format phone number for search (removing non-digits)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const lastTenDigits = formattedPhone.slice(-10);
    console.log(`Searching for lead with phone number: ${lastTenDigits} (from ${phoneNumber})`);
    
    // Look up lead by phone number - improved search with leading wildcard
    console.log("Querying leads table for phone number:", lastTenDigits);
    const { data: leadData, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .or(`telefono.ilike.%${lastTenDigits}`)
      .maybeSingle();

    if (leadError) {
      console.error("Error fetching lead:", leadError);
    }

    if (leadData) {
      console.log("Found matching lead:", JSON.stringify(leadData, null, 2));
    } else {
      console.warn("No matching lead found for phone number:", phoneNumber);
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
      
      // Check if transcript is an object, array, or string
      const transcriptData = typeof transcript === 'string' 
        ? JSON.parse(transcript) 
        : transcript;
      
      if (transcriptData) {
        // Convert to string for pattern matching - handles both array and object formats
        const transcriptText = JSON.stringify(transcriptData).toLowerCase();
        
        // Extract car information with improved patterns
        if (transcriptText.includes("modelo") || transcriptText.includes("vehiculo") || 
            transcriptText.includes("coche") || transcriptText.includes("carro")) {
          
          // Extract car brand
          const carBrandPatterns = [
            /marca.*?(\w+)/i,
            /tengo un (\w+)/i,
            /mi (\w+)/i
          ];
          
          for (const pattern of carBrandPatterns) {
            const matches = transcriptText.match(pattern);
            if (matches && matches[1]) {
              extractedInfo.car_brand = matches[1].charAt(0).toUpperCase() + matches[1].slice(1);
              break;
            }
          }
          
          // Extract car model
          const carModelPatterns = [
            /modelo.*?(\w+)/i,
            /un (\w+) del/i,
            /(\w+) del año/i
          ];
          
          for (const pattern of carModelPatterns) {
            const matches = transcriptText.match(pattern);
            if (matches && matches[1]) {
              extractedInfo.car_model = matches[1].charAt(0).toUpperCase() + matches[1].slice(1);
              break;
            }
          }
          
          // Extract car year
          const carYearPatterns = [
            /año.*?(\d{4})/i,
            /del (\d{4})/i,
            /modelo (\d{4})/i
          ];
          
          for (const pattern of carYearPatterns) {
            const matches = transcriptText.match(pattern);
            if (matches && matches[1]) {
              extractedInfo.car_year = parseInt(matches[1]);
              break;
            }
          }
        }
        
        // Extract security experience info
        if (transcriptText.includes("experiencia") || transcriptText.includes("seguridad") || 
            transcriptText.includes("militar") || transcriptText.includes("trabajado")) {
          
          extractedInfo.security_exp = 
            transcriptText.includes("si tengo experiencia") || 
            transcriptText.includes("tengo experiencia") || 
            transcriptText.includes("he trabajado") ? 
            "SI" : "NO";
        }
        
        // Extract name if available
        const namePatterns = [
          /me llamo (\w+ \w+)/i,
          /nombre es (\w+ \w+)/i,
          /soy (\w+ \w+)/i
        ];
        
        for (const pattern of namePatterns) {
          const matches = transcriptText.match(pattern);
          if (matches && matches[1]) {
            extractedInfo.custodio_name = matches[1];
            break;
          }
        }
        
        // Extract Sedena ID if mentioned
        const sedenaPatterns = [
          /sedena.*?([a-z0-9]+)/i,
          /credencial.*?([a-z0-9]+)/i,
          /militares.*?([a-z0-9]+)/i
        ];
        
        for (const pattern of sedenaPatterns) {
          const matches = transcriptText.match(pattern);
          if (matches && matches[1]) {
            extractedInfo.sedena_id = matches[1];
            break;
          }
        }
      }
    }

    console.log("Extracted info from transcript:", JSON.stringify(extractedInfo));

    // Use lead data if available, fallback to extracted info
    const validatedLeadData = {
      lead_id: leadData?.id || null,
      car_brand: extractedInfo.car_brand || null,
      car_model: extractedInfo.car_model || null,
      car_year: extractedInfo.car_year || null,
      custodio_name: leadData?.nombre || extractedInfo.custodio_name || null,
      security_exp: leadData?.experienciaseguridad || extractedInfo.security_exp || null,
      sedena_id: extractedInfo.sedena_id || null,
      call_id: callId,
      vapi_call_data: callLogData || null
    };

    console.log("Attempting to save validated lead data:", JSON.stringify(validatedLeadData, null, 2));
    console.log("DB operation: Upserting into validated_leads table");

    // Save to validated_leads table with improved error handling
    const { data: insertData, error: insertError } = await supabase
      .from("validated_leads")
      .upsert(
        validatedLeadData, 
        { onConflict: 'call_id', ignoreDuplicates: false }
      )
      .select();

    if (insertError) {
      console.error("Error inserting validated lead:", insertError);
      console.error("Error details:", JSON.stringify(insertError, null, 2));
      return new Response(JSON.stringify({ error: "Error saving validated lead", details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully inserted data, response:", JSON.stringify(insertData, null, 2));

    // Update the lead in the leads table if we have valid data
    if (leadData?.id && (extractedInfo.car_brand || extractedInfo.car_model || extractedInfo.car_year || extractedInfo.sedena_id)) {
      const leadUpdateData: Record<string, any> = {};
      
      if (extractedInfo.car_brand) leadUpdateData.marca_vehiculo = extractedInfo.car_brand;
      if (extractedInfo.car_model) leadUpdateData.modelovehiculo = extractedInfo.car_model;
      if (extractedInfo.car_year) leadUpdateData.anovehiculo = extractedInfo.car_year;
      if (extractedInfo.security_exp) leadUpdateData.experienciaseguridad = extractedInfo.security_exp;
      
      if (Object.keys(leadUpdateData).length > 0) {
        console.log(`Updating lead ${leadData.id} with data:`, leadUpdateData);
        
        const { error: updateError } = await supabase
          .from("leads")
          .update(leadUpdateData)
          .eq("id", leadData.id);
          
        if (updateError) {
          console.error("Error updating lead with extracted data:", updateError);
        }
      }
    }

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
    console.error("Error stack:", error.stack);
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
