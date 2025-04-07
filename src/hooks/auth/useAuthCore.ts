
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { createTimeoutPromise, getAuthErrorMessage } from './utils';
import { mapUserData } from '../useSupabaseMappings';

export const useAuthCore = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mappedUserData = await mapUserData(session.user);
        if (mappedUserData) {
          setUserData(mappedUserData);
          
          // Update last login timestamp
          await supabase
            .from('profiles')
            .update({ 
              last_login: new Date().toISOString() 
            })
            .eq('id', session.user.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Error al actualizar los datos de usuario');
    }
  };

  // Basic signOut functionality
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserData(null);
      toast.success('Sesión cerrada con éxito');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return {
    refreshUserData,
    signOut
  };
};
