
import { UserData, UserRole } from '@/types/auth';

export interface UserManagementMethods {
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<UserData[]>;
  verifyEmail: (uid: string) => Promise<void>;
  setUserAsVerifiedOwner: (email: string, showNotification?: boolean) => Promise<void>;
}

export interface UserManagementHookProps {
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refreshUserData: () => Promise<void>;
}
