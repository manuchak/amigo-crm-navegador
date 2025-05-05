
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllUsers as localGetAllUsers } from '@/utils/auth';
import { UserData } from '@/types/auth';
import { UserManagementHookProps } from './types';

export const useUserListing = ({ setLoading }: UserManagementHookProps) => {
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number | null>(null);
  const [cachedUsers, setCachedUsers] = useState<UserData[]>([]);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  
  // Improved function to get all users with better error handling and caching
  const getAllUsers = useCallback(async (): Promise<UserData[]> => {
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
    
    setLoading(true);
    setFetchError(null);
    
    try {
      console.log('Fetching users from Supabase and local storage...');
      
      let usersData: UserData[] = [];
      
      // Try to get Supabase profiles
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.warn('Error fetching profiles from Supabase, will try local storage:', profilesError);
          throw profilesError;
        }
        
        if (profiles && profiles.length > 0) {
          // Transform profiles to UserData format with roles
          usersData = await Promise.all(
            profiles.map(async (profile) => {
              try {
                // Get role using RPC function
                const { data: roleData, error: roleError } = await supabase.rpc(
                  'get_user_role', 
                  { user_uid: profile.id }
                );
                
                if (roleError) {
                  console.warn(`Error getting role for user ${profile.id}:`, roleError);
                }
                
                // Check email verification status
                const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(profile.id);
                
                const emailVerified = authUser?.user?.email_confirmed_at ? true : false;
                
                return {
                  uid: profile.id,
                  email: profile.email || '',
                  displayName: profile.display_name || profile.email || '',
                  photoURL: profile.photo_url || undefined,
                  role: roleData || 'unverified',
                  emailVerified,
                  createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
                  lastLogin: profile.last_login ? new Date(profile.last_login) : new Date(),
                };
              } catch (err) {
                console.error(`Error processing user ${profile.id}:`, err);
                return null;
              }
            })
          );
          
          // Filter out any null results from failed processing
          usersData = usersData.filter(Boolean) as UserData[];
        }
      } catch (supabaseError) {
        console.error('Could not fetch users from Supabase, falling back to local storage:', supabaseError);
        // Fallback to local storage on complete failure
        try {
          usersData = localGetAllUsers();
        } catch (localError) {
          console.error('Error getting users from local storage:', localError);
          throw new Error('Failed to fetch users from both Supabase and local storage');
        }
      }
      
      // If we have no users from Supabase, try local storage
      if (usersData.length === 0) {
        try {
          const localUsers = localGetAllUsers();
          if (localUsers && localUsers.length > 0) {
            console.log('Using local storage users as fallback, found:', localUsers.length);
            usersData = localUsers;
          }
        } catch (localError) {
          console.error('Error getting users from local storage:', localError);
        }
      }
      
      // Update cache
      setLastFetchTimestamp(now);
      setCachedUsers(usersData);
      
      return usersData;
    } catch (error: any) {
      console.error('Error getting all users:', error);
      setFetchError(error);
      toast.error('Error al cargar la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, lastFetchTimestamp, cachedUsers, fetchError]);

  return { 
    getAllUsers,
    lastFetchTimestamp,
    fetchError 
  };
};
