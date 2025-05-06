
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthContextProps, UserData } from '@/types/auth';
import { getCurrentUser, signOut } from '@/utils/auth';
import { useAuthMethods } from '@/hooks/auth';

// Create a context with a default undefined value
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  
  const authMethods = useAuthMethods(setUserData, setLoading);
  
  // Initialize the auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth context...');
        // Check for existing user session in localStorage
        const storedUser = getCurrentUser();
        if (storedUser) {
          console.log('User found in local storage:', storedUser);
          setUserData(storedUser);
        } else {
          console.log('No user found in local storage');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setIsInitializing(false);
        console.log('Auth initialization complete');
      }
    };
    
    initAuth();
  }, []);

  // Create the context value with all the authentication methods
  const contextValue: AuthContextProps = {
    user: null,
    currentUser: userData,
    userData,
    session: null,
    loading,
    isInitializing,
    signIn: async (email, password) => {
      try {
        const user = await authMethods.signIn(email, password);
        return { user, error: null };
      } catch (error) {
        return { user: null, error };
      }
    },
    signUp: async (email, password, displayName) => {
      try {
        const user = await authMethods.signUp(email, password, displayName);
        return { user, error: null };
      } catch (error) {
        return { user: null, error };
      }
    },
    signOut: async () => {
      try {
        await signOut();
        setUserData(null);
        toast.success('Sesión cerrada con éxito');
      } catch (error) {
        console.error('Error signing out:', error);
        toast.error('Error al cerrar sesión');
      }
    },
    updateUserRole: async (userId, role) => {
      return { success: false, error: new Error('Not implemented in local auth') };
    },
    getAllUsers: async () => {
      return [];
    },
    verifyEmail: async (userId) => {
      return { success: false, error: new Error('Not implemented in local auth') };
    },
    refreshSession: async () => {
      return false;
    },
    refreshUserData: async () => {
      try {
        const userData = getCurrentUser();
        if (userData) {
          setUserData(userData);
          return { success: true };
        }
        return { success: false, error: new Error('No user data found') };
      } catch (error) {
        return { success: false, error };
      }
    },
    resetPassword: async (email) => {
      try {
        await authMethods.resetPassword(email);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    }
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
