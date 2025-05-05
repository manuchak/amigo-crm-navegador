
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
  
  // This is the target email we want to set as owner
  const targetEmail = 'manuel.chacon@detectasecurity.io';

  try {
    console.log(`Starting process to set ${targetEmail} as owner using direct SQL`);
    
    // 1. First verify the user exists in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error listing users:", authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to access users', details: authError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Find the user by email
    const targetUser = authData.users.find(user => 
      user.email?.toLowerCase() === targetEmail.toLowerCase()
    );
    
    if (!targetUser) {
      console.error(`User ${targetEmail} not found in auth.users`);
      return new Response(
        JSON.stringify({ success: false, error: `User ${targetEmail} not found` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    console.log(`Found user ${targetEmail} with ID: ${targetUser.id}`);
    
    // 2. Direct database operation using the service role client 
    // First make sure user exists in profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: targetUser.id,
        email: targetEmail,
        display_name: targetUser.user_metadata.display_name || 'Manuel Chacon'
      }, { onConflict: 'id' })
      .select();
    
    if (profileError) {
      console.error("Error ensuring profile exists:", profileError);
      // Continue anyway - the user role is more important
    } else {
      console.log("Profile ensured for user:", profileData);
    }
    
    // 3. Delete any existing role for this user
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', targetUser.id);
    
    if (deleteError) {
      console.error("Error removing existing user roles:", deleteError);
      // Continue anyway
    } else {
      console.log("Removed any existing roles for user");
    }
    
    // 4. Insert the owner role
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: targetUser.id,
        role: 'owner',
        assigned_by: targetUser.id  // Self-assigned
      })
      .select();
    
    if (insertError) {
      console.error("Error inserting owner role:", insertError);
      
      // If insert failed, try a different approach with direct SQL
      try {
        const { data: directSqlData, error: directSqlError } = await supabaseAdmin.rpc(
          'execute_sql',
          { 
            sql_query: `
              DELETE FROM user_roles WHERE user_id = '${targetUser.id}';
              INSERT INTO user_roles (user_id, role, assigned_by) 
              VALUES ('${targetUser.id}', 'owner', '${targetUser.id}');
            `
          }
        );
        
        if (directSqlError) {
          throw directSqlError;
        }
        
        console.log("Direct SQL execution result:", directSqlData);
      } catch (sqlError) {
        console.error("SQL execution approach also failed:", sqlError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to assign owner role using multiple approaches', 
            details: {
              insertError,
              sqlError
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // 5. Verify email for the user (if needed)
    try {
      await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        email_confirm: true
      });
      console.log("Email verified for user");
    } catch (emailError) {
      console.warn("Could not verify email, but continuing:", emailError);
      // Continue anyway - email verification is less critical than role
    }
    
    console.log("Successfully set owner role");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Owner role assigned successfully', 
        data: insertData || { user_id: targetUser.id, role: 'owner' }
      }),
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
