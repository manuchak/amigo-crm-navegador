
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthContextProps, UserData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { mapUserData } from '@/utils/userDataMapper';

// Create a context with a default undefined value
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Listen for authentication state changes - improved implementation
  useEffect(() => {
    console.log('Setting up authentication listeners and checking existing session...');
    let mounted = true;
    
    try {
      // Set up the auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          console.log('Auth state change event:', event);
          
          if (!mounted) return;
          
          // Update session immediately to avoid race conditions
          setSession(newSession);
          setSupabaseUser(newSession?.user || null);
          
          if (newSession?.user) {
            // Use setTimeout to avoid potential deadlocks
            setTimeout(async () => {
              if (!mounted) return;
              
              try {
                // Get profile data
                const mappedUserData = await mapUserData(newSession.user);
                if (mounted) {
                  setUserData(mappedUserData);
                  console.log('Authenticated user loaded:', mappedUserData);
                }
              } catch (error) {
                console.error('Error getting profile data:', error);
                if (mounted) setUserData(null);
              } finally {
                if (mounted) {
                  setLoading(false);
                  setIsInitializing(false);
                }
              }
            }, 0);
          } else {
            if (mounted) {
              console.log('No active session in auth state change');
              setUserData(null);
              setLoading(false);
              setIsInitializing(false);
            }
          }
        }
      );

      // THEN check for an existing session
      const checkSession = async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            if (mounted) {
              setLoading(false);
              setIsInitializing(false);
            }
            return;
          }
          
          if (data.session) {
            console.log('Existing session found:', data.session.user.email);
            if (mounted) {
              setSession(data.session);
              setSupabaseUser(data.session.user);
            }
            
            // User data will be updated by the auth state listener
          } else {
            console.log('No existing session');
            if (mounted) {
              setLoading(false);
              setIsInitializing(false);
            }
          }
        } catch (err) {
          console.error('Unexpected error checking session:', err);
          if (mounted) {
            setLoading(false);
            setIsInitializing(false);
          }
        }
      };

      // Run session check
      checkSession();

      return () => {
        console.log('Cleaning up auth listeners');
        mounted = false;
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth:', error);
      if (mounted) {
        setLoading(false);
        setIsInitializing(false);
      }
    }
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
        toast.error(`Error de inicio de sesión: ${error.message}`);
        return { user: null, error };
      }
      
      if (!data.user) {
        const noUserError = new Error("No se pudo iniciar sesión");
        toast.error(noUserError.message);
        return { user: null, error: noUserError };
      }

      console.log("Login successful:", data.user.email);
      toast.success('Sesión iniciada con éxito');
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(`Error inesperado: ${error.message || 'Desconocido'}`);
      return { user: null, error };
    } finally {
      // Don't set loading false here - the auth state listener will do it
      // This prevents race conditions
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
        toast.error(`Error al registrar: ${error.message}`);
        return { user: null, error };
      }
      
      toast.success('Cuenta creada con éxito. Por favor, verifica tu correo electrónico.');
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("Error registering:", error);
      toast.error(`Error inesperado: ${error.message || 'Desconocido'}`);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast.error(`Error al cerrar sesión: ${error.message}`);
        return;
      }
      
      // No need to reset state here as the auth state listener will do it
      toast.success('Sesión cerrada con éxito');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`Error al cerrar sesión: ${error.message || 'Desconocido'}`);
    } finally {
      setLoading(false);
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
      setLoading(false);
    }
  };

  // Create the context value with all the authentication methods
  const contextValue: AuthContextProps = {
    user: supabaseUser, // Native Supabase user
    currentUser: userData, // Our UserData format
    userData,
    session,
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
          return { success: false, error: new Error('No hay usuario autenticado') };
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
