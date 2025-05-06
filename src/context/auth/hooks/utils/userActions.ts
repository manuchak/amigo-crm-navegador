
import { supabase } from '@/integrations/supabase/client';

export async function updateLastLogin(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        last_login: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating last login:', error);
    }
  } catch (err) {
    console.error('Exception updating last login:', err);
  }
}
