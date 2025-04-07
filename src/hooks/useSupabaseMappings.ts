
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';

// Define interfaces for the data returned from Supabase
export interface ProfileData {
  id: string;
  email: string;
  display_name: string;
  photo_url?: string;
  created_at: string;
  last_login: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: string;
}

// Function to map Supabase user data to our UserData format
export const mapUserData = async (user: User): Promise<UserData | null> => {
  if (!user) return null;

  try {
    // Get profile data using the proper typing
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id as string)
      .maybeSingle();

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
