
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserData, UserRole } from '@/types/auth';

export const mapUserData = async (user: User): Promise<UserData> => {
  try {
    // Get profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get user role
    const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
      user_uid: user.id
    });

    if (roleError) throw roleError;
      
    return {
      uid: user.id,
      email: user.email || '',
      displayName: profileData?.display_name || user.email || '',
      photoURL: profileData?.photo_url || undefined,
      role: roleData as UserRole || 'unverified',
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
