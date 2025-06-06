
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check if policies already exist to avoid duplicate creation
    const { data: existingPolicies, error: policyCheckError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `SELECT * FROM pg_policies WHERE tablename = 'gps_installations'`
      });

    if (policyCheckError) {
      console.error("Error checking existing policies:", policyCheckError);
      throw new Error("Failed to check existing policies");
    }

    // Check if our insert policy already exists
    const insertPolicyExists = existingPolicies && existingPolicies.some(policy => 
      policy.policyname === "Enable insert access for authenticated users"
    );

    if (!insertPolicyExists) {
      // Create RLS policy for inserting into gps_installations
      const { error: createPolicyError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE POLICY "Enable insert access for authenticated users"
          ON public.gps_installations
          FOR INSERT
          WITH CHECK (true);
        `
      });

      if (createPolicyError) {
        console.error("Error creating RLS policy:", createPolicyError);
        throw new Error("Failed to create RLS policy");
      }
    }
    
    // Check if RLS is enabled on the table
    const { data: rlsStatus, error: rlsCheckError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `SELECT relrowsecurity FROM pg_class WHERE relname = 'gps_installations'`
    });
    
    if (rlsCheckError) {
      console.error("Error checking RLS status:", rlsCheckError);
    } else if (rlsStatus && rlsStatus[0] && !rlsStatus[0].relrowsecurity) {
      // Enable RLS on the table if not already enabled
      const { error: enableRlsError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE public.gps_installations ENABLE ROW LEVEL SECURITY;`
      });
      
      if (enableRlsError) {
        console.error("Error enabling RLS:", enableRlsError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "RLS policies configured successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in setup-rls-policies function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
