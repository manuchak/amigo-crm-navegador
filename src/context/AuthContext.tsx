
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserData, AuthContextProps } from '@/types/auth';
import { fetchUserData } from '@/utils/authUtils';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useEmailPasswordAuth } from '@/hooks/useEmailPasswordAuth';

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
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom hooks
  const { 
    refreshUserData: refreshUserDataHook, 
    signOut, 
    updateUserRole, 
    getAllUsers,
    loading: userManagementLoading
  } = useUserManagement(setUserData);
  
  const {
    signIn,
    signUp,
    resetPassword,
    isLoading: emailAuthLoading
  } = useEmailPasswordAuth(setUserData);

  // Function to refresh current user data
  const refreshUserData = async () => {
    if (currentUser) {
      await refreshUserDataHook(currentUser);
    }
  };

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          const userData = await fetchUserData(user);
          if (userData) {
            setUserData(userData);
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error en onAuthStateChanged:", error);
      setLoading(false);
      return () => {};
    }
  }, []);

  const value = {
    currentUser,
    userData,
    loading: loading || userManagementLoading || emailAuthLoading,
    signOut,
    updateUserRole,
    getAllUsers,
    refreshUserData,
    signIn,
    signUp,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export the types
export type { UserRole, UserData } from '@/types/auth';
