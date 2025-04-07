
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserData } from '@/types/auth';
import { ProfileData, UserRoleData, mapUserData } from './useSupabaseMappings';

export const useUserManagementMethods = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  refreshUserData: () => Promise<void>
) => {
  // User management functions
  const updateUserRole = async (uid: string, role: UserRole) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: uid,
        new_role: role
      });
      
      if (error) throw error;
      toast.success('Rol de usuario actualizado con éxito');
      await refreshUserData();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol de usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async (): Promise<UserData[]> => {
    setLoading(true);
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Get all users from auth.users through the admin API (this uses the service role)
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      if (authUsersError) throw authUsersError;
      
      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      
      // Ensure profiles is not null and handle its type properly
      if (!profiles) return [];
      
      // Combine the data - properly typed now
      const mappedUsers: UserData[] = (profiles as ProfileData[]).map(profile => {
        const authUser = authUsers.users.find(user => user.id === profile.id);
        const userRole = roles && Array.isArray(roles) ? 
          (roles as UserRoleData[]).find(role => role.user_id === profile.id) : null;
        
        return {
          uid: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          photoURL: profile.photo_url,
          role: userRole?.role as any || 'unverified',
          emailVerified: authUser?.email_confirmed_at ? true : false,
          createdAt: new Date(profile.created_at),
          lastLogin: new Date(profile.last_login)
        };
      });
      
      return mappedUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const verifyEmail = async (uid: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('verify_user_email', {
        target_user_id: uid
      });
      
      if (error) throw error;
      toast.success('Correo electrónico verificado con éxito');
      await refreshUserData();
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Error al verificar el correo electrónico');
    } finally {
      setLoading(false);
    }
  };
  
  const setUserAsVerifiedOwner = async (email: string) => {
    setLoading(true);
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError || !user) {
        toast.error(`Usuario con email ${email} no encontrado`);
        return;
      }
      
      // Update user role to owner
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: user.id,
        new_role: 'owner'
      });
      
      if (error) throw error;
      toast.success(`Usuario ${email} configurado como propietario verificado`);
      await refreshUserData();
    } catch (error) {
      console.error('Error setting user as verified owner:', error);
      toast.error('Error al configurar el usuario como propietario verificado');
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUserRole,
    getAllUsers,
    verifyEmail,
    setUserAsVerifiedOwner
  };
};
