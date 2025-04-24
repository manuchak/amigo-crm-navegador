
import { UserData, UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAllUsers as localGetAllUsers } from '@/utils/auth';
import { UserManagementHookProps } from './types';
import { useCallback } from 'react';

export const useUserListing = ({ setLoading }: UserManagementHookProps) => {
  const getAllUsers = useCallback(async (): Promise<UserData[]> => {
    setLoading(true);
    try {
      console.log('Getting all users...');
      
      // Intentar obtener usuarios de Supabase primero
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error('Error fetching profiles from Supabase:', profilesError);
          // Fallback a almacenamiento local si la consulta de Supabase falla
          const localUsers = localGetAllUsers();
          console.log('Users from local storage:', localUsers);
          return localUsers;
        }
        
        if (profiles && profiles.length > 0) {
          // Obtener roles para cada perfil
          const usersWithRoles: UserData[] = await Promise.all(
            profiles.map(async (profile) => {
              // Fetch role for this user
              const { data: roleData, error: roleError } = await supabase.rpc(
                'get_user_role', 
                { user_uid: profile.id }
              );
              
              const role = roleError ? 'unverified' : (roleData as UserRole || 'unverified');
              
              // También podemos verificar si el email está verificado
              const emailVerified = true; // Simplificado para evitar llamadas anidadas
              
              return {
                uid: profile.id,
                email: profile.email || '',
                displayName: profile.display_name || profile.email || '',
                photoURL: profile.photo_url || undefined,
                role: role,
                emailVerified: emailVerified,
                createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
                lastLogin: profile.last_login ? new Date(profile.last_login) : new Date(),
              } as UserData;
            })
          );
          
          return usersWithRoles;
        }
      } catch (supabaseError) {
        console.error('Error using Supabase for users, falling back:', supabaseError);
      }
      
      // Obtener usuarios del almacenamiento local como fallback
      const localUsers = localGetAllUsers();
      return localUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return { getAllUsers };
};
