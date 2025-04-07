
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { createTimeoutPromise, getAuthErrorMessage, handleAuthError } from './utils';
import { mapUserData } from '../useSupabaseMappings';
import { useAuthCore } from './useAuthCore';
import { SPECIAL_USERS } from './constants';

export const useAuthentication = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { refreshUserData } = useAuthCore(setUserData, setLoading);
  
  // Sign in functionality
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Set a timeout to prevent hanging - longer timeout (30 seconds)
      const timeoutPromise = createTimeoutPromise(30000);
      
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
        throw new Error(getAuthErrorMessage(error));
      }

      if (!data.user) {
        throw new Error('No se pudo iniciar sesión, por favor inténtelo de nuevo');
      }

      const mappedUserData = await mapUserData(data.user);
      
      if (!mappedUserData) {
        throw new Error('Error al obtener datos del usuario');
      }
      
      // Special case for manuel.chacon
      if (email.toLowerCase() === SPECIAL_USERS.SYSTEM_OWNER) {
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
      throw error; // Rethrow to be handled by the form
    } finally {
      setLoading(false);
    }
  };

  // Sign up functionality
  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Get the current domain for redirects
      const redirectURL = `${window.location.origin}/verify-confirmation`;
      
      // Create user with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: redirectURL
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
  
  return {
    signIn,
    signUp,
  };
};
