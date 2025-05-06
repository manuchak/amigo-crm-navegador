
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = 'https://beefjsdgrdeiymzxwxru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage, // Ensure we're using localStorage for session persistence
  },
});

// Enhanced helper function to check if the current user has the owner role
export const checkForOwnerRole = async (): Promise<boolean> => {
  try {
    console.log("Checking for owner role from Supabase...");
    
    // First, get the current authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error retrieving authenticated user:", userError);
      return false;
    }
    
    if (!userData.user) {
      console.log("No authenticated user found");
      return false;
    }
    
    console.log("Found authenticated user:", userData.user.email);
    
    // Try to get the profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else if (profileData) {
      console.log("Found profile for user:", profileData.email);
    } else {
      console.log("No profile found for user");
    }
    
    // Query user_roles table directly to check for the owner role
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'owner')
      .maybeSingle();
    
    if (rolesError) {
      console.log("No owner role found in user_roles table:", rolesError);
      
      // Fallback to RPC function if direct query fails
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_role', {
          user_uid: userData.user.id
        });
        
        if (rpcError) {
          console.error('Error checking user role via RPC:', rpcError);
          return false;
        }
        
        const isOwner = rpcData === 'owner';
        console.log(`User role from RPC: ${rpcData}, is owner: ${isOwner}`);
        return isOwner;
      } catch (rpcFallbackError) {
        console.error('Error in RPC fallback:', rpcFallbackError);
        return false;
      }
    }
    
    // If we got a successful result from the direct query
    const isOwner = rolesData && rolesData.role === 'owner';
    console.log(`User is owner (from direct query): ${isOwner}`);
    return isOwner;
  } catch (error) {
    console.error('Error checking for owner role:', error);
    return false;
  }
};
