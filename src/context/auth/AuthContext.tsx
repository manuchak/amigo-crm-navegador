
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthContextProps, UserData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Create a context with a default undefined value
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  
  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    console.log('Configurando escuchas de autenticación...');
    
    // 1. Primero configurar el listener para cambios de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Evento de autenticación:', event);
        
        if (session?.user) {
          try {
            // Obtener datos del perfil
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            // Obtener rol del usuario
            const { data: roleData } = await supabase
              .rpc('get_user_role', { user_uid: session.user.id });
            
            // Crear objeto userData
            const user: UserData = {
              uid: session.user.id,
              email: session.user.email || '',
              displayName: profileData?.display_name || session.user.email || '',
              role: roleData as any || 'unverified',
              emailVerified: session.user.email_confirmed_at ? true : false,
              createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
              lastLogin: profileData?.last_login ? new Date(profileData.last_login) : new Date(),
            };
            
            console.log('Usuario autenticado cargado:', user);
            setUserData(user);
          } catch (error) {
            console.error('Error al obtener datos del perfil:', error);
          }
        } else {
          console.log('No hay sesión de usuario activa');
          setUserData(null);
        }
        
        setLoading(false);
      }
    );

    // 2. Verificar si ya hay una sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sesión existente:', session ? 'Sí' : 'No');
      
      if (!session) {
        setLoading(false);
        setIsInitializing(false);
      }
      // No actualizamos el estado del usuario aquí porque el listener se encargará de eso
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Funciones de autenticación
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Intentando iniciar sesión:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Error de inicio de sesión:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("No se pudo iniciar sesión");
      }

      console.log("Inicio de sesión exitoso:", data.user.email);
      toast.success('Sesión iniciada con éxito');
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      console.log("Intentando crear usuario:", email);
      
      // Crear usuario con confirmación de correo electrónico
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/verify-confirmation`
        },
      });
      
      if (error) {
        console.error("Error al registrar:", error);
        throw error;
      }
      
      toast.success('Cuenta creada con éxito. Por favor, verifica tu correo electrónico.');
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("Error al registrar:", error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Cerrando sesión...");
      await supabase.auth.signOut();
      setUserData(null);
      toast.success('Sesión cerrada con éxito');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      console.log(`Intentando restablecer contraseña para: ${email}`);
      
      // Get the current domain for redirects
      const redirectURL = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectURL,
      });
      
      if (error) {
        console.error("Error al enviar email de recuperación:", error);
        throw error;
      }
      
      console.log("Email de recuperación enviado");
      toast.success('Se ha enviado un correo para restablecer la contraseña');
      return { success: true };
    } catch (error: any) {
      console.error("Error al restablecer contraseña:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  // Create the context value with all the authentication methods
  const contextValue: AuthContextProps = {
    user: userData,
    currentUser: userData,
    userData,
    session: null,
    loading,
    isInitializing,
    signIn,
    signUp,
    signOut,
    updateUserRole: async (userId, role) => {
      try {
        const { error } = await supabase.rpc('update_user_role', {
          target_user_id: userId,
          new_role: role
        });
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error al actualizar rol:', error);
        return { success: false, error: error as Error };
      }
    },
    getAllUsers: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            display_name,
            last_login,
            created_at,
            photo_url
          `);
        
        if (error) throw error;
        
        // Obtener roles para cada usuario
        const usersWithRoles = await Promise.all(data.map(async (user) => {
          const { data: role } = await supabase
            .rpc('get_user_role', { user_uid: user.id });
          
          return {
            uid: user.id,
            email: user.email,
            displayName: user.display_name,
            photoURL: user.photo_url,
            role: role as any,
            emailVerified: true, // Esto se maneja a nivel de Supabase
            createdAt: new Date(user.created_at),
            lastLogin: user.last_login ? new Date(user.last_login) : null,
          } as UserData;
        }));
        
        return usersWithRoles;
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
      }
    },
    verifyEmail: async (userId) => {
      try {
        const { error } = await supabase.rpc('verify_user_email', {
          target_user_id: userId
        });
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error('Error al verificar correo:', error);
        return { success: false, error: error as Error };
      }
    },
    refreshSession: async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return !!data.session;
      } catch (error) {
        console.error('Error al refrescar sesión:', error);
        return false;
      }
    },
    refreshUserData: async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          return { success: false, error: new Error('No hay usuario autenticado') };
        }
        
        // El listener de onAuthStateChange actualizará el estado
        return { success: true };
      } catch (error) {
        console.error('Error al actualizar datos de usuario:', error);
        return { success: false, error: error as Error };
      }
    },
    resetPassword,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
