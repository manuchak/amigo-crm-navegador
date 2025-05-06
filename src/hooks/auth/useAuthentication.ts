
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { createUser, loginUser, findUserByEmail } from '@/utils/auth';

export const useAuthentication = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Sign in functionality
  const signIn = async (email: string, password: string): Promise<UserData | null> => {
    setLoading(true);
    try {
      console.log('Attempting to sign in with email:', email);
      
      // First check if this user exists
      const userExists = await findUserByEmail(email);
      if (!userExists) {
        console.error('User not found:', email);
        throw new Error('auth/user-not-found');
      }
      
      const userData = await loginUser(email, password);
      setUserData(userData);
      
      // Log successful login
      console.log('User logged in successfully:', userData.email);
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
  const signUp = async (email: string, password: string, displayName: string): Promise<UserData | null> => {
    setLoading(true);
    try {
      console.log('Attempting to create user with email:', email);
      
      // Check if user already exists before trying to create
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        throw new Error('auth/email-already-in-use');
      }
      
      const userData = await createUser(email, password, displayName);
      setUserData(userData);
      
      // Log successful registration
      console.log('User created successfully:', userData.email);
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
