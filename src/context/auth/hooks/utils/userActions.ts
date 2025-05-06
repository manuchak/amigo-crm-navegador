
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates the last login timestamp for a user
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('profiles')
      .update({ 
        last_login: new Date().toISOString() 
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

/**
 * Logs a page access event for analytics
 */
export const logPageAccess = async (userId: string, page: string): Promise<void> => {
  try {
    // This could be implemented later to track page views in a dedicated table
    console.log(`User ${userId} accessed page ${page}`);
  } catch (error) {
    console.error('Error logging page access:', error);
  }
};
