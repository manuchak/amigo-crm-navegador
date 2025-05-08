
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse the request body
    const { role } = await req.json();
    
    if (!role) {
      return new Response(
        JSON.stringify({ error: 'Role parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get users from profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, display_name');
      
    if (profilesError) {
      throw profilesError;
    }
    
    // Get users with the specified role
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', role);
      
    if (rolesError) {
      throw rolesError;
    }
    
    // Match profiles with roles
    const users = profilesData
      .filter(profile => rolesData.some(roleData => roleData.user_id === profile.id))
      .map(profile => {
        const roleData = rolesData.find(r => r.user_id === profile.id);
        return {
          uid: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          role: roleData?.role || 'unknown'
        };
      });
    
    // Return the users with the specified role
    return new Response(
      JSON.stringify(users),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
