
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the supabase client with admin privileges
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    console.log("Setting owner role for manuel.chacon@detectasecurity.io");
    
    // 1. First, find the user ID for manuel.chacon@detectasecurity.io
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', 'manuel.chacon@detectasecurity.io')
      .maybeSingle();

    if (userError) {
      console.error("Error finding user:", userError);
      return new Response(
        JSON.stringify({ success: false, error: 'User not found', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (!userData || !userData.id) {
      console.error("User not found in profiles table");
      return new Response(
        JSON.stringify({ success: false, error: 'User not found in profiles' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const userId = userData.id;
    console.log("Found user with ID:", userId);

    // 2. Delete any existing role for this user
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error("Error deleting existing roles:", deleteError);
      // Continue anyway - if there's no role, the delete would fail but we can still add a new role
    }

    // 3. Add the owner role
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'owner'
      })
      .select();

    if (insertError) {
      console.error("Error inserting owner role:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to assign owner role', details: insertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 4. Verify the user's email (if needed)
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true
      });
      console.log("Email verified for user");
    } catch (emailError) {
      console.warn("Could not verify email, but continuing:", emailError);
    }

    console.log("Successfully set owner role");
    return new Response(
      JSON.stringify({ success: true, message: 'Owner role assigned successfully', data: insertData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
