
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllUsers as localGetAllUsers } from '@/utils/auth';
import { UserManagementHookProps } from './types';

export const useUserListing = ({ setLoading }: UserManagementHookProps) => {
  const getAllUsers = async (): Promise<UserData[]> => {
    setLoading(true);
    try {
      console.log('Getting all users...');
      // Try to get users from Supabase first
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error('Error fetching profiles from Supabase:', profilesError);
          // Fall back to local storage if Supabase query fails
          const localUsers = localGetAllUsers();
          console.log('Users from local storage:', localUsers);
          return localUsers;
        }
        
        console.log('Profiles fetched from Supabase:', profiles);
        if (profiles && profiles.length > 0) {
          // Get roles for each profile
          const usersWithRoles: UserData[] = await Promise.all(
            profiles.map(async (profile) => {
              // Fetch role for this user
              const { data: roleData, error: roleError } = await supabase.rpc(
                'get_user_role', 
                { user_uid: profile.id }
              );
              
              const role = roleError ? 'unverified' : (roleData as UserRole || 'unverified');
              console.log(`User ${profile.id} has role:`, role);
              
              // Get user data from Auth to check if email is verified
              const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
              
              const emailVerified = userData?.user?.email_confirmed_at ? true : false;
              
              return {
                uid: profile.id,
                email: profile.email || '',
                displayName: profile.display_name || profile.email || '',
                photoURL: profile.photo_url || undefined,
                role: role,
                emailVerified: emailVerified,
                createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
                lastLogin: profile.last_login ? new Date(profile.last_login) : new Date(),
              } as UserData;
            })
          );
          console.log('Users with roles:', usersWithRoles);
          return usersWithRoles;
        }
      } catch (supabaseError) {
        console.error('Error using Supabase for users, falling back:', supabaseError);
      }
      
      // Get users from local storage as fallback
      const localUsers = localGetAllUsers();
      console.log('Users from local storage (fallback):', localUsers);
      return localUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { getAllUsers };
};
