
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
  // Control variables para prevenir loops infinitos
  const supabasePermissionErrorCount = useRef(0);
  const MAX_PERMISSION_ERRORS = 3;
  const isHandlingRequest = useRef(false);
  
  const props: UserManagementHookProps = {
    setUserData,
    setLoading,
    refreshUserData
  };

  const { updateUserRole } = useRoleManagement(props);
  const { verifyEmail, setUserAsVerifiedOwner } = useUserVerification(props);
  const { getAllUsers } = useUserListing(props);

  // Wrap getAllUsers with error handling to prevent infinite loops
  const safeGetAllUsers = useCallback(async () => {
    // Prevenir solicitudes concurrentes
    if (isHandlingRequest.current) {
      console.log('Request already in progress, skipping duplicate getAllUsers');
      return [];
    }

    isHandlingRequest.current = true;
    
    try {
      // Si ya hemos tenido demasiados errores de permisos, usar solo localStorage
      if (supabasePermissionErrorCount.current >= MAX_PERMISSION_ERRORS) {
        console.warn('Too many permission errors, using only local storage data');
        // El método getAllUsers de useUserListing ya hace fallback a localStorage
        return await getAllUsers();
      }
      
      const result = await getAllUsers();
      
      // Reset error counter on success
      if (result && result.length > 0) {
        supabasePermissionErrorCount.current = 0;
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in safeGetAllUsers:', error);
      
      // Si es un error de permisos, incrementar contador
      if (error?.message?.includes('permission') || error?.code === 'PGRST301') {
        supabasePermissionErrorCount.current += 1;
      }
      
      // Intentar retornar datos locales en caso de error
      try {
        return [];
      } catch (fallbackError) {
        console.error('Error in fallback for getAllUsers:', fallbackError);
        return [];
      }
    } finally {
      isHandlingRequest.current = false;
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
