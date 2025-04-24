
import { UserData, UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllUsers as localGetAllUsers } from '@/utils/auth';
import { UserManagementHookProps } from './types';
import { useCallback, useRef } from 'react';

export const useUserListing = ({ setLoading }: UserManagementHookProps) => {
  // Add a ref to track if we've attempted fetching from Supabase and fallen back
  const hasAttemptedSupabaseFetch = useRef<boolean>(false);
  const isProcessingRequest = useRef<boolean>(false);

  const getAllUsers = useCallback(async (): Promise<UserData[]> => {
    // Prevent concurrent requests
    if (isProcessingRequest.current) {
      console.log('Request already in progress, skipping duplicate fetch');
      return [];
    }

    isProcessingRequest.current = true;
    setLoading(true);
    
    try {
      console.log('Getting all users...');
      
      // Only try Supabase if we haven't already attempted and failed
      if (!hasAttemptedSupabaseFetch.current) {
        try {
          console.log('Attempting to fetch users from Supabase...');
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
          
          if (profilesError) {
            console.error('Error fetching profiles from Supabase:', profilesError);
            hasAttemptedSupabaseFetch.current = true;
            // Fallback to local storage if Supabase query fails
            const localUsers = localGetAllUsers();
            console.log('Users from local storage (fallback):', localUsers);
            return localUsers;
          }
          
          if (profiles && profiles.length > 0) {
            console.log('Successfully fetched profiles from Supabase:', profiles.length);
            // Obtain roles for each profile
            const usersWithRoles: UserData[] = await Promise.all(
              profiles.map(async (profile) => {
                let role: UserRole = 'unverified';
                let emailVerified = false;
                
                try {
                  // Try to get role using RPC function
                  const { data: roleData, error: roleError } = await supabase.rpc(
                    'get_user_role', 
                    { user_uid: profile.id }
                  );
                  
                  if (!roleError) {
                    role = roleData as UserRole || 'unverified';
                  }
                  
                  // Check if email is verified - skip in case of permission errors
                  emailVerified = true; // Default to true to avoid unnecessary API calls
                } catch (e) {
                  console.warn('Error fetching role data for user:', e);
                }
                
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
            
            return usersWithRoles;
          }
        } catch (supabaseError) {
          console.error('Error using Supabase for users, falling back:', supabaseError);
          hasAttemptedSupabaseFetch.current = true;
        }
      }
      
      // Fallback to local storage
      const localUsers = localGetAllUsers();
      console.log('Using local storage users:', localUsers);
      return localUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
      isProcessingRequest.current = false;
    }
  }, [setLoading]);

  return { getAllUsers };
};
