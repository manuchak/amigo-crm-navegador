
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = 'https://beefjsdgrdeiymzxwxru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
});

// Helper function to check if the current user has the owner role
export const checkForOwnerRole = async (): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;
    
    const { data, error } = await supabase.rpc('get_user_role', {
      user_uid: userData.user.id
    });
    
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return data === 'owner';
  } catch (error) {
    console.error('Error checking for owner role:', error);
    return false;
  }
};
