
import { UserRole, UserData } from '@/types/auth';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from './storage';

export const updateUserRole = (uid: string, role: UserRole): void => {
  console.log(`Role management: Updating user ${uid} to role ${role}`);
  
  const users = getUsers();
  console.log('Current users before update:', users.length);
  console.log('Users data before update:', JSON.stringify(users));
  
  const updatedUsers = users.map(user => {
    if (user.uid === uid) {
      console.log(`Found user to update: ${user.email}, from role ${user.role} to ${role}`);
      return {
        ...user,
        role
      };
    }
    return user;
  });
  
  // Save changes to storage
  saveUsers(updatedUsers);
  console.log('Users saved after role update');
  console.log('Updated user data:', JSON.stringify(updatedUsers.find(u => u.uid === uid)));
  
  // If this is the current user, update current user data too
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.uid === uid) {
    console.log('Updating current user role as well');
    setCurrentUser({
      ...currentUser,
      role
    });
  }
};

export const verifyUserEmail = (uid: string): void => {
  const users = getUsers();
  console.log(`Verifying email for user ${uid}`);
  
  const updatedUsers = users.map(user => {
    if (user.uid === uid) {
      console.log(`Found user to verify: ${user.email}, role before: ${user.role}`);
      return {
        ...user,
        emailVerified: true,
        role: user.role === 'unverified' ? 'pending' : user.role
      };
    }
    return user;
  });
  
  saveUsers(updatedUsers);
  console.log('Users saved after email verification');
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.uid === uid) {
    setCurrentUser({
      ...currentUser,
      emailVerified: true,
      role: currentUser.role === 'unverified' ? 'pending' : currentUser.role
    });
  }
};

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
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.uid === uid) {
    setCurrentUser({
      ...currentUser,
      emailVerified: true,
      role: 'owner'
    });
  }
};

export const getAllUsers = (): UserData[] => {
  const users = getUsers();
  console.log(`Getting all users (${users.length}) from storage`);
  
  // Add debugging to track roles
  users.forEach(user => {
    console.log(`User ${user.email} has role: ${user.role}`);
  });
  
  return users.map(({ password, ...user }) => user);
};
