
import { User, Session } from '@supabase/supabase-js';

// User roles in the system
export type UserRole = 
  | 'unverified' 
  | 'pending' 
  | 'soporte' 
  | 'supply' 
  | 'supply_admin' 
  | 'bi'
  | 'monitoring'
  | 'monitoring_supervisor'
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

// This interface is implemented in the AuthContext
export interface AuthContextProps {
  user: User | null;
  currentUser: UserData | null; // Added to match component usage
  userData: UserData | null;
  session: Session | null;
  loading: boolean;
  isInitializing: boolean; // Added to track initial load state
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: any }>;
  getAllUsers: () => Promise<UserData[]>;
  verifyEmail: (userId: string) => Promise<{ success: boolean; error?: any }>;
  refreshSession: () => Promise<boolean>;
  refreshUserData: () => Promise<{ success: boolean; error?: any }>;
  resetPassword: (email: string) => Promise<void>;
}
