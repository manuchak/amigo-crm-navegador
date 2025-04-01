
import { useState } from 'react';
import { UserRole, UserData } from '@/types/auth';
import { toast } from 'sonner';
import {
  signOut as localSignOut,
  updateUserRole as localUpdateUserRole,
  getAllUsers as localGetAllUsers,
  getCurrentUser,
  verifyUserEmail,
  findUserByEmail,
  setAsVerifiedOwner
} from '@/utils/localAuthStorage';

export const useUserManagement = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
) => {
  const [loading, setLoading] = useState(false);
  
  const refreshUserData = async () => {
    setLoading(true);
    try {
      const userData = getCurrentUser();
      if (userData) {
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Error al actualizar los datos de usuario');
    } finally {
      setLoading(false);
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

  const verifyEmail = async (uid: string) => {
    setLoading(true);
    try {
      verifyUserEmail(uid);
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
      const user = findUserByEmail(email);
      if (!user) {
        toast.error(`Usuario con email ${email} no encontrado`);
        return;
      }
      
      setAsVerifiedOwner(user.uid);
      toast.success(`Usuario ${email} configurado como propietario verificado`);
      await refreshUserData();
    } catch (error) {
      console.error('Error setting user as verified owner:', error);
      toast.error('Error al configurar el usuario como propietario verificado');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    refreshUserData,
    signOut,
    updateUserRole,
    getAllUsers,
    verifyEmail,
    setUserAsVerifiedOwner,
    loading
  };
};
