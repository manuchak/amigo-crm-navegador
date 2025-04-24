
import { UserData, UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllUsers as localGetAllUsers } from '@/utils/auth';
import { UserManagementHookProps } from './types';
import { useCallback, useRef } from 'react';

export const useUserListing = ({ setLoading }: UserManagementHookProps) => {
  // Control variables to prevent loops and handle fallbacks
  const hasAttemptedSupabaseFetch = useRef<boolean>(false);
  const isProcessingRequest = useRef<boolean>(false);
  const errorCount = useRef<number>(0);
  const MAX_ERRORS = 3;

  const getAllUsers = useCallback(async (): Promise<UserData[]> => {
    // Prevenir solicitudes concurrentes
    if (isProcessingRequest.current) {
      console.log('Request already in progress, skipping duplicate fetch');
      return [];
    }

    isProcessingRequest.current = true;
    setLoading(true);
    
    try {
      console.log('Getting all users...');
      
      // Si los errores superan el límite, usar solo localStorage
      if (errorCount.current >= MAX_ERRORS) {
        console.warn('Error count exceeded threshold, using only local storage data');
        const localUsers = localGetAllUsers();
        return localUsers;
      }
      
      // Intentar obtener usuarios de Supabase si no ha fallado antes
      if (!hasAttemptedSupabaseFetch.current) {
        try {
          console.log('Attempting to fetch users from Supabase...');
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
          
          if (profilesError) {
            console.error('Error fetching profiles from Supabase:', profilesError);
            hasAttemptedSupabaseFetch.current = true;
            errorCount.current += 1;
            // Fallback to local storage
            const localUsers = localGetAllUsers();
            console.log('Falling back to local storage users:', localUsers.length);
            return localUsers;
          }
          
          if (profiles && profiles.length > 0) {
            console.log('Successfully fetched profiles from Supabase:', profiles.length);
            // Process user roles one by one to avoid failing the entire batch
            const usersWithRoles: UserData[] = await Promise.all(
              profiles.map(async (profile) => {
                let role: UserRole = 'unverified';
                let emailVerified = false;
                
                try {
                  // Try to get role using RPC function with timeout
                  const rolePromise = supabase.rpc(
                    'get_user_role', 
                    { user_uid: profile.id }
                  );
                  
                  // Timeout after 5 seconds to prevent hanging
                  const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Role fetch timeout')), 5000);
                  });
                  
                  // Race between fetch and timeout
                  const { data: roleData, error: roleError } = await Promise.race([
                    rolePromise,
                    timeoutPromise.then(() => {
                      throw new Error('Role fetch timeout');
                    })
                  ]) as any;
                  
                  if (!roleError && roleData) {
                    role = roleData as UserRole || 'unverified';
                  }
                  
                  // Default email to verified to avoid unnecessary API calls
                  emailVerified = true;
                } catch (e) {
                  console.warn('Error fetching role data for user:', profile.id, e);
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
            
            // Reset error counter on success
            errorCount.current = 0;
            return usersWithRoles;
          }
        } catch (supabaseError) {
          console.error('Critical error using Supabase for users, falling back:', supabaseError);
          hasAttemptedSupabaseFetch.current = true;
          errorCount.current += 1;
        }
      }
      
      // Fallback to local storage
      const localUsers = localGetAllUsers();
      console.log('Using local storage users (final fallback):', localUsers);
      return localUsers;
    } catch (error) {
      console.error('Unexpected error getting all users:', error);
      errorCount.current += 1;
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
      isProcessingRequest.current = false;
    }
  }, [setLoading]);

  return { getAllUsers };
};
