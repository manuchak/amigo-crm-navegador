
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserData } from '@/types/auth';
import { ProfileData, UserRoleData, mapUserData } from './useSupabaseMappings';

export const useUserManagementMethods = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  refreshUserData: () => Promise<void>
) => {
  // User management functions
  const updateUserRole = async (uid: string, role: UserRole) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: uid,
        new_role: role
      });
      
      if (error) throw error;
      toast.success('Rol de usuario actualizado con éxito');
      await refreshUserData();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol de usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllUsers = async (): Promise<UserData[]> => {
    setLoading(true);
    try {
      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Get all users from auth.users through the admin API (this uses the service role)
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      if (authUsersError) throw authUsersError;
      
      // Get all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      
      // Ensure profiles is not null and handle its type properly
      if (!profilesData || !Array.isArray(profilesData) || profilesData.length === 0) return [];
      
      // Type assertions for the data with proper checks
      const profiles = profilesData as ProfileData[];
      const roles = rolesData ? (rolesData as UserRoleData[]) : [];
      
      // Combine the data with proper type checking
      const mappedUsers: UserData[] = [];
      
      for (const profile of profiles) {
        // Skip invalid profiles or profiles without an id
        if (!profile || typeof profile.id === 'undefined') {
          console.error('Invalid profile data found:', profile);
          continue;
        }
        
        // Find matching auth user with null checking
        const authUser = authUsers?.users ? 
          authUsers.users.find(user => user && user.id === profile.id) : 
          undefined;
        
        // Find user role with null checking
        const userRole = Array.isArray(roles) ? 
          roles.find(role => role && role.user_id === profile.id) : undefined;
        
        mappedUsers.push({
          uid: profile.id,
          email: profile.email,
          displayName: profile.display_name || profile.email || '',
          photoURL: profile.photo_url,
          role: (userRole?.role as UserRole) || 'unverified',
          emailVerified: authUser?.email_confirmed_at ? true : false,
          createdAt: new Date(profile.created_at),
          lastLogin: new Date(profile.last_login)
        });
      }
      
      return mappedUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const verifyEmail = async (uid: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('verify_user_email', {
        target_user_id: uid
      });
      
      if (error) throw error;
      toast.success('Correo electrónico verificado con éxito');
      await refreshUserData();
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Error al verificar el correo electrónico');
    } finally {
      setLoading(false);
    }
  };
  
  const setUserAsVerifiedOwner = async (email: string) => {
    if (!email) {
      console.error("No email provided for setUserAsVerifiedOwner");
      toast.error("Error: Email no proporcionado");
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting to set user ${email} as verified owner`);
      
      // Find user by email with proper error handling
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (userError) {
        console.error('Error finding user by email:', userError);
        throw userError;
      }
      
      // Add proper type guard for userData
      if (userData && userData !== null && 'id' in userData && userData.id) {
        // User exists in profiles, update role
        const { error } = await supabase.rpc('update_user_role', {
          target_user_id: userData.id,
          new_role: 'owner'
        });
        
        if (error) throw error;
        toast.success(`Usuario ${email} configurado como propietario verificado`);
        
        // Also verify the email
        await supabase.rpc('verify_user_email', {
          target_user_id: userData.id
        });
      } else {
        // User not found in profiles, check if exists in auth
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000 // Use a reasonable limit
          });
          
          if (authError) {
            console.error('Error checking user in auth:', authError);
            throw authError;
          }
          
          // Find user in auth data with null checking
          const authUser = authData?.users ? 
            authData.users.find(u => u && u.email && u.email.toLowerCase() === email.toLowerCase()) : 
            undefined;
          
          if (authUser) {
            // User exists in auth but not in profiles, create profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                email: email,
                display_name: `Admin ${email.split('@')[0]}`,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              })
              .select()
              .single();
            
            if (profileError) {
              console.error('Error creating profile:', profileError);
              throw profileError;
            }
            
            // Set role to owner
            const { error: roleError } = await supabase.rpc('update_user_role', {
              target_user_id: authUser.id,
              new_role: 'owner'
            });
            
            if (roleError) throw roleError;
            
            // Also verify the email
            await supabase.rpc('verify_user_email', {
              target_user_id: authUser.id
            });
            
            toast.success(`Usuario ${email} configurado como propietario verificado`);
          } else {
            // User doesn't exist, create new user with email confirmed
            const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
              email: email,
              password: 'Custodios2024',
              email_confirm: true, // This ensures the email is confirmed immediately
              user_metadata: {
                display_name: `Admin ${email.split('@')[0]}`
              }
            });
            
            if (signUpError || !newUser || !newUser.user) {
              console.error('Error creating user:', signUpError);
              
              // Try alternative method if admin API fails
              const { data: signUpData, error: altSignUpError } = await supabase.auth.signUp({
                email: email,
                password: 'Custodios2024',
                options: {
                  data: {
                    display_name: `Admin ${email.split('@')[0]}`
                  }
                }
              });
              
              if (altSignUpError || !signUpData.user) {
                console.error('Error creating user with alternative method:', altSignUpError);
                toast.error(`No se pudo crear el usuario: ${altSignUpError?.message || signUpError?.message || "Error desconocido"}`);
                return;
              }
              
              // Manually set user as verified
              await verifyEmail(signUpData.user.id);
              
              // Create profile for the newly created user
              await supabase
                .from('profiles')
                .insert({
                  id: signUpData.user.id,
                  email: email,
                  display_name: `Admin ${email.split('@')[0]}`,
                  created_at: new Date().toISOString(),
                  last_login: new Date().toISOString()
                });
                
              // Set role to owner
              await supabase.rpc('update_user_role', {
                target_user_id: signUpData.user.id,
                new_role: 'owner'
              });
              
              toast.success(`Usuario ${email} creado y configurado como propietario verificado`);
              return;
            }
            
            // Create profile for new user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: newUser.user.id,
                email: newUser.user.email || email,
                display_name: `Admin ${(newUser.user.email || email).split('@')[0]}`,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              });
            
            if (profileError) {
              console.error('Error creating profile for new user:', profileError);
              throw profileError;
            }
            
            // Set role to owner
            const { error: roleError } = await supabase.rpc('update_user_role', {
              target_user_id: newUser.user.id,
              new_role: 'owner'
            });
            
            if (roleError) throw roleError;
            toast.success(`Usuario ${email} creado y configurado como propietario verificado`);
          }
        } catch (authCheckError) {
          console.error('Error during auth check:', authCheckError);
          
          // Fallback: Create the user directly
          const { data: newUser, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: 'Custodios2024',
            options: {
              data: {
                display_name: `Admin ${email.split('@')[0]}`
              }
            }
          });
          
          if (signUpError || !newUser.user) {
            console.error('Error creating user in fallback path:', signUpError);
            toast.error(`No se pudo crear el usuario: ${signUpError?.message || 'Error desconocido'}`);
            return;
          }
          
          // Create profile
          await supabase
            .from('profiles')
            .insert({
              id: newUser.user.id,
              email: email,
              display_name: `Admin ${email.split('@')[0]}`,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            });
          
          // Set initial role to owner
          await supabase
            .from('user_roles')
            .insert({
              user_id: newUser.user.id,
              role: 'owner'
            });
          
          // Manually verify the email immediately
          await verifyEmail(newUser.user.id);
          toast.success(`Usuario ${email} creado y verificado como propietario`);
        }
      }
      
      await refreshUserData();
    } catch (error: any) {
      console.error('Error setting user as verified owner:', error);
      toast.error('Error al configurar el usuario como propietario verificado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUserRole,
    getAllUsers,
    verifyEmail,
    setUserAsVerifiedOwner
  };
};
