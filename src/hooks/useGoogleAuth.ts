
import { useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { createOrUpdateUser } from '@/utils/authUtils';
import { UserData } from '@/types/auth';
import { toast } from 'sonner';

export const useGoogleAuth = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
) => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando sesión con Google...");
      
      // Verificar si auth está inicializado
      if (!auth) {
        console.error("Firebase Auth no está inicializado");
        toast.error("Error de configuración de Firebase. Contacte al administrador.");
        return;
      }

      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set language
      auth.languageCode = 'es';
      
      const result = await signInWithPopup(auth, provider);
      console.log("Resultado de autenticación:", result);
      const user = result.user;
      
      const userData = await createOrUpdateUser(user);
      setUserData(userData);
      
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        toast.info('Se envió un correo de verificación a tu dirección de email');
      }
      
      if (userData.role === 'unverified' && user.emailVerified) {
        await updateDoc(doc(db, 'users', user.uid), {
          role: 'pending'
        });
        setUserData({...userData, role: 'pending'});
        toast.info('Tu cuenta está pendiente de aprobación por un administrador');
      }
      
      if (userData.role === 'pending') {
        toast.info('Tu cuenta está pendiente de aprobación por un administrador');
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Manejo detallado de errores
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        console.error("API Key inválida:", error);
        errorMessage = 'Error de configuración de Firebase. Contacte al administrador.';
      } else if (error.code === 'auth/invalid-api-key') {
        console.error("API Key inválida:", error);
        errorMessage = 'Error de configuración de Firebase. Contacte al administrador.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Inicio de sesión cancelado por el usuario';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes para este sitio.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Operación cancelada. Inténtelo de nuevo.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de red. Verifique su conexión a internet.';
      } else if (error.code === 'auth/internal-error') {
        console.error("Error interno de Firebase:", error);
        errorMessage = 'Error interno del servidor. Inténtelo más tarde.';
      } else if (error.code) {
        console.error(`Error de Firebase (${error.code}):`, error);
        errorMessage = `Error: ${error.code}`;
      } else if (error.message) {
        console.error("Error específico:", error.message);
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, isLoading };
};
