
import { User } from '@supabase/supabase-js';
import { UserData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Maps a Supabase User to our internal UserData type
 */
export const mapUserData = async (user: User | null): Promise<UserData | null> => {
  if (!user) return null;

  try {
    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { user_uid: user.id });
    
    if (roleError) {
      console.error('Error getting user role:', roleError);
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, photo_url, last_login')
      .eq('id', user.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error getting profile:', profileError);
    }

    // Create user data object
    const userData: UserData = {
      uid: user.id,
      email: user.email || '',
      displayName: profile?.display_name || user.email?.split('@')[0] || 'User',
      photoURL: profile?.photo_url || undefined,
      role: (roleData as UserRole) || 'unverified',
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: user.created_at ? new Date(user.created_at) : new Date(),
      lastLogin: profile?.last_login ? new Date(profile.last_login) : new Date(),
    };

    return userData;
  } catch (error) {
    console.error('Error mapping user data:', error);
    return null;
  }
};
