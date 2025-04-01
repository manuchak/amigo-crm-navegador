
import { useState } from 'react';
import { UserRole, UserData } from '@/types/auth';
import { toast } from 'sonner';
import {
  signOut as localSignOut,
  updateUserRole as localUpdateUserRole,
  getAllUsers as localGetAllUsers,
  getCurrentUser
} from '@/utils/localAuthStorage';

export const useUserManagement = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
) => {
  const [loading, setLoading] = useState(false);
  
  const refreshUserData = async () => {
    const userData = getCurrentUser();
    if (userData) {
      setUserData(userData);
    }
  };
  
  const signOut = async () => {
    try {
      localSignOut();
      setUserData(null);
      toast.success('Sesión cerrada con éxito');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };
  
  const updateUserRole = async (uid: string, role: UserRole) => {
    setLoading(true);
    try {
      localUpdateUserRole(uid, role);
      toast.success('Rol de usuario actualizado con éxito');
      await refreshUserData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol de usuario');
    } finally {
      setLoading(false);
    }
  };
  
  const getAllUsers = async (): Promise<UserData[]> => {
    setLoading(true);
    try {
      const users = localGetAllUsers();
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    refreshUserData,
    signOut,
    updateUserRole,
    getAllUsers,
    loading
  };
};
