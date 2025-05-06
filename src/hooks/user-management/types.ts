
import { UserData, UserRole } from '@/types/auth';

export interface UserManagementHookProps {
  setLoading: (state: string | null) => void;
  refreshUserData: () => Promise<void>;
}

export interface UserManagementMethods {
  updateUserRole: (uid: string, role: UserRole) => Promise<{ success: boolean; error?: any }>;
  getAllUsers: () => Promise<UserData[]>;
  verifyEmail: (uid: string) => Promise<{ success: boolean; error?: any }>;
  setUserAsVerifiedOwner: (email: string, showNotification?: boolean) => Promise<{ success: boolean; error?: any }>;
}
