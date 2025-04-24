
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextProps, UserData, UserRole } from '@/types/auth';
import { useAuthSession } from './hooks/useAuthSession';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useUserManagementMethods } from '@/hooks/useUserManagementMethods';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initialize auth session management
  useAuthSession({
    setUser,
    setSession,
    setUserData,
    setLoading,
    setIsInitializing
  });

  // Get auth methods (signIn, signUp, etc.)
  const authMethods = useAuthMethods({
    setLoading,
    setUserData
  });

  // Get user management methods
  const userManagementMethods = useUserManagementMethods(
    setUserData, 
    setLoading, 
    authMethods.refreshUserData
  );

  // The actual value we provide to consumers
  const value: AuthContextProps = {
    user,
    currentUser: userData, // Ensure currentUser is aliased to userData for backward compatibility
    userData,
    session,
    loading,
    isInitializing,
    // Fix type issues with signIn method
    signIn: async (email: string, password: string) => {
      try {
        setLoading(true);
        const userData = await authMethods.signIn(email, password);
        return { user: user || null, error: null }; // Return Supabase User object instead of UserData
      } catch (error) {
        return { user: null, error };
      } finally {
        setLoading(false);
      }
    },
    // Fix type issues with signUp method
    signUp: async (email: string, password: string, displayName: string) => {
      try {
        setLoading(true);
        const userData = await authMethods.signUp(email, password, displayName);
        return { user: user || null, error: null }; // Return Supabase User object instead of UserData
      } catch (error) {
        return { user: null, error };
      } finally {
        setLoading(false);
      }
    },
    signOut: authMethods.signOut,
    updateUserRole: userManagementMethods.updateUserRole,
    getAllUsers: userManagementMethods.getAllUsers,
    verifyEmail: userManagementMethods.verifyEmail,
    refreshSession: async () => {
      try {
        const { data } = await supabase.auth.refreshSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          await authMethods.refreshUserData();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error refreshing session:", error);
        return false;
      }
    },
    // Fix type issues with refreshUserData method
    refreshUserData: async () => {
      try {
        await authMethods.refreshUserData();
        return { success: true }; // Return object with success property
      } catch (error) {
        return { success: false, error };
      }
    },
    resetPassword: authMethods.resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
