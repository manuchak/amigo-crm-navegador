
import { toast } from 'sonner';
import { UserData } from '@/types/auth';
import { resetPassword as resetPasswordLocal } from '@/utils/auth';
import { handleAuthError } from './utils';

export const usePasswordManagement = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      resetPasswordLocal(email);
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
