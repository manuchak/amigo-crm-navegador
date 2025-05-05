
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllUsers as localGetAllUsers } from '@/utils/auth';
import { UserData } from '@/types/auth';
import { UserManagementHookProps } from './types';

export const useUserListing = ({ setLoading }: UserManagementHookProps) => {
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number | null>(null);
  const [cachedUsers, setCachedUsers] = useState<UserData[]>([]);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const fetchInProgress = useRef<boolean>(false);
  
  // Improved function to get all users with better error handling and caching
  const getAllUsers = useCallback(async (): Promise<UserData[]> => {
    // Prevent concurrent requests
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, returning cached users');
      return cachedUsers;
    }
    
    // Use cached result if fetched in last 30 seconds
    const CACHE_TTL = 30000; // 30 seconds in milliseconds
    const now = Date.now();
    
    if (
      lastFetchTimestamp && 
      now - lastFetchTimestamp < CACHE_TTL && 
      cachedUsers.length > 0 &&
      !fetchError
    ) {
      console.log('Using cached users list (fetched ' + (now - lastFetchTimestamp) / 1000 + ' seconds ago)');
      return cachedUsers;
    }
    
    setLoading('fetch-users');
    setFetchError(null);
    fetchInProgress.current = true;
    
    try {
      console.log('Fetching users from Supabase and local storage...');
      
      let usersData: UserData[] = [];
      let supabaseUsersFound = false;
      
      // Try to get Supabase profiles
      try {
        // First get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.warn('Error fetching profiles from Supabase, will try local storage:', profilesError);
          throw profilesError;
        }
        
        if (profiles && profiles.length > 0) {
          supabaseUsersFound = true;
          console.log(`Found ${profiles.length} user profiles in Supabase`);
          
          // Get user roles
          const { data: userRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*');
            
          if (rolesError) {
            console.warn('Error fetching user roles:', rolesError);
          }
          
          // Map to combine user data
          const roleMap = new Map();
          if (userRoles) {
            userRoles.forEach(ur => {
              roleMap.set(ur.user_id, ur.role);
            });
          }
          
          // Transform profiles to UserData format
          usersData = profiles.map(profile => {
            const role = roleMap.get(profile.id) || 'unverified';
            return {
              uid: profile.id,
              email: profile.email || '',
              displayName: profile.display_name || profile.email || '',
              photoURL: profile.photo_url || undefined,
              role: role,
              emailVerified: true, // Default to true for existing profiles
              createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
              lastLogin: profile.last_login ? new Date(profile.last_login) : new Date(),
            };
          });
          
          console.log(`Processed ${usersData.length} user profiles`);
        }
      } catch (supabaseError) {
        console.error('Could not fetch users from Supabase, falling back to local storage:', supabaseError);
        supabaseUsersFound = false;
      }
      
      // If we couldn't get users from Supabase or found none, try local storage
      if (!supabaseUsersFound || usersData.length === 0) {
        try {
          const localUsers = localGetAllUsers();
          if (localUsers && localUsers.length > 0) {
            console.log(`Using ${localUsers.length} users from local storage as fallback or supplement`);
            
            // If we found some users in Supabase, merge the lists avoiding duplicates
            if (usersData.length > 0) {
              const existingUids = new Set(usersData.map(u => u.uid));
              const newLocalUsers = localUsers.filter(u => !existingUids.has(u.uid));
              usersData = [...usersData, ...newLocalUsers];
              console.log(`Added ${newLocalUsers.length} unique users from local storage`);
            } else {
              usersData = localUsers;
              console.log(`Using all ${localUsers.length} users from local storage`);
            }
          } else {
            console.log('No users found in local storage');
          }
        } catch (localError) {
          console.error('Error getting users from local storage:', localError);
        }
      }
      
      // Debug output of all found users
      usersData.forEach(user => {
        console.log(`Found user: ${user.displayName} (${user.email}) - Role: ${user.role}`);
      });
      
      // Update cache
      setLastFetchTimestamp(now);
      setCachedUsers(usersData);
      
      return usersData;
    } catch (error: any) {
      console.error('Error getting all users:', error);
      setFetchError(error instanceof Error ? error : new Error(String(error)));
      toast.error('Error al cargar la lista de usuarios');
      
      // Return cached users if available as fallback
      return cachedUsers.length > 0 ? cachedUsers : [];
    } finally {
      setLoading(null);
      fetchInProgress.current = false;
    }
  }, [setLoading, lastFetchTimestamp, cachedUsers, fetchError]);

  return { 
    getAllUsers,
    lastFetchTimestamp,
    fetchError,
    cachedUsers
  };
};
