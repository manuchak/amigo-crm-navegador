
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { getCurrentUser } from '@/utils/localAuthStorage';

export const useAuthCore = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const userData = getCurrentUser();
      if (userData) {
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Error al actualizar los datos de usuario');
    }
  };

  // Basic signOut functionality
  const signOut = async () => {
    try {
      localStorage.removeItem('current_user');
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
