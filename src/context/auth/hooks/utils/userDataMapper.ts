
import { User } from '@supabase/supabase-js';
import { UserData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export async function mapUserData(user: User): Promise<UserData> {
  console.log('Mapping user data for:', user.email);
  
  try {
    // Get profile data from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Get user role from RPC function
    const { data: role } = await supabase
      .rpc('get_user_role', { user_uid: user.id });
    
    // Create UserData object
    return {
      uid: user.id,
      email: user.email || '',
      displayName: profile?.display_name || user.email || '',
      photoURL: profile?.photo_url || null,
      role: role as any || 'unverified',
      emailVerified: user.email_confirmed_at ? true : false,
      createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
      lastLogin: profile?.last_login ? new Date(profile.last_login) : new Date(),
    };
  } catch (error) {
    console.error('Error mapping user data:', error);
    
    // Return minimal user data if profile fetch fails
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
}
