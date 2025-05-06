
import { StoredUser, USERS_STORAGE_KEY, CURRENT_USER_KEY } from './types';
import { UserData } from '@/types/auth';

// Get users from localStorage
export const getUsers = (): StoredUser[] => {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    // Ensure dates are proper Date objects
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: new Date(user.lastLogin)
    }));
  } catch (error) {
    console.error('Error retrieving users:', error);
    return [];
  }
};

// Save users to localStorage
export const saveUsers = (users: StoredUser[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Get current user from localStorage
export const getCurrentUser = (): UserData | null => {
  try {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    
    // Ensure dates are proper Date objects
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: new Date(user.lastLogin)
    };
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return null;
  }
};

// Set current user in localStorage
export const setCurrentUser = (user: UserData): void => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

// Find user by email
export const findUserByEmail = (email: string): StoredUser | null => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
};
