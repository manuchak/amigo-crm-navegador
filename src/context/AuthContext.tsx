
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserData, AuthContextProps } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session, User } from '@supabase/supabase-js';
import { setSpecificUserAsVerifiedOwner } from '@/utils/setVerifiedOwner';

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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to map Supabase user data to our UserData format
  const mapUserData = async (user: User): Promise<UserData | null> => {
    if (!user) return null;

    try {
      // Get profile data using the proper typing
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get user role using RPC function
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role', { user_uid: user.id })
        .single();

      if (roleError) throw roleError;

      return {
        uid: user.id,
        email: user.email || '',
        displayName: profileData?.display_name || user.email || '',
        photoURL: profileData?.photo_url,
        role: roleData as any || 'unverified',
        emailVerified: user.email_confirmed_at ? true : false,
        createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
        lastLogin: profileData?.last_login ? new Date(profileData.last_login) : new Date(),
      };
    } catch (error) {
      console.error('Error mapping user data:', error);
      return null;
    }
  };

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mappedUserData = await mapUserData(session.user);
        if (mappedUserData) {
          setUserData(mappedUserData);
          
          // Update last login timestamp
          await supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', session.user.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Error al actualizar los datos de usuario');
    }
  };

  // Authentication functions
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Correo o contraseña incorrectos';
        throw new Error(errorMessage);
      }

      const mappedUserData = await mapUserData(data.user);
      setUserData(mappedUserData);
      
      toast.success('Sesión iniciada con éxito');
      return mappedUserData;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        let errorMessage = 'Error al crear la cuenta';
        if (error.message.includes('already')) {
          errorMessage = 'El correo electrónico ya está en uso.';
        }
        throw new Error(errorMessage);
      }

      const mappedUserData = await mapUserData(data.user);
      setUserData(mappedUserData);
      
      toast.success('Cuenta creada con éxito. Por favor, verifica tu correo electrónico.');
      return mappedUserData;
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Error al crear la cuenta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserData(null);
      setSession(null);
      toast.success('Sesión cerrada con éxito');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      toast.success('Se ha enviado un correo para restablecer la contraseña');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      toast.error('Error al enviar el correo de restablecimiento');
    } finally {
      setLoading(false);
    }
  };

  // User management functions
  const updateUserRole = async (uid: string, role: any) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: uid,
        new_role: role
      });
      
      if (error) throw error;
      toast.success('Rol de usuario actualizado con éxito');
      await refreshUserData();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol de usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Define interfaces for the data returned from Supabase
  interface ProfileData {
    id: string;
    email: string;
    display_name: string;
    photo_url?: string;
    created_at: string;
    last_login: string;
  }

  interface UserRoleData {
    id: string;
    user_id: string;
    role: string;
  }

  const getAllUsers = async (): Promise<UserData[]> => {
    setLoading(true);
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Get all users from auth.users through the admin API (this uses the service role)
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      if (authUsersError) throw authUsersError;
      
      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      
      // Combine the data - properly typed now
      const mappedUsers: UserData[] = (profiles as ProfileData[]).map(profile => {
        const authUser = authUsers.users.find(user => user.id === profile.id);
        const userRole = (roles as UserRoleData[]).find(role => role.user_id === profile.id);
        
        return {
          uid: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          photoURL: profile.photo_url,
          role: userRole?.role as any || 'unverified',
          emailVerified: authUser?.email_confirmed_at ? true : false,
          createdAt: new Date(profile.created_at),
          lastLogin: new Date(profile.last_login)
        };
      });
      
      return mappedUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const verifyEmail = async (uid: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('verify_user_email', {
        target_user_id: uid
      });
      
      if (error) throw error;
      toast.success('Correo electrónico verificado con éxito');
      await refreshUserData();
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Error al verificar el correo electrónico');
    } finally {
      setLoading(false);
    }
  };
  
  const setUserAsVerifiedOwner = async (email: string) => {
    setLoading(true);
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        toast.error(`Usuario con email ${email} no encontrado`);
        return;
      }
      
      // Update user role to owner
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: user.id,
        new_role: 'owner'
      });
      
      if (error) throw error;
      toast.success(`Usuario ${email} configurado como propietario verificado`);
      await refreshUserData();
    } catch (error) {
      console.error('Error setting user as verified owner:', error);
      toast.error('Error al configurar el usuario como propietario verificado');
    } finally {
      setLoading(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // First set up the auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            // Handle auth state changes
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
        setSpecificUserAsVerifiedOwner('manuel.chacon@detectasecurity.io');
        
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
