
import { toast } from 'sonner';
import { UserRole, UserData } from '@/types/auth';
import { SPECIAL_USERS } from './auth/constants';
import {
  createUser,
  findUserByEmail,
  updateUserRole,
  getAllUsers,
  verifyUserEmail,
  setAsVerifiedOwner
} from '@/utils/localAuthStorage';

export const useUserManagementMethods = (
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  refreshUserData: () => Promise<void>
) => {
  // User management functions
  const updateUserRoleMethod = async (uid: string, role: UserRole) => {
    setLoading(true);
    try {
      // Update user role in local storage
      updateUserRole(uid, role);
      
      toast.success('Rol de usuario actualizado con éxito');
      await refreshUserData();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol de usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllUsersMethod = async (): Promise<UserData[]> => {
    setLoading(true);
    try {
      // Get users from local storage
      const users = getAllUsers();
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const verifyEmailMethod = async (uid: string) => {
    setLoading(true);
    try {
      // Mark email as verified in local storage
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
  
  const setUserAsVerifiedOwnerMethod = async (email: string, showNotification: boolean = true) => {
    if (!email) {
      console.error("No email provided for setUserAsVerifiedOwner");
      return;
    }

    setLoading(true);
    try {
      console.log(`Attempting to set user ${email} as verified owner`);
      
      // Find user by email
      let user = findUserByEmail(email);
      
      // If user exists
      if (user && user.uid) {
        console.log(`User found with id: ${user.uid}`);
        
        // Set as verified owner
        setAsVerifiedOwner(user.uid);
        console.log(`Role updated to owner for user ${email}`);
      } else {
        console.log(`User ${email} not found, creating new user`);
        
        // Create a new user with default password
        const userData = createUser(email, 'Custodios2024', `Admin ${email.split('@')[0]}`);
        
        if (userData && userData.uid) {
          // Set as verified owner
          setAsVerifiedOwner(userData.uid);
          console.log(`New user created and set as owner: ${email}`);
        } else {
          throw new Error("Failed to create user");
        }
      }
      
      // Only show success notification if explicitly requested
      if (showNotification) {
        toast.success(`Usuario ${email} configurado como propietario verificado`);
      }
      
      await refreshUserData();
    } catch (error: any) {
      console.error('Error setting user as verified owner:', error);
      toast.error('Error al configurar el usuario como propietario verificado: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUserRole: updateUserRoleMethod,
    getAllUsers: getAllUsersMethod,
    verifyEmail: verifyEmailMethod,
    setUserAsVerifiedOwner: setUserAsVerifiedOwnerMethod
  };
};
