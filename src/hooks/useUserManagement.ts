
import { useState } from 'react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { fetchUserData, updateUserRoleInDb, getUsersFromDb } from '@/utils/authUtils';
import { UserRole, UserData } from '@/types/auth';
import { User } from 'firebase/auth';
import { toast } from 'sonner';

export const useUserManagement = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
) => {
  const [loading, setLoading] = useState(false);
  
  const refreshUserData = async (user: User | null) => {
    if (user) {
      const userData = await fetchUserData(user);
      if (userData) {
        setUserData(userData);
      }
    }
  };
  
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
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
      await updateUserRoleInDb(uid, role);
      toast.success('Rol de usuario actualizado con éxito');
      
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        await refreshUserData(currentUser);
      }
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
      const users = await getUsersFromDb();
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
