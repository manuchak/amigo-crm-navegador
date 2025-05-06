
import { UserData, UserRole } from '@/types/auth';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { updateLastLogin } from './userActions';

/**
 * Maps a Supabase User to our UserData format
 */
export async function mapUserData(user: User): Promise<UserData> {
  try {
    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error getting profile data:', profileError);
    }
    
    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { user_uid: user.id });
    
    if (roleError) {
      console.error('Error getting user role:', roleError);
    }
    
    // Update last login timestamp
    await updateLastLogin(user.id);
    
    // Return mapped user data
    return {
      uid: user.id,
      email: user.email || '',
      displayName: profileData?.display_name || user.email || '',
      photoURL: profileData?.photo_url || undefined,
      role: (roleData as UserRole) || 'unverified',
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
      lastLogin: profileData?.last_login ? new Date(profileData.last_login) : new Date(),
    };
  } catch (error) {
    console.error('Error mapping user data:', error);
    
    // Return basic user data if mapping fails
    return {
      uid: user.id,
      email: user.email || '',
      displayName: user.email || '',
      role: 'unverified' as UserRole,
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
  }
}
