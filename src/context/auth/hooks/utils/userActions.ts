
import { supabase } from '@/integrations/supabase/client';

export const updateLastLogin = async (userId: string) => {
  try {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};
