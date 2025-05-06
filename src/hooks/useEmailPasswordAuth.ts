
import { useState } from 'react';
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { 
  createUser, 
  loginUser, 
  resetPassword as resetPasswordLocal
} from '@/utils/auth';

export const useEmailPasswordAuth = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
) => {
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting to create user with email:', email);
      
      // Create user account in local storage
      const userData = await createUser(email, password, displayName);
      
      setUserData(userData);
      
      toast.success('Cuenta creada con éxito. Por favor, verifica tu correo electrónico.');
      return userData;
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      let errorMessage = 'Error al crear la cuenta';
      
      if (error.message === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso.';
      } else if (error.message === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      } else if (error.message === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUserData(userData);
      
      toast.success('Sesión iniciada con éxito');
      return userData;
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.message === 'auth/user-not-found' || error.message === 'auth/wrong-password') {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (error.message === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intente más tarde.';
      } else if (error.message === 'auth/user-disabled') {
        errorMessage = 'Esta cuenta ha sido deshabilitada.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await resetPasswordLocal(email);
      toast.success('Se ha enviado un correo para restablecer la contraseña');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      let errorMessage = 'Error al enviar el correo de restablecimiento';
      
      if (error.message === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico.';
      } else if (error.message === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    resetPassword,
    isLoading
  };
};
