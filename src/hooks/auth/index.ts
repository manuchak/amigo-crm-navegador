
import { useAuthCore } from './useAuthCore';
import { useAuthentication } from './useAuthentication';
import { usePasswordManagement } from './usePasswordManagement';
import { UserData } from '@/types/auth';

export const useAuthMethods = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { refreshUserData, signOut } = useAuthCore(setUserData, setLoading);
  const { signIn, signUp } = useAuthentication(setUserData, setLoading);
  const { resetPassword } = usePasswordManagement();
  
  return {
    refreshUserData,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
};

// Re-export utility functions for external use
export * from './utils';
export * from './constants';
