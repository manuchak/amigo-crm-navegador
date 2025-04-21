
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./lib/cors.ts";
import { createSupabaseClient } from "./lib/supabase.ts";
import { 
  processWebhookData, 
  handleTestConnection 
} from "./handlers/webhookHandler.ts";

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

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

    // Check if this is a test connection
    if (webhookData.call_id === "test-connection" || webhookData.test === true) {
      return handleTestConnection(corsHeaders);
    }

    // Process the webhook data
    return await processWebhookData(webhookData, supabase, corsHeaders);
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
