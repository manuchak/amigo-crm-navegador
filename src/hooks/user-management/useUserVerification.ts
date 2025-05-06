
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { verifyUserEmail as localVerifyUserEmail, findUserByEmail, setAsVerifiedOwner, createUser } from '@/utils/auth';
import { UserManagementHookProps } from './types';

export const useUserVerification = ({ setLoading, refreshUserData }: UserManagementHookProps) => {
  const verifyEmail = async (uid: string): Promise<{ success: boolean; error?: any }> => {
    setLoading(uid);
    try {
      console.log(`Verifying email for user ${uid}`);
      // Try to use the Supabase RPC function first
      try {
        const { error: rpcError } = await supabase.rpc('verify_user_email', {
          target_user_id: uid
        });
        
        if (rpcError) {
          console.error('Error using RPC for email verification:', rpcError);
          // Fall back to local implementation
          localVerifyUserEmail(uid);
        } else {
          console.log('Email verified successfully via Supabase RPC');
        }
      } catch (rpcErr) {
        console.error('Could not use RPC method, falling back to local implementation:', rpcErr);
        // Mark email as verified in local storage
        localVerifyUserEmail(uid);
      }
      
      // Additionally update the profiles table
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', uid);
          
        if (updateError) {
          console.error('Error updating profile email_verified status:', updateError);
        }
      } catch (profileErr) {
        console.error('Error updating profile:', profileErr);
      }
      
      toast.success('Correo electrónico verificado con éxito');
      await refreshUserData();
      return { success: true };
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Error al verificar el correo electrónico');
      return { success: false, error };
    } finally {
      setLoading(null);
    }
  };
  
  const setUserAsVerifiedOwner = async (email: string, showNotification: boolean = true): Promise<{ success: boolean; error?: any }> => {
    if (!email) {
      console.error("No email provided for setUserAsVerifiedOwner");
      return { success: false, error: "No email provided" };
    }

    setLoading(email);
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
        } else if (profileError) {
          console.error('Error searching for user in Supabase:', profileError);
        } else {
          console.log(`User with email ${email} not found in Supabase`);
        }
      } catch (supabaseError) {
        console.error('Error searching user in Supabase:', supabaseError);
      }
      
      // If not found in Supabase, check local storage
      if (!userUid) {
        const user = await findUserByEmail(email);
        
        if (user && user.uid) {
          userUid = user.uid;
          console.log(`User found in local storage with id: ${userUid}`);
        } else {
          console.log(`User with email ${email} not found in local storage either`);
        }
      }
      
      // If user exists in either location
      if (userUid) {
        console.log(`Setting user ${email} (${userUid}) as owner...`);
        // Try to update role via Supabase RPC first
        try {
          const { error: rpcError } = await supabase.rpc('update_user_role', {
            target_user_id: userUid,
            new_role: 'owner'
          });
          
          if (!rpcError) {
            console.log(`Role updated to owner for user ${email} via Supabase RPC`);
          } else {
            console.error('RPC error when updating role:', rpcError);
            // Fall back to local implementation
            setAsVerifiedOwner(userUid);
            console.log(`Role updated to owner for user ${email} via local storage`);
          }
        } catch (rpcErr) {
          console.error('Exception when calling RPC to update role:', rpcErr);
          // Fall back to local implementation
          setAsVerifiedOwner(userUid);
          console.log(`Role updated to owner for user ${email} via local storage after RPC failure`);
        }
      } else {
        console.log(`User ${email} not found, creating new user`);
        
        // Create a new user with default password
        const userData = await createUser(email, 'Custodios2024', `Admin ${email.split('@')[0]}`);
        
        if (userData && userData.uid) {
          // Set as verified owner
          setAsVerifiedOwner(userData.uid);
          console.log(`New user created and set as owner: ${email}`);
        } else {
          throw new Error("Failed to create user");
        }
      }
      
      // Only show success notification if explicitly requested
      if (showNotification) {
        toast.success(`Usuario ${email} configurado como propietario verificado`);
      }
      
      await refreshUserData();
      return { success: true };
    } catch (error: any) {
      console.error('Error setting user as verified owner:', error);
      toast.error('Error al configurar el usuario como propietario verificado: ' + (error.message || 'Error desconocido'));
      return { success: false, error };
    } finally {
      setLoading(null);
    }
  };

  return { verifyEmail, setUserAsVerifiedOwner };
};
