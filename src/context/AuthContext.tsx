import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole, UserData, AuthContextProps } from '@/types/auth';

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

  // Function to get a user's role from Supabase
  const getUserRole = async (userId: string): Promise<UserRole> => {
    try {
      // Use the RPC function to get the user role
      const { data, error } = await supabase.rpc('get_user_role', {
        user_uid: userId
      }).single();

      if (error) throw error;
      return data as UserRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'unverified';
    }
  };

  // Function to map Supabase user to our UserData format
  const mapUserData = async (user: User): Promise<UserData> => {
    try {
      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get user role
      const role = await getUserRole(user.id);
      
      return {
        uid: user.id,
        email: user.email || '',
        displayName: profileData?.display_name || user.email || '',
        photoURL: profileData?.photo_url || undefined,
        role: role,
        emailVerified: user.email_confirmed_at ? true : false,
        createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
        lastLogin: profileData?.last_login ? new Date(profileData.last_login) : new Date(),
      };
    } catch (error) {
      console.error('Error mapping user data:', error);
      // Return basic user data if profile data cannot be fetched
      return {
        uid: user.id,
        email: user.email || '',
        displayName: user.email || '',
        role: 'unverified',
        emailVerified: user.email_confirmed_at ? true : false,
        createdAt: new Date(),
        lastLogin: new Date(),
      };
    }
  };

  // Function to update the user's last login
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      setLoading(true);
      console.log("Refreshing user data...");
      
      // Check if there's an active session
      const { data: sessionData, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        throw error;
      }
      
      if (sessionData?.session?.user) {
        const sessionUser = sessionData.session.user;
        setUser(sessionUser);
        setSession(sessionData.session);
        
        // Map user data from session
        const mappedUserData = await mapUserData(sessionUser);
        setUserData(mappedUserData);
        console.log("User data refreshed successfully:", mappedUserData.role);
      } else {
        console.log("No active session found during refresh");
        setUser(null);
        setSession(null);
        setUserData(null);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Error al actualizar los datos de usuario');
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh session
  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (data && data.session) {
        setSession(data.session);
        setUser(data.session.user);
        
        // Update userData
        if (data.session.user) {
          const userData = await mapUserData(data.session.user);
          setUserData(userData);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in refreshSession:', error);
      return false;
    }
  };

  // Set up the auth state listener
  useEffect(() => {
    // IMPORTANT: First set up the auth state listener, then check for existing session
    // This is critical to prevent authentication loops
    console.log("Setting up auth state listener...");
    setLoading(true);
    
    // First, configure the authentication event listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          setSession(newSession);
          setUser(newSession?.user || null);
          
          if (newSession?.user) {
            try {
              // Update last login using setTimeout to avoid Supabase deadlocks
              setTimeout(async () => {
                await updateLastLogin(newSession.user.id);
              }, 0);
              
              // Get complete user data
              const userData = await mapUserData(newSession.user);
              setUserData(userData);
            } catch (error) {
              console.error('Error mapping user data on auth change:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setSession(null);
          setUser(null);
          setUserData(null);
        }
        
        setLoading(false);
      }
    );

    // Second, check for existing session
    const checkExistingSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }
        
        if (data?.session) {
          console.log("Found existing session");
          setSession(data.session);
          setUser(data.session.user);
          
          // Process user data if there's a session
          if (data.session.user) {
            try {
              // Update last login using setTimeout to avoid Supabase deadlocks
              setTimeout(async () => {
                await updateLastLogin(data.session.user.id);
              }, 0);
              
              // Map user data
              const userData = await mapUserData(data.session.user);
              setUserData(userData);
            } catch (error) {
              console.error('Error mapping user data on init:', error);
            }
          }
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Update last login
        await updateLastLogin(data.user.id);
        
        // Update user and user data
        const userData = await mapUserData(data.user);
        setUserData(userData);
        console.log('User authenticated:', userData);
        
        toast.success(`¡Welcome back, ${userData.displayName || email}!`);
      }
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(`Error logging in: ${error.message}`);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        }
      });

      if (error) throw error;
      
      toast.success('Account created successfully');
      return { user: data.user, error: null };
    } catch (error: any) {
      toast.error(`Error creating account: ${error.message}`);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      toast.success(`Password reset email sent to ${email}`);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(`Error sending reset password email: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear local state
      setSession(null);
      setUser(null);
      setUserData(null);
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`Error signing out: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: role
      });

      if (error) throw error;
      
      // If we updated our own user, update the local state
      if (user?.id === userId) {
        setUserData(prev => prev ? { ...prev, role } : null);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      return { success: false, error };
    }
  };

  const getAllUsers = async (): Promise<UserData[]> => {
    try {
      // First, get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profileError) throw profileError;

      // Then, get all users with their roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;

      // Get all auth users (requires admin privileges or use service role key)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        // Continue with what we have if this fails
      }

      const users = profiles?.map(profile => {
        // Find the role for this user
        const userRole = userRoles?.find(ur => ur.user_id === profile.id);
        
        // Find auth user data
        // Fix for the TypeScript error - check if users array exists before using find
        const authUsersList = authUsers?.users || [];
        const authUser = authUsersList.find(u => u.id === profile.id);
        
        return {
          uid: profile.id,
          email: profile.email,
          displayName: profile.display_name || profile.email,
          photoURL: profile.photo_url || undefined,
          role: (userRole?.role as UserRole) || 'unverified',
          emailVerified: authUser?.email_confirmed_at ? true : false,
          createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
          lastLogin: profile.last_login ? new Date(profile.last_login) : new Date(),
        };
      }) || [];

      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      toast.error('Error retrieving user list');
      return [];
    }
  };

  const verifyEmail = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('verify_user_email', {
        target_user_id: userId
      });

      if (error) throw error;

      // If we verified our own email, update the local state
      if (user?.id === userId) {
        setUserData(prev => prev ? { ...prev, emailVerified: true } : null);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error verifying email:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    currentUser: userData, // Map userData to currentUser for backward compatibility
    userData,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserRole,
    getAllUsers,
    verifyEmail,
    refreshSession,
    refreshUserData,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
