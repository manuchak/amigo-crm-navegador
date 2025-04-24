
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { verifyUserEmail, findUserByEmail, setAsVerifiedOwner } from '@/utils/auth';
import { UserManagementHookProps } from './types';

export const useUserVerification = ({ setLoading, refreshUserData }: UserManagementHookProps) => {
  const verifyEmail = async (uid: string): Promise<{ success: boolean; error?: any }> => {
    setLoading(true);
    try {
      // Try to use the Supabase RPC function first
      try {
        const { error: rpcError } = await supabase.rpc('verify_user_email', {
          target_user_id: uid
        });
        
        if (rpcError) {
          console.error('Error using RPC for email verification:', rpcError);
          // Fall back to local implementation
          verifyUserEmail(uid);
        } else {
          console.log('Email verified successfully via Supabase RPC');
        }
      } catch (rpcErr) {
        console.error('Could not use RPC method, falling back to local implementation:', rpcErr);
        // Mark email as verified in local storage
        verifyUserEmail(uid);
      }
      
      toast.success('Correo electrónico verificado con éxito');
      await refreshUserData();
      return { success: true };
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Error al verificar el correo electrónico');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const setUserAsVerifiedOwner = async (email: string, showNotification: boolean = true) => {
    if (!email) {
      console.error("No email provided for setUserAsVerifiedOwner");
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting to set user ${email} as verified owner`);
      
      // First try to find the user in Supabase
      let userUid: string | undefined;
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle();
        
        if (profileData && !profileError) {
          userUid = profileData.id;
          console.log(`User found in Supabase with id: ${userUid}`);
        }
      } catch (supabaseError) {
        console.error('Error searching user in Supabase:', supabaseError);
      }
      
      // If not found in Supabase, check local storage
      if (!userUid) {
        const user = findUserByEmail(email);
        
        if (user && user.uid) {
          userUid = user.uid;
          console.log(`User found in local storage with id: ${userUid}`);
        }
      }
      
      if (userUid) {
        setAsVerifiedOwner(userUid);
        console.log(`Role updated to owner for user ${email}`);
      } else {
        throw new Error("User not found");
      }
      
      // Only show success notification if explicitly requested
      if (showNotification) {
        toast.success(`Usuario ${email} configurado como propietario verificado`);
      }
      
      await refreshUserData();
    } catch (error: any) {
      console.error('Error setting user as verified owner:', error);
      toast.error('Error al configurar el usuario como propietario verificado: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return {
    verifyEmail,
    setUserAsVerifiedOwner
  };
};
