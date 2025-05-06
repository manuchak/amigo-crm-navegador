
import { UserData, UserRole } from '@/types/auth';
import { StoredUser } from './types';
import { getUsers, saveUsers, setCurrentUser, findUserByEmail } from './storage';

// Add some default users if they don't exist
const ensureDefaultUsers = () => {
  const users = getUsers();
  
  // Only add default users if there are none
  if (users.length === 0) {
    // Add the special default user
    const manuelChacon: StoredUser = {
      uid: "6529ddc6-8763-483a-8d6a-d8be4c5dfb0a",
      email: "manuel.chacon@detectasecurity.io",
      password: "password123", // In a real app, this would be hashed
      displayName: "MANUEL CHACON",
      role: 'owner' as UserRole,
      emailVerified: true,
      createdAt: new Date("2025-04-01T17:11:20.104Z"),
      lastLogin: new Date("2025-04-23T20:57:31.223Z")
    };
    
    users.push(manuelChacon);
    saveUsers(users);
    console.log("Created default user:", manuelChacon.email);
  }
};

// Call this function to ensure default users exist
ensureDefaultUsers();

export const createUser = (
  email: string, 
  password: string, 
  displayName: string
): UserData => {
  const users = getUsers();
  
  if (findUserByEmail(email)) {
    throw new Error('auth/email-already-in-use');
  }
  
  const newUser: StoredUser = {
    uid: crypto.randomUUID(),
    email,
    password,
    displayName,
    role: 'pending' as UserRole,
    emailVerified: true,
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const { password: _, ...userData } = newUser;
  setCurrentUser(userData);
  
  return userData;
};

export const loginUser = (email: string, password: string): UserData => {
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error('auth/user-not-found');
  }
  
  if (user.password !== password) {
    throw new Error('auth/wrong-password');
  }
  
  const users = getUsers();
  const updatedUsers = users.map(u => {
    if (u.uid === user.uid) {
      return {
        ...u,
        lastLogin: new Date()
      };
    }
    return u;
  });
  
  saveUsers(updatedUsers);
  
  const { password: _, ...userData } = user;
  setCurrentUser(userData);
  
  return userData;
};

export const resetPassword = (email: string): void => {
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error('auth/user-not-found');
  }
  
  console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
};

export const signOut = (): void => {
  localStorage.removeItem('current_user');
};
