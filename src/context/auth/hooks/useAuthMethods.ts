
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserData } from '@/types/auth';
import { toast } from 'sonner';
import { mapUserData } from './utils/userDataMapper';

interface UseAuthMethodsProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export const useAuthMethods = ({ setLoading, setUserData }: UseAuthMethodsProps) => {
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        toast.success(`¡Welcome back, ${data.user.email}!`);
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

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUserData(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`Error signing out: ${error.message}`);
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

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: role
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      return { success: false, error };
    }
  };

  const verifyEmail = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('verify_user_email', {
        target_user_id: userId
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error verifying email:', error);
      return { success: false, error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (data && data.session) {
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

  const refreshUserData = async () => {
    try {
      setLoading(true);
      console.log("Refreshing user data...");
      
      const { data: sessionData, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        throw error;
      }
      
      const currentSession = sessionData?.session;
      
      if (currentSession?.user) {
        const mappedUserData = await mapUserData(currentSession.user);
        setUserData(mappedUserData);
        console.log("User data refreshed successfully:", mappedUserData.role);
      } else {
        console.log("No active session found during refresh");
        setUserData(null);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Error al actualizar los datos de usuario');
      return { success: false, error };
    } finally {
      setLoading(false);
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
      }

      const users = profiles?.map(profile => {
        const userRole = userRoles?.find(ur => ur.user_id === profile.id);
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

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserRole,
    verifyEmail,
    refreshSession,
    refreshUserData,
    getAllUsers,
  };
};
