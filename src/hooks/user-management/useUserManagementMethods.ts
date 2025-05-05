
import { UserManagementHookProps, UserManagementMethods } from './types';
import { useRoleManagement } from './useRoleManagement';
import { useUserVerification } from './useUserVerification';
import { useUserListing } from './useUserListing';
import { UserData } from '@/types/auth';
import { useCallback, useRef, useState } from 'react';

export const useUserManagementMethods = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  refreshUserData: () => Promise<void>
): UserManagementMethods => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const requestInProgress = useRef(false);
  
  // Adapter function to convert from boolean loading state to string/null loading state
  const handleSetLoading = (id: string | null) => {
    setLoadingId(id);
    setLoading(!!id); // Convert to boolean for backward compatibility
  };
  
  const props: UserManagementHookProps = {
    setLoading: handleSetLoading,
    refreshUserData
  };

  // Obtener métodos específicos de cada hook
  const { updateUserRole } = useRoleManagement(props);
  const { verifyEmail, setUserAsVerifiedOwner } = useUserVerification(props);
  const { getAllUsers } = useUserListing(props);

  // Envolver getAllUsers con manejo de errores y prevención de solicitudes duplicadas
  const safeGetAllUsers = useCallback(async (): Promise<UserData[]> => {
    // Prevenir solicitudes concurrentes
    if (requestInProgress.current) {
      console.log('Request already in progress, skipping duplicate getAllUsers');
      return [];
    }

    requestInProgress.current = true;
    
    try {
      const result = await getAllUsers();
      return result;
    } catch (error: any) {
      console.error('Error in safeGetAllUsers:', error);
      return [];
    } finally {
      requestInProgress.current = false;
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
