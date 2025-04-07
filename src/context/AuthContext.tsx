
import React, { createContext, useContext, useEffect } from 'react';
import { UserData, AuthContextProps } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthMethods } from '@/hooks/useAuthMethods';
import { useUserManagementMethods } from '@/hooks/useUserManagementMethods';
import { mapUserData } from '@/hooks/useSupabaseMappings';

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
  const { userData, setUserData, session, setSession, loading, setLoading } = useAuthState();
  
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

  // Set up auth state listener
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // First set up the auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            // Handle auth state changes
            console.log("Auth state change event:", event);
            setSession(currentSession);
            
            if (currentSession?.user) {
              const mappedUserData = await mapUserData(currentSession.user);
              setUserData(mappedUserData);
            } else {
              setUserData(null);
            }
          }
        );
        
        // Then get the initial session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          const mappedUserData = await mapUserData(currentSession.user);
          setUserData(mappedUserData);
        }
        
        // Set manuel.chacon@detectasecurity.io as verified owner
        // Use a setTimeout to avoid recursion issues
        setTimeout(() => {
          setUserAsVerifiedOwner('manuel.chacon@detectasecurity.io')
            .catch(error => console.error("Error setting verified owner:", error));
        }, 1000);
        
        setLoading(false);
        
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up authentication:", error);
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
