
import { UserData, UserRole } from '@/types/auth';

export interface StoredUser extends UserData {
  password: string;
}

export const USERS_STORAGE_KEY = 'local_users';
export const CURRENT_USER_KEY = 'current_user';
