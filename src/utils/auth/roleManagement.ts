
import { UserRole, UserData } from '@/types/auth';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from './storage';

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
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.uid === uid) {
    setCurrentUser({
      ...currentUser,
      role
    });
  }
};

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
  return users.map(({ password, ...user }) => user);
};
