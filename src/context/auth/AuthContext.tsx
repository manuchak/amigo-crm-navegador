
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthContextProps, UserData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { mapUserData } from './hooks/utils/userDataMapper';

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
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  
  // Listen for authentication state changes
  useEffect(() => {
    console.log('Setting up authentication listeners...');
    
    // 1. First set up the listener for state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          setSupabaseUser(session.user);
          
          try {
            // Get profile data
            const mappedUserData = await mapUserData(session.user);
            setUserData(mappedUserData);
            console.log('Authenticated user loaded:', mappedUserData);
          } catch (error) {
            console.error('Error getting profile data:', error);
            setUserData(null);
          }
        } else {
          console.log('No active user session');
          setSupabaseUser(null);
          setUserData(null);
        }
        
        setLoading(false);
      }
    );

    // 2. Check if there's an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session:', session ? 'Yes' : 'No');
      
      if (!session) {
        setLoading(false);
        setIsInitializing(false);
      }
      // The listener will handle updating the user state
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting to sign in:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Could not sign in");
      }

      // Map Supabase User to our UserData format
      const mappedUser = await mapUserData(data.user);
      
      console.log("Login successful:", data.user.email);
      toast.success('Session started successfully');
      return { user: mappedUser, error: null };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      console.log("Attempting to create user:", email);
      
      // Create user with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/verify-confirmation`
        },
      });
      
      if (error) {
        console.error("Registration error:", error);
        throw error;
      }
      
      // Map Supabase User to our UserData format if available
      let mappedUser = null;
      if (data.user) {
        mappedUser = await mapUserData(data.user);
      }
      
      toast.success('Account created successfully. Please verify your email.');
      return { user: mappedUser, error: null };
    } catch (error: any) {
      console.error("Error registering:", error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      setUserData(null);
      setSupabaseUser(null);
      toast.success('Session ended successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      console.log(`Attempting to reset password for: ${email}`);
      
      // Get the current domain for redirects
      const redirectURL = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectURL,
      });
      
      if (error) {
        console.error("Error sending recovery email:", error);
        throw error;
      }
      
      console.log("Recovery email sent");
      toast.success('A password reset email has been sent');
      return { success: true };
    } catch (error: any) {
      console.error("Error resetting password:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Create the context value with all the authentication methods
  const contextValue: AuthContextProps = {
    user: supabaseUser, // Native Supabase user
    currentUser: userData, // Our UserData format
    userData,
    session: null,
    loading,
    isInitializing,
    signIn,
    signUp,
    signOut,
    updateUserRole: async (userId, role) => {
      try {
        const { error } = await supabase.rpc('update_user_role', {
          target_user_id: userId,
          new_role: role
        });
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error updating role:', error);
        return { success: false, error: error as Error };
      }
    },
    getAllUsers: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            display_name,
            last_login,
            created_at,
            photo_url
          `);
        
        if (error) throw error;
        
        // Get roles for each user
        const usersWithRoles = await Promise.all(data.map(async (user) => {
          const { data: role } = await supabase
            .rpc('get_user_role', { user_uid: user.id });
          
          return {
            uid: user.id,
            email: user.email,
            displayName: user.display_name,
            photoURL: user.photo_url,
            role: role as UserRole,
            emailVerified: true, // This is handled at Supabase level
            createdAt: new Date(user.created_at),
            lastLogin: user.last_login ? new Date(user.last_login) : new Date(),
          } as UserData;
        }));
        
        return usersWithRoles;
      } catch (error) {
        console.error('Error getting users:', error);
        return [];
      }
    },
    verifyEmail: async (userId) => {
      try {
        const { error } = await supabase.rpc('verify_user_email', {
          target_user_id: userId
        });
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error verifying email:', error);
        return { success: false, error: error as Error };
      }
    },
    refreshSession: async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return !!data.session;
      } catch (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
    },
    refreshUserData: async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          return { success: false, error: new Error('No authenticated user') };
        }
        
        // The onAuthStateChange listener will update the state
        return { success: true };
      } catch (error) {
        console.error('Error updating user data:', error);
        return { success: false, error: error as Error };
      }
    },
    resetPassword,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
