
import { User } from 'firebase/auth';

// User roles in the system
export type UserRole = 
  | 'unverified' 
  | 'pending' 
  | 'atención_afiliado' 
  | 'supply' 
  | 'supply_admin' 
  | 'afiliados' 
  | 'admin' 
  | 'owner';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthContextProps {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<UserData[]>;
  refreshUserData: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
}
