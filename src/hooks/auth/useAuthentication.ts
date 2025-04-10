
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { createUser, loginUser, findUserByEmail, setAsVerifiedOwner } from '@/utils/localAuthStorage';
import { SPECIAL_USERS } from './constants';

export const useAuthentication = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Sign in functionality
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = loginUser(email, password);
      
      // Special case for manuel.chacon
      if (email.toLowerCase() === SPECIAL_USERS.SYSTEM_OWNER) {
        try {
          const user = findUserByEmail(email);
          if (user && user.uid) {
            setAsVerifiedOwner(user.uid);
          }
        } catch (specialUserError) {
          console.error('Error setting special user permissions:', specialUserError);
          // Continue login even if special permissions failed
        }
      }
      
      setUserData(userData);
      toast.success('Sesión iniciada con éxito');
      return userData;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up functionality
  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Create user - using simplified local storage approach
      const userData = createUser(email, password, displayName);
      setUserData(userData);
      
      // Special case for manuel.chacon
      if (email.toLowerCase() === SPECIAL_USERS.SYSTEM_OWNER) {
        try {
          if (userData && userData.uid) {
            setAsVerifiedOwner(userData.uid);
          }
        } catch (specialUserError) {
          console.error('Error setting special user permissions:', specialUserError);
          // Continue login even if special permissions failed
        }
      }
      
      toast.success('Cuenta creada con éxito');
      return userData;
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Error al crear la cuenta');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    signIn,
    signUp,
  };
};
