
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const setSpecificUserAsVerifiedOwner = async (email: string, showToast: boolean = false): Promise<boolean> => {
  if (!email) {
    console.error("No email provided for setSpecificUserAsVerifiedOwner");
    return false;
  }

  try {
    console.log(`Setting ${email} as verified owner...`);
    
    // Try finding the user in the database first
    let userExists = false;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (profileData && profileData.id) {
        userExists = true;
        console.log(`User found with ID: ${profileData.id}`);
      }
    } catch (error) {
      console.error('Error checking for existing user:', error);
    }
    
    if (userExists) {
      // Update the user role to owner using the RPC function
      const { error: rpcError } = await supabase.rpc('update_user_role', {
        target_user_id: userExists,
        new_role: 'owner'
      });
      
      if (rpcError) {
        console.error('RPC Error setting user as owner:', rpcError);
        throw rpcError;
      }
      
      if (showToast) {
        toast.success(`${email} ha sido configurado como propietario`);
      }
      
      console.log(`✅ ${email} successfully set as owner`);
      return true;
    } else {
      console.log(`User ${email} not found in database`);
      return false;
    }
  } catch (error) {
    console.error('Error setting verified owner:', error);
    return false;
  }
};
