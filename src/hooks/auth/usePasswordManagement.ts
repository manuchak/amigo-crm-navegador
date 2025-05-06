
import { useState } from 'react';
import { toast } from 'sonner';
import { resetPassword as resetPasswordLocal } from '@/utils/auth';

export const usePasswordManagement = () => {
  const [loading, setLoading] = useState(false);

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      resetPasswordLocal(email);
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
      setLoading(false);
    }
  };

  return {
    resetPassword,
    loading
  };
};
