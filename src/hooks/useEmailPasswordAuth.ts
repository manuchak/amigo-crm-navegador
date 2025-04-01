
import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { createOrUpdateUser } from '@/utils/authUtils';
import { UserData } from '@/types/auth';
import { toast } from 'sonner';

export const useEmailPasswordAuth = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
) => {
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting to create user with email:', email);
      
      // Create user account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      console.log('User created successfully, updating profile...');
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Create user in database
      const userData = await createOrUpdateUser({
        ...user,
        displayName
      });
      
      setUserData(userData);
      
      toast.success('Cuenta creada con éxito. Por favor, verifica tu correo electrónico.');
      return user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      let errorMessage = 'Error al crear la cuenta';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      } else if (error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        errorMessage = 'Error de Firebase: La clave API no es válida. Por favor, contacte al administrador.';
      } else if (error.message && error.message.includes('API key not valid')) {
        errorMessage = 'Error de Firebase: La clave API no es válida. Por favor, contacte al administrador.';
      } else if (error.code) {
        errorMessage = `Error: ${error.code}`;
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      const userData = await createOrUpdateUser(user);
      setUserData(userData);
      
      toast.success('Sesión iniciada con éxito');
      return user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Correo o contraseña incorrectos';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intente más tarde.';
      } else if (error.code === 'auth/user-disabled') {
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
      await sendPasswordResetEmail(auth, email);
      toast.success('Se ha enviado un correo para restablecer la contraseña');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      let errorMessage = 'Error al enviar el correo de restablecimiento';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No existe una cuenta con este correo electrónico.';
      } else if (error.code === 'auth/invalid-email') {
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
