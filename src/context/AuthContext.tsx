
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserData, AuthContextProps } from '@/types/auth';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useEmailPasswordAuth } from '@/hooks/useEmailPasswordAuth';
import { getCurrentUser } from '@/utils/localAuthStorage';
import { setSpecificUserAsVerifiedOwner } from '@/utils/setVerifiedOwner';

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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom hooks
  const { 
    refreshUserData, 
    signOut, 
    updateUserRole, 
    getAllUsers,
    verifyEmail,
    setUserAsVerifiedOwner,
    loading: userManagementLoading
  } = useUserManagement(setUserData);
  
  const {
    signIn,
    signUp,
    resetPassword,
    isLoading: emailAuthLoading
  } = useEmailPasswordAuth(setUserData);

  useEffect(() => {
    try {
      // Get current user from local storage
      const storedUser = getCurrentUser();
      if (storedUser) {
        setUserData(storedUser);
      }
      
      // Set manuel.chacon@detectasecurity.io as verified owner
      setSpecificUserAsVerifiedOwner('manuel.chacon@detectasecurity.io');
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser: userData, // In our local implementation, currentUser and userData are the same
    userData,
    loading: loading || userManagementLoading || emailAuthLoading,
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
