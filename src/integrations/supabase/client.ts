
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
    console.log("Checking for owner role from Supabase...");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.log("No authenticated user found");
      return false;
    }
    
    console.log("Found authenticated user:", userData.user.email);
    
    const { data, error } = await supabase.rpc('get_user_role', {
      user_uid: userData.user.id
    });
    
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    const isOwner = data === 'owner';
    console.log(`User role from Supabase: ${data}, is owner: ${isOwner}`);
    return isOwner;
  } catch (error) {
    console.error('Error checking for owner role:', error);
    
    // Fallback to localStorage if there's an error with Supabase
    try {
      if (typeof window !== 'undefined') {
        const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
        if (userData && userData.role === 'owner') {
          console.log('Owner role verified from localStorage fallback');
          return true;
        }
      }
    } catch (localStorageError) {
      console.error('Error checking localStorage for owner role:', localStorageError);
    }
    
    return false;
  }
};
