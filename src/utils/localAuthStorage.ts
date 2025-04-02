
import { UserData, UserRole } from '@/types/auth';

// Type for stored user with password
interface StoredUser extends UserData {
  password: string;
}

// LocalStorage key
const USERS_STORAGE_KEY = 'local_users';
const CURRENT_USER_KEY = 'current_user';

// Get all users from localStorage
export const getUsers = (): StoredUser[] => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Save users to localStorage
export const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Find user by email
export const findUserByEmail = (email: string): StoredUser | undefined => {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Create a new user
export const createUser = (
  email: string, 
  password: string, 
  displayName: string
): UserData => {
  const users = getUsers();
  
  // Check if user already exists
  if (findUserByEmail(email)) {
    throw new Error('auth/email-already-in-use');
  }
  
  // Create new user - now with emailVerified set to true by default
  const newUser: StoredUser = {
    uid: crypto.randomUUID(),
    email,
    password,
    displayName,
    role: 'pending' as UserRole, // Set initial role to pending instead of unverified
    emailVerified: true, // Set to true by default - removing the verification requirement
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  // Save user
  users.push(newUser);
  saveUsers(users);
  
  // Return user data without password
  const { password: _, ...userData } = newUser;
  return userData;
};

// User login
export const loginUser = (email: string, password: string): UserData => {
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error('auth/user-not-found');
  }
  
  if (user.password !== password) {
    throw new Error('auth/wrong-password');
  }
  
  // Update last login
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
  
  // Save current user
  const { password: _, ...userData } = user;
  setCurrentUser(userData);
  
  return userData;
};

// Get current user
export const getCurrentUser = (): UserData | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Set current user
export const setCurrentUser = (user: UserData | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Update user role
export const updateUserRole = (uid: string, role: UserRole): void => {
  const users = getUsers();
  const updatedUsers = users.map(user => {
    if (user.uid === uid) {
      return {
        ...user,
        role
      };
    }
    return user;
  });
  
  saveUsers(updatedUsers);
  
  // Update current user if it's the same
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.uid === uid) {
    setCurrentUser({
      ...currentUser,
      role
    });
  }
};

// Verify user email
export const verifyUserEmail = (uid: string): void => {
  const users = getUsers();
  const updatedUsers = users.map(user => {
    if (user.uid === uid) {
      return {
        ...user,
        emailVerified: true,
        role: user.role === 'unverified' ? 'pending' : user.role
      };
    }
    return user;
  });
  
  saveUsers(updatedUsers);
  
  // Update current user if it's the same
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.uid === uid) {
    setCurrentUser({
      ...currentUser,
      emailVerified: true,
      role: currentUser.role === 'unverified' ? 'pending' : currentUser.role
    });
  }
};

// Set user as verified owner
export const setAsVerifiedOwner = (uid: string): void => {
  const users = getUsers();
  const updatedUsers = users.map(user => {
    if (user.uid === uid) {
      return {
        ...user,
        emailVerified: true,
        role: 'owner' as UserRole
      };
    }
    return user;
  });
  
  saveUsers(updatedUsers);
  
  // Update current user if it's the same
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.uid === uid) {
    setCurrentUser({
      ...currentUser,
      emailVerified: true,
      role: 'owner'
    });
  }
};

// Reset password
export const resetPassword = (email: string): void => {
  const user = findUserByEmail(email);
  
  if (!user) {
    throw new Error('auth/user-not-found');
  }
  
  // In a real app, you would send an email here.
  // For this demo, we'll just log a message
  console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
};

// Sign out
export const signOut = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Get all users (admin function)
export const getAllUsers = (): UserData[] => {
  const users = getUsers();
  return users.map(({ password, ...user }) => user);
};
