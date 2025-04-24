// User roles in the system
export type UserRole = 
  | 'unverified' 
  | 'pending' 
  | 'atención_afiliado' 
  | 'supply' 
  | 'supply_admin' 
  | 'afiliados' 
  | 'admin';

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

// This interface is implemented in the SupabaseAuthContext
export interface AuthContextProps {
  currentUser: UserData | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<UserData[]>;
  refreshUserData: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserData | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<UserData | null>;
  resetPassword: (email: string) => Promise<void>;
  setUserAsVerifiedOwner: (email: string) => Promise<void>;
  verifyEmail: (uid: string) => Promise<void>;
}
