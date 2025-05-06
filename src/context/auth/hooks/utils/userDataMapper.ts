
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';

/**
 * Maps a Supabase User object to our application's UserData format
 */
export const mapUserData = async (user: User): Promise<UserData> => {
  try {
    if (!user) {
      throw new Error('No user data provided to mapper');
    }
    
    console.log('Mapping user data for:', user.email);
    
    // Get profile data from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching profile data:', profileError);
    }
    
    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { user_uid: user.id });
    
    if (roleError) {
      console.error('Error fetching user role:', roleError);
    }
    
    // Update last login timestamp in profile
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    } catch (updateError) {
      console.error('Error updating last login time:', updateError);
    }
    
    // Construct and return the UserData object
    return {
      uid: user.id,
      email: user.email || '',
      displayName: profileData?.display_name || user.email || '',
      photoURL: profileData?.photo_url || null,
      role: roleData as any || 'unverified',
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
      lastLogin: profileData?.last_login ? new Date(profileData.last_login) : new Date(),
    };
  } catch (error) {
    console.error('Error in userDataMapper:', error);
    // Provide a minimal fallback object to prevent crashes
    return {
      uid: user.id,
      email: user.email || '',
      displayName: user.email || '',
      role: 'unverified',
      emailVerified: false,
      createdAt: new Date(),
      lastLogin: new Date()
    };
  }
};

/**
 * Updates the last login timestamp for a user
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last login time:', error);
  }
};
