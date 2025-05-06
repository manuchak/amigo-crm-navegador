
import { User } from '@supabase/supabase-js';
import { UserData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Maps a Supabase User to the application's UserData format
 */
export const mapUserData = async (user: User | null): Promise<UserData | null> => {
  if (!user) return null;
  
  try {
    // Get user profile from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Handle error fetching profile
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }
    
    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { user_uid: user.id });
    
    // Handle error fetching role
    if (roleError) {
      console.error('Error fetching user role:', roleError);
    }
    
    // Create user data object
    return {
      uid: user.id,
      email: user.email || '',
      // Use profile display_name if available, otherwise fallback to user metadata
      displayName: profileData?.display_name || user.user_metadata?.display_name || user.email || '',
      role: roleData || 'unverified',
      // Consider email verified if confirmed_at exists
      emailVerified: user.email_confirmed_at ? true : false,
      // Use timestamps from profile if available, otherwise use current date
      createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
      lastLogin: profileData?.last_login ? new Date(profileData.last_login) : new Date(),
      photoURL: profileData?.photo_url || undefined,
    };
  } catch (error) {
    console.error('Error mapping user data:', error);
    return null;
  }
};
