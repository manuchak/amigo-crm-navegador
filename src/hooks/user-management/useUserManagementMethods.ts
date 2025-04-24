
import { UserManagementHookProps, UserManagementMethods } from './types';
import { useRoleManagement } from './useRoleManagement';
import { useUserVerification } from './useUserVerification';
import { useUserListing } from './useUserListing';
import { UserData } from '@/types/auth';
import { useCallback, useRef } from 'react';

export const useUserManagementMethods = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  refreshUserData: () => Promise<void>
): UserManagementMethods => {
  // Add a ref to track error state to prevent infinite loops on Supabase permission errors
  const supabasePermissionErrorCount = useRef(0);
  
  const props: UserManagementHookProps = {
    setUserData,
    setLoading,
    refreshUserData
  };

  const { updateUserRole } = useRoleManagement(props);
  const { verifyEmail, setUserAsVerifiedOwner } = useUserVerification(props);
  const { getAllUsers } = useUserListing(props);

  // Wrap methods with error handling to prevent infinite loops
  const safeGetAllUsers = useCallback(async () => {
    try {
      const result = await getAllUsers();
      // Reset error counter on success
      supabasePermissionErrorCount.current = 0;
      return result;
    } catch (error: any) {
      console.error('Error in getAllUsers:', error);
      
      // If it's a permission error, increment counter
      if (error?.message?.includes('permission') || error?.code === 'PGRST301') {
        supabasePermissionErrorCount.current += 1;
        
        // If we've hit too many permission errors, stop trying with Supabase
        if (supabasePermissionErrorCount.current >= 3) {
          console.warn('Too many permission errors, falling back to local storage only');
          // Return whatever local data we have
          return [];
        }
      }
      
      throw error;
    }
  }, [getAllUsers]);

  return {
    updateUserRole,
    getAllUsers: safeGetAllUsers,
    verifyEmail,
    setUserAsVerifiedOwner
  };
};

export * from './types';
