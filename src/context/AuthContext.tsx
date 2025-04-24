
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { UserData, UserRole } from '@/types/auth';
import { 
  createUser, 
  loginUser, 
  signOut as signOutLocal, 
  resetPassword as resetPasswordLocal, 
  verifyUserEmail,
  updateUserRole,
  getAllUsers,
  setAsVerifiedOwner
} from '@/utils/auth';

// Define the properties that our AuthContext will expose
interface AuthContextProps {
  currentUser: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<UserData[]>;
  refreshUserData: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserData | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<UserData | null>;
  resetPassword: (email: string) => Promise<void>;
  setUserAsVerifiedOwner: (email: string) => Promise<void>;
  verifyEmail: (uid: string) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('current_user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('current_user');
      }
    }
    
    setLoading(false);
  }, []);

  // Sign in functionality
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = loginUser(email, password);
      setCurrentUser(userData);
      
      // Show success toast
      toast.success('Sesión iniciada con éxito');
      return userData;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up functionality with improved error handling
  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Create the user account
      const userData = createUser(email, password, displayName);
      
      // Set the current user - but don't redirect if they need to verify email
      setCurrentUser(userData);
      
      // Show success toast
      toast.success('Cuenta creada con éxito');
      return userData;
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Error al crear la cuenta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out functionality
  const signOut = async () => {
    signOutLocal();
    setCurrentUser(null);
    toast.success('Sesión cerrada con éxito');
  };

  // Password reset functionality
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      resetPasswordLocal(email);
      toast.success('Se ha enviado un correo para restablecer la contraseña');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Update user role functionality
  const updateUserRoleHandler = async (uid: string, role: UserRole) => {
    try {
      updateUserRole(uid, role);
      
      // If we're updating the current user, update the state
      if (currentUser && currentUser.uid === uid) {
        setCurrentUser({
          ...currentUser,
          role
        });
      }
      
      toast.success(`Rol actualizado a ${role} con éxito`);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Error al actualizar el rol');
    }
  };

  // Get all users functionality
  const getAllUsersHandler = async () => {
    return getAllUsers();
  };

  // Refresh user data functionality
  const refreshUserData = async () => {
    if (!currentUser) return;
    
    // Check if user has been updated in storage
    const storedUser = localStorage.getItem('current_user');
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }
  };

  // Set user as verified owner functionality
  const setUserAsVerifiedOwner = async (email: string) => {
    try {
      // Find the user by email
      const users = getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user && user.uid) {
        setAsVerifiedOwner(user.uid);
        toast.success('Usuario verificado como propietario');
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error: any) {
      console.error('Error setting user as verified owner:', error);
      toast.error(error.message || 'Error al verificar al usuario como propietario');
    }
  };

  // Verify email functionality
  const verifyEmail = async (uid: string) => {
    try {
      verifyUserEmail(uid);
      
      // If we're verifying the current user, update the state
      if (currentUser && currentUser.uid === uid) {
        setCurrentUser({
          ...currentUser,
          emailVerified: true,
          role: currentUser.role === 'unverified' ? 'pending' as UserRole : currentUser.role
        });
      }
      
      toast.success('Correo electrónico verificado con éxito');
    } catch (error: any) {
      console.error('Error verifying email:', error);
      toast.error(error.message || 'Error al verificar el correo electrónico');
    }
  };

  // Value object that will be provided to components using this context
  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserRole: updateUserRoleHandler,
    getAllUsers: getAllUsersHandler,
    refreshUserData,
    setUserAsVerifiedOwner,
    verifyEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
