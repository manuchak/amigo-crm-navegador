
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserData } from '@/types/auth';
import { PASSWORD_RESET_REDIRECT_URL } from './constants';
import { handleAuthError } from './utils';

export const usePasswordManagement = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      // Get the current domain for redirects
      const redirectURL = `${window.location.origin}${PASSWORD_RESET_REDIRECT_URL}`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectURL,
      });
      
      if (error) throw error;
      toast.success('Se ha enviado un correo para restablecer la contraseña');
    } catch (error) {
      handleAuthError(error, 'Error sending password reset email');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    resetPassword
  };
};
