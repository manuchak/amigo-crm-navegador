import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextProps, UserData, UserRole } from '@/types/auth';
import { useAuthSession } from './hooks/useAuthSession';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useUserManagementMethods } from '@/hooks/user-management';

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

  useAuthSession({
    setUser,
    setSession,
    setUserData,
    setLoading,
    setIsInitializing
  });

  const authMethods = useAuthMethods({
    setLoading,
    setUserData
  });

  const userManagementMethods = useUserManagementMethods(
    setUserData, 
    setLoading, 
    authMethods.refreshUserData
  );

  const value: AuthContextProps = {
    user,
    currentUser: userData,
    userData,
    session,
    loading,
    isInitializing,
    signIn: async (email: string, password: string) => {
      try {
        setLoading(true);
        const userData = await authMethods.signIn(email, password);
        return { user: user || null, error: null };
      } catch (error) {
        return { user: null, error };
      } finally {
        setLoading(false);
      }
    },
    signUp: async (email: string, password: string, displayName: string) => {
      try {
        setLoading(true);
        const userData = await authMethods.signUp(email, password, displayName);
        return { user: user || null, error: null };
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
    refreshUserData: async () => {
      try {
        await authMethods.refreshUserData();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    resetPassword: authMethods.resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
