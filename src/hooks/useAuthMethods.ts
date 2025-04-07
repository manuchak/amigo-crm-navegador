
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserData } from '@/types/auth';
import { ProfileData, UserRoleData, mapUserData } from './useSupabaseMappings';

export const useAuthMethods = (
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
            .update({ last_login: new Date().toISOString() })
            .eq('id', session.user.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Error al actualizar los datos de usuario');
    }
  };

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Correo o contraseña incorrectos';
        throw new Error(errorMessage);
      }

      const mappedUserData = await mapUserData(data.user);
      setUserData(mappedUserData);
      
      toast.success('Sesión iniciada con éxito');
      return mappedUserData;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) {
        let errorMessage = 'Error al crear la cuenta';
        if (error.message.includes('already')) {
          errorMessage = 'El correo electrónico ya está en uso.';
        }
        throw new Error(errorMessage);
      }

      const mappedUserData = await mapUserData(data.user);
      setUserData(mappedUserData);
      
      toast.success('Cuenta creada con éxito. Por favor, verifica tu correo electrónico.');
      return mappedUserData;
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Error al crear la cuenta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

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

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      toast.success('Se ha enviado un correo para restablecer la contraseña');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      toast.error('Error al enviar el correo de restablecimiento');
    } finally {
      setLoading(false);
    }
  };

  return {
    refreshUserData,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
};
