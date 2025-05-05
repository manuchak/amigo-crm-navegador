
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
      // First check if the user already has owner role
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session?.user?.email?.toLowerCase() === email.toLowerCase()) {
        console.log("Checking current user role...");
        
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
          user_uid: currentSession.session.user.id
        });
        
        if (!roleError && roleData === 'owner') {
          console.log("User is already an owner, no changes needed");
          if (showToast) {
            toast.success(`Ya eres propietario del sistema`);
          }
          return true;
        }
      }
      
      // Try to find user by email in profiles
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
        
        // If user still not found, try another approach with getUser
        if (!userExists) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.email?.toLowerCase() === email.toLowerCase()) {
            userExists = true;
            userId = sessionData.session.user.id;
            console.log(`User found from session with ID: ${userId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking for existing user:', error);
    }
    
    if (userExists && userId) {
      // First try: direct user_roles table manipulation
      console.log(`Attempting to update user ${email} (${userId}) to owner role via direct table access...`);
      
      try {
        // Check if entry exists
        const { data: existingRole, error: checkError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking existing role:', checkError);
        }
        
        if (existingRole) {
          // Update existing entry
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({ role: 'owner' })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error('Error updating role:', updateError);
            throw updateError;
          } else {
            console.log('Successfully updated role to owner via direct table update');
          }
        } else {
          // Insert new entry
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role: 'owner',
              assigned_by: userId // Self-assigned
            });
            
          if (insertError) {
            console.error('Error inserting owner role:', insertError);
            throw insertError;
          } else {
            console.log('Successfully inserted owner role via direct table insert');
          }
        }
      } catch (directUpdateError) {
        console.error('Error with direct table manipulation:', directUpdateError);
        
        // Second try: Use the RPC function
        try {
          console.log(`Attempting to update user ${email} (${userId}) to owner role using RPC...`);
          
          const { error: rpcError } = await supabase.rpc('update_user_role', {
            target_user_id: userId,
            new_role: 'owner'
          });
          
          if (rpcError) {
            console.error('RPC Error setting user as owner:', rpcError);
            throw rpcError;
          } else {
            console.log('Successfully set role to owner via RPC function');
          }
        } catch (rpcError) {
          console.error('Error using RPC method:', rpcError);
          
          // Last resort: Try another table operation with different approach
          try {
            console.log('Trying final fallback method to set user as owner...');
            
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
              console.error('Error inserting owner role in fallback:', insertError);
              throw insertError;
            } else {
              console.log('Successfully set owner role via direct insert fallback');
            }
          } catch (fallbackError) {
            console.error('Error in all fallback methods:', fallbackError);
            throw fallbackError;
          }
        }
      }
      
      if (showToast) {
        toast.success(`${email} ha sido configurado como propietario`);
      }
      
      console.log(`✅ ${email} successfully set as owner`);
      return true;
    } else {
      console.log(`User ${email} not found in database`);
      if (showToast) {
        toast.error(`No se pudo encontrar al usuario ${email} en el sistema`);
      }
      return false;
    }
  } catch (error) {
    console.error('Error setting verified owner:', error);
    if (showToast) {
      toast.error('Error al configurar propietario del sistema');
    }
    return false;
  }
};

// Función específica para establecer a Manuel como propietario
export const setManuelAsOwner = async () => {
  return await setSpecificUserAsVerifiedOwner('manuel.chacon@detectasecurity.io', true);
};
