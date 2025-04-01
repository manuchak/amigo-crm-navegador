
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  sendEmailVerification,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'sonner';

// User roles in the system
export type UserRole = 
  | 'unverified' 
  | 'pending' 
  | 'atención_afiliado' 
  | 'supply' 
  | 'supply_admin' 
  | 'afiliados' 
  | 'admin' 
  | 'owner';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextProps {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<UserData[]>;
  refreshUserData: () => Promise<void>;
}

// Create the context with a default value matching the interface structure
const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  userData: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateUserRole: async () => {},
  getAllUsers: async () => [],
  refreshUserData: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data() as Omit<UserData, 'uid'>;
        setUserData({ uid: user.uid, ...data });
        
        await updateDoc(userRef, {
          lastLogin: new Date()
        });
      } else {
        console.log('No user data found!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  };

  const createOrUpdateUser = async (user: User): Promise<UserData> => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    let role: UserRole = 'unverified';
    
    if (userSnap.exists()) {
      const existingData = userSnap.data() as Omit<UserData, 'uid'>;
      role = existingData.role;
      
      await updateDoc(userRef, {
        lastLogin: new Date(),
        emailVerified: user.emailVerified
      });
    } else {
      const newUserData: Omit<UserData, 'uid'> = {
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'unverified',
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        lastLogin: new Date(),
      };
      
      await setDoc(userRef, newUserData);
      role = 'unverified';
    }
    
    const userData: UserData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL,
      role,
      emailVerified: user.emailVerified,
      createdAt: userSnap.exists() ? (userSnap.data() as any).createdAt.toDate() : new Date(),
      lastLogin: new Date(),
    };
    
    return userData;
  };

  const signInWithGoogle = async () => {
    try {
      console.log("Iniciando sesión con Google...");
      
      // Verificar si auth está inicializado
      if (!auth) {
        console.error("Firebase Auth no está inicializado");
        toast.error("Error de configuración de Firebase. Contacte al administrador.");
        return;
      }

      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      // Set language
      auth.languageCode = 'es';
      
      const result = await signInWithPopup(auth, provider);
      console.log("Resultado de autenticación:", result);
      const user = result.user;
      
      const userData = await createOrUpdateUser(user);
      setUserData(userData);
      
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        toast.info('Se envió un correo de verificación a tu dirección de email');
      }
      
      if (userData.role === 'unverified' && user.emailVerified) {
        await updateDoc(doc(db, 'users', user.uid), {
          role: 'pending'
        });
        setUserData({...userData, role: 'pending'});
        toast.info('Tu cuenta está pendiente de aprobación por un administrador');
      }
      
      if (userData.role === 'pending') {
        toast.info('Tu cuenta está pendiente de aprobación por un administrador');
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Manejo detallado de errores
      let errorMessage = 'Error al iniciar sesión con Google';
      
      if (error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        console.error("API Key inválida:", error);
        errorMessage = 'Error de configuración de Firebase. Contacte al administrador.';
      } else if (error.code === 'auth/invalid-api-key') {
        console.error("API Key inválida:", error);
        errorMessage = 'Error de configuración de Firebase. Contacte al administrador.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Inicio de sesión cancelado por el usuario';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes para este sitio.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Operación cancelada. Inténtelo de nuevo.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de red. Verifique su conexión a internet.';
      } else if (error.code === 'auth/internal-error') {
        console.error("Error interno de Firebase:", error);
        errorMessage = 'Error interno del servidor. Inténtelo más tarde.';
      } else if (error.code) {
        console.error(`Error de Firebase (${error.code}):`, error);
        errorMessage = `Error: ${error.code}`;
      } else if (error.message) {
        console.error("Error específico:", error.message);
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role });
      toast.success('Rol de usuario actualizado con éxito');
      
      if (currentUser && currentUser.uid === uid) {
        await fetchUserData(currentUser);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol de usuario');
    }
  };

  const getAllUsers = async (): Promise<UserData[]> => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshots = await getDocs(usersCollection);
      const users: UserData[] = [];
      
      userSnapshots.forEach((doc) => {
        const data = doc.data() as Omit<UserData, 'uid'>;
        users.push({
          uid: doc.id,
          ...data,
          createdAt: (data.createdAt as any).toDate(),
          lastLogin: (data.lastLogin as any).toDate()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      toast.error('Error al obtener la lista de usuarios');
      return [];
    }
  };

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          await fetchUserData(user);
        } else {
          setUserData(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error en onAuthStateChanged:", error);
      setLoading(false);
      return () => {};
    }
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signInWithGoogle,
    signOut,
    updateUserRole,
    getAllUsers,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
