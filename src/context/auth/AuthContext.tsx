
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextProps, UserData } from '@/types/auth';
import { useAuthSession } from './hooks/useAuthSession';
import { useAuthMethods } from './hooks/useAuthMethods';

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

  const value = {
    user,
    currentUser: userData,
    userData,
    session,
    loading,
    isInitializing,
    ...authMethods
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
