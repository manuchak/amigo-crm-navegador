
import { toast } from 'sonner';
import { UserRole, UserData } from '@/types/auth';
import { SPECIAL_USERS } from './auth/constants';
import {
  createUser,
  findUserByEmail,
  updateUserRole,
  getAllUsers,
  verifyUserEmail,
  setAsVerifiedOwner
} from '@/utils/auth';
import { supabase } from '@/integrations/supabase/client';

export const useUserManagementMethods = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  refreshUserData: () => Promise<void>
) => {
  // User management functions
  const updateUserRoleMethod = async (uid: string, role: UserRole) => {
    setLoading(true);
    try {
      console.log(`Updating role for ${uid} to ${role}`);
      
      // First attempt to use the Supabase RPC function for role updates
      // This is more secure than direct updates as it enforces RLS
      try {
        const { error: rpcError } = await supabase.rpc('update_user_role', {
          target_user_id: uid,
          new_role: role
        });
        
        if (rpcError) {
          console.error('Error using RPC for role update:', rpcError);
          // Fall back to local implementation if RPC fails
          updateUserRole(uid, role);
        } else {
          console.log('Role updated successfully via Supabase RPC');
        }
      } catch (rpcErr) {
        console.error('Could not use RPC method, falling back to local implementation:', rpcErr);
        // Update user role in local storage as fallback
        updateUserRole(uid, role);
      }
      
      toast.success('Rol de usuario actualizado con éxito');
      await refreshUserData();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol de usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllUsersMethod = async (): Promise<UserData[]> => {
    setLoading(true);
    try {
      // Try to get users from Supabase first
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*, user_roles(role)');
        
        if (profilesError) {
          console.error('Error fetching users from Supabase:', profilesError);
          // Fall back to local storage if Supabase query fails
          return getAllUsers();
        }
        
        if (profiles && profiles.length > 0) {
          // Map profiles to UserData format
          return profiles.map(profile => {
            return {
              uid: profile.id,
              email: profile.email,
              displayName: profile.display_name || profile.email,
              photoURL: profile.photo_url || null,
              role: profile.user_roles?.role || 'unverified',
              emailVerified: true, // Assume verified if in database
              createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
              lastLogin: profile.last_login ? new Date(profile.last_login) : new Date(),
            } as UserData;
          });
        }
      } catch (supabaseError) {
        console.error('Error using Supabase for users, falling back:', supabaseError);
      }
      
      // Get users from local storage as fallback
      const users = getAllUsers();
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const verifyEmailMethod = async (uid: string) => {
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
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Error al verificar el correo electrónico');
    } finally {
      setLoading(false);
    }
  };
  
  const setUserAsVerifiedOwnerMethod = async (email: string, showNotification: boolean = true) => {
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
      
      // If user exists in either location
      if (userUid) {
        // Try to update role via Supabase RPC first
        try {
          const { error: rpcError } = await supabase.rpc('update_user_role', {
            target_user_id: userUid,
            new_role: 'owner'
          });
          
          if (!rpcError) {
            console.log(`Role updated to owner for user ${email} via Supabase RPC`);
          } else {
            // Fall back to local implementation
            setAsVerifiedOwner(userUid);
            console.log(`Role updated to owner for user ${email} via local storage`);
          }
        } catch (rpcErr) {
          // Fall back to local implementation
          setAsVerifiedOwner(userUid);
          console.log(`Role updated to owner for user ${email} via local storage after RPC failure`);
        }
      } else {
        console.log(`User ${email} not found, creating new user`);
        
        // Create a new user with default password
        const userData = createUser(email, 'Custodios2024', `Admin ${email.split('@')[0]}`);
        
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
    } catch (error: any) {
      console.error('Error setting user as verified owner:', error);
      toast.error('Error al configurar el usuario como propietario verificado: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUserRole: updateUserRoleMethod,
    getAllUsers: getAllUsersMethod,
    verifyEmail: verifyEmailMethod,
    setUserAsVerifiedOwner: setUserAsVerifiedOwnerMethod
  };
};
