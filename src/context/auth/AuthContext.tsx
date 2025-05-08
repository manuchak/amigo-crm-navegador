
import React, { createContext, useContext, useState } from 'react';
import { AuthContextProps, UserData, UserRole } from '@/types/auth';
import { useSessionManager } from '@/hooks/auth/useSessionManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { mapUserData } from '@/utils/userDataMapper';

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our consolidated session manager hook
  const { 
    user: supabaseUser, 
    session, 
    userData, 
    loading, 
    isInitializing,
    setUserData
  } = useSessionManager();
  
  // Add local loading state for auth operations
  const [authLoading, setAuthLoading] = useState(false);

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        return { user: null, error };
      }
      
      if (!data.user) {
        return { user: null, error: new Error("Could not sign in") };
      }

      console.log("Login successful:", data.user.email);
      
      // Map the Supabase User to our UserData format
      const mappedUserData = await mapUserData(data.user);
      
      return { user: mappedUserData, error: null };
    } catch (error) {
      console.error("Error signing in:", error);
      return { user: null, error };
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log("Attempting to create user:", email);
      
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
        toast.error(`Error al registrar: ${error.message}`);
        return { user: null, error };
      }
      
      const mappedUserData = data.user ? await mapUserData(data.user) : null;
      
      toast.success('Cuenta creada con éxito. Por favor, verifica tu correo electrónico.');
      return { user: mappedUserData, error: null };
    } catch (error) {
      console.error("Error registering:", error);
      toast.error(`Error inesperado: ${error.message || 'Desconocido'}`);
      return { user: null, error };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      
      toast.success('Sesión cerrada con éxito');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const refreshUserData = async () => {
    try {
      console.log("Refreshing user data...");
      
      const { data: userData, error } = await supabase.auth.getUser();
      
      if (error || !userData.user) {
        console.error("Error or no user found during refresh:", error);
        return { success: false, error: error || new Error('No user found') };
      }

      const mappedUserData = await mapUserData(userData.user);
      setUserData(mappedUserData);
      
      console.log("User data refreshed successfully");
      return { success: true };
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return { success: false, error };
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log("Refreshing session...");
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        return false;
      }
      
      if (data.session) {
        console.log("Session refreshed successfully");
        // The session update will be handled by the onAuthStateChange listener
        return true;
      } else {
        console.log("No session to refresh");
        return false;
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      return false;
    }
  };

  // Create the context value with all authentication methods
  const contextValue: AuthContextProps = {
    user: supabaseUser,
    currentUser: userData, 
    userData,
    session,
    loading,
    isInitializing,
    signIn,
    signUp,
    signOut,
    refreshUserData,
    refreshSession,
    updateUserRole: async (userId, role) => {
      try {
        setAuthLoading(true);
        console.log(`Attempting to update user role: ${userId} to ${role}`);
        const { error } = await supabase.rpc('update_user_role', {
          target_user_id: userId,
          new_role: role
        });
        
        if (error) {
          console.error('Error updating role:', error);
          throw error;
        }
        
        if (supabaseUser && userId === supabaseUser.id) {
          await refreshUserData();
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error updating role:', error);
        return { success: false, error: error as Error };
      } finally {
        setAuthLoading(false);
      }
    },
    getAllUsers: async () => {
      try {
        console.log('Fetching all users...');
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
        
        if (error) {
          console.error('Error fetching profiles:', error);
          throw error;
        }
        
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
        
        console.log(`Fetched ${usersWithRoles.length} users`);
        return usersWithRoles;
      } catch (error) {
        console.error('Error getting users:', error);
        return [];
      }
    },
    verifyEmail: async (userId) => {
      try {
        console.log(`Verifying email for user: ${userId}`);
        const { error } = await supabase.rpc('verify_user_email', {
          target_user_id: userId
        });
        
        if (error) {
          console.error('Error verifying email:', error);
          throw error;
        }
        
        console.log('Email verification successful');
        return { success: true };
      } catch (error) {
        console.error('Error verifying email:', error);
        return { success: false, error: error as Error };
      }
    },
    resetPassword: async (email: string) => {
      try {
        setAuthLoading(true);
        
        console.log(`Attempting to reset password for: ${email}`);
        
        // Get the current domain for redirects
        const redirectURL = `${window.location.origin}/reset-password`;
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectURL,
        });
        
        if (error) {
          console.error("Error sending recovery email:", error);
          toast.error(`Error al enviar correo de recuperación: ${error.message}`);
          return { success: false, error };
        }
        
        console.log("Recovery email sent");
        toast.success('Se ha enviado un correo para restablecer la contraseña');
        return { success: true };
      } catch (error: any) {
        console.error("Error resetting password:", error);
        toast.error(`Error al restablecer contraseña: ${error.message || 'Desconocido'}`);
        return { success: false, error };
      } finally {
        setAuthLoading(false);
      }
    }
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;
