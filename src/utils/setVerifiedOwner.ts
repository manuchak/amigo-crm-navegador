
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
        } else if (roleError) {
          console.error("Error checking role:", roleError);
        } else {
          console.log(`Current role is "${roleData}", attempting to update to owner`);
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
        console.error('Error checking for existing user in profiles:', profileError);
      } else {
        console.log(`User with email ${email} not found in profiles`);
        
        // Try to find user in auth.users directly
        try {
          const { data: authData } = await supabase.auth.getUser();
          console.log("Current authenticated user:", authData?.user?.email);
          
          // If current user email matches the target email
          if (authData?.user?.email?.toLowerCase() === email.toLowerCase()) {
            userExists = true;
            userId = authData.user.id;
            console.log(`Using current authenticated user with ID: ${userId}`);
          } else {
            // Try to use admin.listUsers if available
            try {
              console.log("Attempting to use admin.listUsers API");
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
                } else {
                  console.log(`User with email ${email} not found in auth.users list`);
                }
              }
            } catch (authError) {
              console.error('Error checking auth.users:', authError);
            }
          }
        } catch (sessionError) {
          console.error('Error getting current user session:', sessionError);
        }
      }
    } catch (error) {
      console.error('Error searching for user:', error);
    }
    
    if (userExists && userId) {
      console.log(`User found! Attempting to update ${userId} to owner role`);
      
      // First try: direct role assignment through RPC function
      try {
        console.log(`Attempting to use update_user_role RPC function for user ${userId}`);
        
        const { error: rpcError } = await supabase.rpc('update_user_role', {
          target_user_id: userId,
          new_role: 'owner'
        });
        
        if (rpcError) {
          console.error('RPC Error:', rpcError);
          // Continue to fallback methods
        } else {
          console.log('Successfully set role to owner via RPC function');
          if (showToast) {
            toast.success(`${email} ha sido configurado como propietario`);
          }
          return true;
        }
      } catch (rpcError) {
        console.error('Error using RPC method:', rpcError);
      }
      
      // Second try: direct user_roles table manipulation
      try {
        console.log(`Attempting direct table manipulation for user ${userId}`);
        
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
          } else {
            console.log('Successfully updated role to owner via direct table update');
            if (showToast) {
              toast.success(`${email} ha sido configurado como propietario`);
            }
            return true;
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
          } else {
            console.log('Successfully inserted owner role via direct table insert');
            if (showToast) {
              toast.success(`${email} ha sido configurado como propietario`);
            }
            return true;
          }
        }
      } catch (directError) {
        console.error('Error with direct table manipulation:', directError);
      }
      
      // Last resort: Another attempt with a different approach
      try {
        console.log('Trying final approach to set user as owner');
        
        // Delete any existing roles first
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) {
          console.error('Error deleting existing roles:', deleteError);
        }
        
        // Wait a moment before inserting new role (to avoid race conditions)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Insert new owner role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'owner',
            assigned_by: userId // Self-assigned as fallback
          });
          
        if (insertError) {
          console.error('Error inserting owner role in final attempt:', insertError);
          throw insertError;
        } else {
          console.log('Successfully set owner role via final approach');
          if (showToast) {
            toast.success(`${email} ha sido configurado como propietario`);
          }
          return true;
        }
      } catch (finalError) {
        console.error('Error in final owner assignment attempt:', finalError);
        throw finalError;
      }
    } else {
      console.log(`User ${email} not found in database`);
      if (showToast) {
        toast.error(`No se pudo encontrar al usuario ${email} en el sistema`);
      }
      return false;
    }
    
    // If we reach here, all attempts failed
    throw new Error("All methods to set owner role failed");
    
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
