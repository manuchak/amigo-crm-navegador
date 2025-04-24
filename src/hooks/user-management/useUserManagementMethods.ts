
import { UserManagementHookProps, UserManagementMethods } from './types';
import { useRoleManagement } from './useRoleManagement';
import { useUserVerification } from './useUserVerification';
import { useUserListing } from './useUserListing';
import { UserData } from '@/types/auth';
import { useCallback } from 'react';

export const useUserManagementMethods = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  refreshUserData: () => Promise<void>
): UserManagementMethods => {
  const props: UserManagementHookProps = {
    setUserData,
    setLoading,
    refreshUserData
  };

  const { updateUserRole } = useRoleManagement(props);
  const { verifyEmail, setUserAsVerifiedOwner } = useUserVerification(props);
  const { getAllUsers } = useUserListing(props);

  // Memoizamos los métodos principales para evitar regeneraciones innecesarias
  const memoizedGetAllUsers = useCallback(getAllUsers, [getAllUsers]);
  const memoizedUpdateUserRole = useCallback(updateUserRole, [updateUserRole]);
  const memoizedVerifyEmail = useCallback(verifyEmail, [verifyEmail]);
  const memoizedSetUserAsVerifiedOwner = useCallback(setUserAsVerifiedOwner, [setUserAsVerifiedOwner]);

  return {
    updateUserRole: memoizedUpdateUserRole,
    getAllUsers: memoizedGetAllUsers,
    verifyEmail: memoizedVerifyEmail,
    setUserAsVerifiedOwner: memoizedSetUserAsVerifiedOwner
  };
};

export * from './types';
