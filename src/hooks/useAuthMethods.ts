
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';
import { mapUserData } from './useSupabaseMappings';

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
      // Set a timeout to prevent hanging - longer timeout (30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('La conexión tardó demasiado tiempo, por favor inténtelo de nuevo')), 30000)
      );
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Race between the auth request and the timeout
      const { data, error } = await Promise.race([
        authPromise,
        timeoutPromise.then(() => {
          throw new Error('Tiempo de espera agotado');
        })
      ]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

      if (error) {
        let errorMessage = 'Error al iniciar sesión';
        if (error.message.includes('Invalid login')) {
          errorMessage = 'Correo o contraseña incorrectos';
        } else if (error.message.includes('email')) {
          errorMessage = 'El correo electrónico no es válido';
        } else if (error.message.includes('password')) {
          errorMessage = 'La contraseña es incorrecta';
        }
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error('No se pudo iniciar sesión, por favor inténtelo de nuevo');
      }

      const mappedUserData = await mapUserData(data.user);
      
      if (!mappedUserData) {
        throw new Error('Error al obtener datos del usuario');
      }
      
      // Special case for manuel.chacon
      if (email.toLowerCase() === 'manuel.chacon@detectasecurity.io') {
        try {
          // Ensure this user always has owner role
          await supabase.rpc('update_user_role', {
            target_user_id: data.user.id,
            new_role: 'owner'
          });
          
          // Ensure email is verified
          await supabase.rpc('verify_user_email', {
            target_user_id: data.user.id
          });
          
          // Refresh user data to get updated role
          const refreshedData = await mapUserData(data.user);
          if (refreshedData) {
            setUserData(refreshedData);
          }
        } catch (specialUserError) {
          console.error('Error setting special user permissions:', specialUserError);
          // Continue login even if special permissions failed
        }
      } else {
        setUserData(mappedUserData);
      }
      
      toast.success('Sesión iniciada con éxito');
      return mappedUserData;
    } catch (error: any) {
      console.error('Error signing in:', error);
      setLoading(false);
      throw error; // Rethrow to be handled by the form
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Create user with email confirmation (auto-confirmed for now)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          // Use our current domain for the redirect
          emailRedirectTo: `${window.location.origin}/verify-confirmation`
        },
      });

      if (error) {
        let errorMessage = 'Error al crear la cuenta';
        if (error.message.includes('already')) {
          errorMessage = 'El correo electrónico ya está en uso.';
        }
        throw new Error(errorMessage);
      }

      // Manually create profile record since we're not using triggers
      if (data.user) {
        // Create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          display_name: displayName,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });
        
        // Set initial role
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'unverified'
        });
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
