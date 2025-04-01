
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserData, UserRole } from '@/types/auth';

export const fetchUserData = async (user: User): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data() as Omit<UserData, 'uid'>;
      
      // Update last login timestamp
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
      
      return { uid: user.uid, ...data };
    } else {
      console.log('No user data found!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const createOrUpdateUser = async (user: User): Promise<UserData> => {
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

export const updateUserRoleInDb = async (uid: string, role: UserRole): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
};

export const getUsersFromDb = async (): Promise<UserData[]> => {
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
    return [];
  }
};
