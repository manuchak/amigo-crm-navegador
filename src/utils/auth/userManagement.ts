
import { UserData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Add some default users if they don't exist
const ensureDefaultUsers = async () => {
  try {
    // Verificar si existe el usuario por defecto
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'manuel.chacon@detectasecurity.io')
      .single();

    if (!existingUser) {
      console.log("No se encontró el usuario predeterminado, creándolo...");
      
      // Crear el usuario en auth.users
      const { data: authUser, error: signUpError } = await supabase.auth.signUp({
        email: 'manuel.chacon@detectasecurity.io',
        password: 'password123',
        options: {
          data: {
            display_name: "MANUEL CHACON"
          }
        }
      });

      if (signUpError) {
        console.error("Error creando usuario por defecto en auth:", signUpError);
        return;
      }

      if (authUser?.user) {
        // Marcar el email como verificado (requiere función RPC con security definer)
        await supabase.rpc('verify_user_email', {
          target_user_id: authUser.user.id
        });

        // Asignar rol de owner (requiere función RPC con security definer)
        await supabase.rpc('update_user_role', {
          target_user_id: authUser.user.id,
          new_role: 'owner'
        });
        
        console.log("Usuario por defecto creado con éxito:", authUser.user.email);
      }
    } else {
      console.log("Usuario por defecto ya existe:", existingUser.email);
    }
  } catch (error) {
    console.error("Error al verificar/crear usuario por defecto:", error);
  }
};

// Llamar a esta función para asegurar que existan usuarios por defecto
ensureDefaultUsers();

export const createUser = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<UserData> => {
  try {
    // Registrar el usuario con Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      }
    });

    if (error) throw error;
    
    if (!data.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // El perfil y roles se crean automáticamente mediante hooks en Supabase
    
    // Devolver datos del usuario
    const userData: UserData = {
      uid: data.user.id,
      email: data.user.email || '',
      displayName: displayName,
      role: 'pending',
      emailVerified: false,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    return userData;
  } catch (error: any) {
    console.error('Error en createUser:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<UserData> => {
  try {
    // Iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error en loginUser:', error);
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('auth/wrong-password');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('auth/email-not-verified');
      } else {
        throw new Error(error.message);
      }
    }
    
    if (!data.user) {
      throw new Error('auth/user-not-found');
    }

    // Obtener el rol del usuario
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { user_uid: data.user.id });

    if (roleError) {
      console.error('Error obteniendo el rol del usuario:', roleError);
    }

    // Actualizar la hora del último inicio de sesión
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);
    
    // Crear objeto UserData
    const userData: UserData = {
      uid: data.user.id,
      email: data.user.email || '',
      displayName: data.user?.user_metadata?.display_name || email,
      role: (roleData as UserRole) || 'pending',
      emailVerified: data.user.email_confirmed_at ? true : false,
      createdAt: new Date(data.user.created_at),
      lastLogin: new Date()
    };

    return userData;
  } catch (error: any) {
    console.error('Error en loginUser:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    console.log(`Enviando correo de restablecimiento para: ${email}`);
    
    // Get the current domain for redirects
    const redirectURL = typeof window !== 'undefined' 
      ? `${window.location.origin}/reset-password`
      : undefined;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectURL,
    });
    
    if (error) {
      console.error('Error al enviar correo de recuperación:', error);
      throw error;
    }
    
    console.log(`Correo de restablecimiento enviado a ${email}`);
  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};
