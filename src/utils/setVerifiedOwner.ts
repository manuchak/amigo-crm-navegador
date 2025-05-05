
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define proper type for user data returned from auth.admin.listUsers
interface SupabaseAuthUser {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  last_sign_in_at?: string;
  // Add other properties as needed
}

interface SupabaseAuthResponse {
  users: SupabaseAuthUser[];
  total?: number;
}

export const setSpecificUserAsVerifiedOwner = async (email: string, showToast: boolean = false): Promise<boolean> => {
  if (!email) {
    console.error("No email provided for setSpecificUserAsVerifiedOwner");
    return false;
  }

  try {
    console.log(`Setting ${email} as verified owner...`);
    
    // Try finding the user in the database first
    let userExists = false;
    let userId: string | undefined;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (profileData && profileData.id) {
        userExists = true;
        userId = profileData.id;
        console.log(`User found with ID: ${profileData.id}`);
      } else if (profileError) {
        console.error('Error checking for existing user:', profileError);
      } else {
        console.log(`User with email ${email} not found in profiles`);
        
        // Try to find user in auth.users directly (requires admin privileges)
        try {
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers() as { 
            data: SupabaseAuthResponse | null; 
            error: any 
          };
          
          if (userError) {
            console.error('Error listing users:', userError);
          } else if (userData && userData.users) {
            // Now TypeScript knows that users have an email property
            const foundUser = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
            if (foundUser) {
              userExists = true;
              userId = foundUser.id;
              console.log(`User found in auth.users with ID: ${foundUser.id}`);
            }
          }
        } catch (authError) {
          console.error('Error checking auth.users:', authError);
        }
      }
    } catch (error) {
      console.error('Error checking for existing user:', error);
    }
    
    if (userExists && userId) {
      // Update the user role to owner using the RPC function
      console.log(`Updating user ${email} (${userId}) to owner role...`);
      
      const { error: rpcError } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: 'owner'
      });
      
      if (rpcError) {
        console.error('RPC Error setting user as owner:', rpcError);
        
        // Try manually inserting into user_roles table as fallback
        try {
          console.log('Trying fallback method to set user as owner...');
          
          // Delete any existing roles first
          const { error: deleteError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);
            
          if (deleteError) {
            console.error('Error deleting existing roles:', deleteError);
          }
          
          // Insert new owner role
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role: 'owner',
              assigned_by: userId // Self-assigned as fallback
            });
            
          if (insertError) {
            console.error('Error inserting owner role:', insertError);
            throw insertError;
          } else {
            console.log('Successfully set owner role via direct insert');
          }
        } catch (fallbackError) {
          console.error('Error in fallback method:', fallbackError);
          throw rpcError;
        }
      }
      
      if (showToast) {
        toast.success(`${email} ha sido configurado como propietario`);
      }
      
      console.log(`✅ ${email} successfully set as owner`);
      return true;
    } else {
      console.log(`User ${email} not found in database`);
      
      // Could attempt to create user here, but would need more info
      // This would require a more complex function
      
      return false;
    }
  } catch (error) {
    console.error('Error setting verified owner:', error);
    return false;
  }
};

// Función específica para establecer a Manuel como propietario
export const setManuelAsOwner = async () => {
  return await setSpecificUserAsVerifiedOwner('manuel.chacon@detectasecurity.io', true);
};
