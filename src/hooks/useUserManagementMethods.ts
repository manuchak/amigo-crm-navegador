
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
      
      // Type assertions for the data
      const profiles = profilesData as unknown as ProfileData[];
      const roles = rolesData as unknown as UserRoleData[];
      
      // Combine the data
      const mappedUsers: UserData[] = profiles.map(profile => {
        const authUser = authUsers?.users?.find(user => user.id === profile.id);
        const userRole = roles && Array.isArray(roles) ? 
          roles.find(role => role.user_id === profile.id) : null;
        
        return {
          uid: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          photoURL: profile.photo_url,
          role: (userRole?.role as UserRole) || 'unverified',
          emailVerified: authUser?.email_confirmed_at ? true : false,
          createdAt: new Date(profile.created_at),
          lastLogin: new Date(profile.last_login)
        };
      });
      
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
    setLoading(true);
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email as any)
        .maybeSingle();
      
      if (userError) {
        console.error('Error finding user by email:', userError);
        throw userError;
      }
      
      if (user?.id) {
        // User exists in profiles, update role
        const { error } = await supabase.rpc('update_user_role', {
          target_user_id: user.id,
          new_role: 'owner'
        });
        
        if (error) throw error;
        toast.success(`Usuario ${email} configurado como propietario verificado`);
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
          
          const authUser = authData?.users?.find(u => u.email === email);
          
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
              } as any)
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
            toast.success(`Usuario ${email} configurado como propietario verificado`);
          } else {
            // User doesn't exist, create new user
            const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
              email: email,
              password: 'Custodios2024',
              email_confirm: true,
              user_metadata: {
                display_name: `Admin ${email.split('@')[0]}`
              }
            });
            
            if (signUpError || !newUser) {
              console.error('Error creating user:', signUpError);
              toast.error(`No se pudo crear el usuario: ${signUpError?.message}`);
              return;
            }
            
            // Create profile for new user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: newUser.user.id,
                email: email,
                display_name: `Admin ${email.split('@')[0]}`,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              } as any);
            
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
              },
              emailRedirectTo: `${window.location.origin}/verify-confirmation`
            }
          });
          
          if (signUpError || !newUser.user) {
            console.error('Error creating user in fallback path:', signUpError);
            toast.error(`No se pudo crear el usuario: ${signUpError?.message || 'Error desconocido'}`);
            return;
          }
          
          // Create profile
          await supabase.from('profiles').insert({
            id: newUser.user.id,
            email: email,
            display_name: `Admin ${email.split('@')[0]}`,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          } as any);
          
          // Set initial role to owner
          await supabase.from('user_roles').insert({
            user_id: newUser.user.id,
            role: 'owner'
          } as any);
          
          toast.success(`Usuario ${email} creado como propietario (requiere verificación de correo)`);
          
          // Manually verify the email
          try {
            await supabase.rpc('verify_user_email', {
              target_user_id: newUser.user.id
            });
            toast.success(`Correo de ${email} verificado automáticamente`);
          } catch (verifyError) {
            console.error('Could not auto-verify email:', verifyError);
          }
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
