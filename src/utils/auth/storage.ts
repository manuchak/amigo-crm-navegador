
import { StoredUser, USERS_STORAGE_KEY, CURRENT_USER_KEY } from './types';
import { UserData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Esta función ahora usará Supabase para encontrar usuarios
export const findUserByEmail = async (email: string): Promise<StoredUser | null> => {
  try {
    // Buscar usuario en Supabase Auth
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error || !data) {
      console.log('Usuario no encontrado en Supabase:', email);
      return null;
    }
    
    const { data: user } = await supabase.auth.admin.getUserById(data.id);
    if (!user || !user.user) {
      return null;
    }
    
    // Obtener rol del usuario
    const { data: roleData } = await supabase
      .rpc('get_user_role', { user_uid: data.id });
    
    // Crear objeto StoredUser (no incluye contraseña real)
    const storedUser: StoredUser = {
      uid: data.id,
      email: data.email.toLowerCase(),
      password: '********', // No se devuelve la contraseña real
      displayName: data.display_name,
      role: roleData as any,
      emailVerified: user.user.email_confirmed_at ? true : false,
      createdAt: new Date(data.created_at),
      lastLogin: data.last_login ? new Date(data.last_login) : new Date()
    };
    
    return storedUser;
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    return null;
  }
};

// Estas funciones se mantienen por compatibilidad, pero ahora interactúan con Supabase

// Get users from localStorage (compatible)
export const getUsers = (): StoredUser[] => {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: new Date(user.lastLogin)
    }));
  } catch (error) {
    console.error('Error retrieving users:', error);
    return [];
  }
};

// Save users to localStorage (compatible)
export const saveUsers = (users: StoredUser[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Get current user from localStorage or Supabase
export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    // Intentar obtener usuario de Supabase
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      console.log('No hay usuario autenticado en Supabase');
      
      // Caer en localStorage como fallback
      const userJson = localStorage.getItem(CURRENT_USER_KEY);
      if (!userJson) return null;
      
      const user = JSON.parse(userJson);
      
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: new Date(user.lastLogin)
      };
    }
    
    // Obtener datos del perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    // Obtener rol del usuario
    const { data: roleData } = await supabase
      .rpc('get_user_role', { user_uid: data.user.id });
    
    // Crear objeto UserData
    return {
      uid: data.user.id,
      email: data.user.email || '',
      displayName: profileData?.display_name || data.user.email || '',
      role: roleData as any || 'unverified',
      emailVerified: data.user.email_confirmed_at ? true : false,
      createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
      lastLogin: profileData?.last_login ? new Date(profileData.last_login) : new Date(),
    };
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return null;
  }
};

// Set current user in localStorage (compatible)
export const setCurrentUser = (user: UserData): void => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};
