
import React, { createContext, useContext, useEffect } from 'react';
import { UserData, AuthContextProps } from '@/types/auth';
import { toast } from 'sonner';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthMethods } from '@/hooks/auth';
import { useUserManagementMethods } from '@/hooks/useUserManagementMethods';
import { getCurrentUser } from '@/utils/localAuthStorage';

// Create the context with a default value
const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  userData: null,
  loading: true,
  signOut: async () => {},
  updateUserRole: async () => {},
  getAllUsers: async () => [],
  refreshUserData: async () => {},
  signIn: async () => null,
  signUp: async () => null,
  resetPassword: async () => {},
  setUserAsVerifiedOwner: async () => {},
  verifyEmail: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our hooks to manage state and methods
  const { userData, setUserData, loading, setLoading } = useAuthState();
  
  const { 
    refreshUserData, 
    signIn, 
    signUp, 
    signOut,
    resetPassword 
  } = useAuthMethods(setUserData, setLoading);
  
  const {
    updateUserRole,
    getAllUsers,
    verifyEmail,
    setUserAsVerifiedOwner
  } = useUserManagementMethods(setUserData, setLoading, refreshUserData);

  // Set up auth state on initialization, but without automatically setting verified owner
  useEffect(() => {
    const setupAuth = async () => {
      try {
        setLoading(true);
        console.log("Setting up auth state...");
        
        // Check for existing user session in local storage
        const storedUser = getCurrentUser();
        if (storedUser) {
          console.log("Active user session found:", storedUser.email);
          setUserData(storedUser);
        } else {
          console.log("No active session");
          setUserData(null);
        }
        
        // Removed the automatic setting of Manuel Chacon as verified owner
        // This was causing the toast notification on every refresh
        
      } catch (error) {
        console.error("Error setting up authentication:", error);
      } finally {
        setLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  const value = {
    currentUser: userData,
    userData,
    loading,
    signOut,
    updateUserRole,
    getAllUsers,
    refreshUserData,
    signIn,
    signUp,
    resetPassword,
    setUserAsVerifiedOwner,
    verifyEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export the types
export type { UserRole, UserData } from '@/types/auth';
