
import { UserData, UserRole } from '@/types/auth';
import { StoredUser } from './types';
import { getUsers, saveUsers, setCurrentUser, findUserByEmail } from './storage';

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
