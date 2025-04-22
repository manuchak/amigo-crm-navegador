
import { UserData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

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

// Function to check if a user has permission to access a page
export const hasPageAccess = async (role: string, pageId: string): Promise<boolean> => {
  try {
    // Get permission from role_permissions table
    const { data, error } = await supabase
      .from('role_permissions')
      .select('allowed')
      .eq('role', role)
      .eq('permission_type', 'page')
      .eq('permission_id', pageId)
      .single();
    
    if (error || !data) {
      console.error('Error checking page access:', error);
      // Default to false if there's an error or no data
      return false;
    }
    
    // If the user is an owner, they have access to everything
    if (role === 'owner') return true;
    
    return data.allowed;
  } catch (err) {
    console.error('Error in hasPageAccess:', err);
    return false;
  }
};

// Function to check if a user has permission to perform an action
export const hasActionPermission = async (role: string, actionId: string): Promise<boolean> => {
  try {
    // Get permission from role_permissions table
    const { data, error } = await supabase
      .from('role_permissions')
      .select('allowed')
      .eq('role', role)
      .eq('permission_type', 'action')
      .eq('permission_id', actionId)
      .single();
    
    if (error || !data) {
      console.error('Error checking action permission:', error);
      // Default to false if there's an error or no data
      return false;
    }
    
    // If the user is an owner, they can do everything
    if (role === 'owner') return true;
    
    return data.allowed;
  } catch (err) {
    console.error('Error in hasActionPermission:', err);
    return false;
  }
};
