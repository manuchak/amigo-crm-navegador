
import { supabase } from '@/integrations/supabase/client';

export async function updateLastLogin(userId: string) {
  try {
    console.log('Updating last login for user:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        last_login: new Date().toISOString(),
        last_activity: new Date().toISOString(), // También actualizamos la última actividad
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating last login:', error);
    } else {
      console.log('Last login updated successfully');
    }
  } catch (err) {
    console.error('Exception updating last login:', err);
  }
}

// Función para registrar acceso a página
export async function logPageAccess(userId: string, pagePath: string) {
  if (!userId) return;
  
  try {
    console.log(`Logging access to page ${pagePath} for user ${userId}`);
    
    // Actualizar la última actividad del usuario
    const { error } = await supabase
      .from('profiles')
      .update({
        last_activity: new Date().toISOString(),
        last_page_accessed: pagePath
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error logging page access:', error);
    }
  } catch (err) {
    console.error('Exception logging page access:', err);
  }
}
