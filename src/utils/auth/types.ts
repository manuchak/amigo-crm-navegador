
import { UserData, UserRole } from '@/types/auth';

export interface StoredUser {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export const USERS_STORAGE_KEY = 'users';
export const CURRENT_USER_KEY = 'current_user';
