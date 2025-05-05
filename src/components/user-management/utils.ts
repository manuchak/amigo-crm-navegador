
import { UserData } from '@/types/auth';

/**
 * Determines if the current user can edit another user based on roles
 * Rules:
 * - Owners can edit everyone except other owners
 * - Admins can edit everyone except owners and other admins
 * - Other roles cannot edit anyone
 */
export const canEditUser = (currentUser: UserData | null, targetUser: UserData): boolean => {
  if (!currentUser) return false;
  
  // Self-edit not allowed
  if (currentUser.uid === targetUser.uid) return false;
  
  // Owner permissions
  if (currentUser.role === 'owner') {
    // Owners can edit everyone except other owners
    return targetUser.role !== 'owner';
  }
  
  // Admin permissions
  if (currentUser.role === 'admin') {
    // Admins can't edit owners or other admins
    return targetUser.role !== 'owner' && targetUser.role !== 'admin';
  }
  
  // All other roles can't edit
  return false;
};
