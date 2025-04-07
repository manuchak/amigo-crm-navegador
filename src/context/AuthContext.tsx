
import React, { createContext, useContext, useEffect } from 'react';
import { UserData, AuthContextProps } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthMethods } from '@/hooks/auth';
import { useUserManagementMethods } from '@/hooks/useUserManagementMethods';
import { mapUserData } from '@/hooks/useSupabaseMappings';
import { SPECIAL_USERS } from '@/hooks/auth/constants';

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
    let authUnsubscribe: (() => void) | null = null;
    
    const setupAuth = async () => {
      try {
        setLoading(true);
        console.log("Setting up auth state...");
        
        // First set up the auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            // Handle auth state changes
            console.log("Auth state change event:", event);
            setSession(currentSession);
            
            if (currentSession?.user) {
              console.log("User authenticated:", currentSession.user.email);
              const mappedUserData = await mapUserData(currentSession.user);
              setUserData(mappedUserData);
            } else {
              console.log("No active session");
              setUserData(null);
            }
          }
        );
        
        // Store unsubscribe function
        authUnsubscribe = () => {
          console.log("Unsubscribing from auth state changes");
          authListener.subscription.unsubscribe();
        };
        
        // Then get the initial session
        console.log("Fetching initial session");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log("Initial session found for user:", currentSession.user.email);
          const mappedUserData = await mapUserData(currentSession.user);
          setUserData(mappedUserData);
        }
        
        // Ensure Manuel Chacon's account is set as verified owner
        try {
          const ownerEmail = SPECIAL_USERS.SYSTEM_OWNER;
          console.log(`Ensuring ${ownerEmail} has owner privileges...`);
          await setUserAsVerifiedOwner(ownerEmail);
          console.log("Owner privileges setup complete");
        } catch (error) {
          console.error("Error setting verified owner:", error);
          // Continue even if this fails - don't block app initialization
        }
      } catch (error) {
        console.error("Error setting up authentication:", error);
      } finally {
        setLoading(false);
      }
    };
    
    setupAuth();
    
    // Cleanup subscription on unmount
    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
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
