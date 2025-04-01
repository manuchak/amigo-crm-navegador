import { UserData, UserRole } from '@/types/auth';

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

export const canEditUser = (currentUser: UserData | null, user: UserData): boolean => {
  if (!currentUser) return false;
  
  // Cannot edit yourself
  if (currentUser.uid === user.uid) return false;
  
  // Owner can edit anyone except other owners
  if (currentUser.role === 'owner') {
    return user.role !== 'owner';
  }
  
  // Admin can edit anyone except owners and other admins
  if (currentUser.role === 'admin') {
    return !['admin', 'owner'].includes(user.role);
  }
  
  // Others cannot edit
  return false;
};
