
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/types/auth';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signUp: (email: string, password: string, options?: { metadata?: any }) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<{ success: boolean; error?: any }>;
  getAllUsers: () => Promise<UserData[]>;
  verifyEmail: (userId: string) => Promise<{ success: boolean; error?: any }>;
}

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
  };

  // Set up the auth state listener
  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);

        // Update user data if we have a session
        if (session?.user) {
          try {
            const userData = await mapUserData(session.user);
            setUserData(userData);
          } catch (error) {
            console.error('Error mapping user data:', error);
            setUserData(null);
          }
        } else {
          setUserData(null);
        }

        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // We defer this to prevent auth deadlocks
        setTimeout(async () => {
          try {
            const userData = await mapUserData(session.user);
            setUserData(userData);
          } catch (error) {
            console.error('Error mapping user data:', error);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (error: any) {
      toast.error(`Error al iniciar sesión: ${error.message}`);
      return { user: null, error };
    }
  };

  const signUp = async (email: string, password: string, options?: { metadata?: any }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: options || {},
      });

      if (error) throw error;
      
      toast.success('Cuenta creada con éxito');
      return { user: data.user, error: null };
    } catch (error: any) {
      toast.error(`Error al crear cuenta: ${error.message}`);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada con éxito');
    } catch (error: any) {
      toast.error(`Error al cerrar sesión: ${error.message}`);
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

      // Map profiles to UserData format
      const users = profiles.map(profile => {
        // Find the role for this user
        const userRole = userRoles.find(ur => ur.user_id === profile.id);
        
        // Find auth user data
        const authUser = authUsers?.users?.find(u => u.id === profile.id);
        
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
      });

      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      toast.error('Error al obtener la lista de usuarios');
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
    session,
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserRole,
    getAllUsers,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
