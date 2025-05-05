
import { UserRole } from '@/types/auth';
import { RolePermission } from './rolePermissions.constants';
import { ROLES, availablePages, availableActions } from './rolePermissions.constants';

// Utility function to check if the current user is an owner
export const isUserOwner = (): boolean => {
  try {
    // Check if user data exists in localStorage
    if (typeof window === 'undefined') return false;
    
    const userData = localStorage.getItem('current_user');
    if (!userData) return false;
    
    const parsedUserData = JSON.parse(userData);
    const isOwner = parsedUserData.role === 'owner';
    
    console.log('Checking owner status from localStorage:', isOwner ? '✅ Yes' : '❌ No');
    return isOwner;
  } catch (e) {
    console.error('Error checking owner status from localStorage:', e);
    return false;
  }
};

// Utility function to check if the current user has admin or owner role
export const isUserAdminOrOwner = (): boolean => {
  try {
    // Check if user data exists in localStorage
    if (typeof window === 'undefined') return false;
    
    const userData = localStorage.getItem('current_user');
    if (!userData) return false;
    
    const parsedUserData = JSON.parse(userData);
    return ['admin', 'owner'].includes(parsedUserData.role);
  } catch (e) {
    console.error('Error checking admin/owner status from localStorage:', e);
    return false;
  }
};

// Get role display name
export const getDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    'unverified': 'No verificado',
    'pending': 'Pendiente',
    'supply': 'Supply',
    'supply_admin': 'Supply Admin',
    'soporte': 'Soporte',
    'atención_afiliado': 'Atención al Afiliado',
    'afiliados': 'Afiliados',
    'bi': 'Business Intelligence',
    'monitoring': 'Monitoreo',
    'monitoring_supervisor': 'Supervisor Monitoreo',
    'admin': 'Administrador',
    'owner': 'Propietario'
  };
  return displayNames[role] || role;
};

// Get initial permissions for roles
export const getInitialPermissions = (): RolePermission[] => {
  console.log('Generating initial permissions for roles:', ROLES);
  
  return ROLES.map(role => {
    const isAdmin = role === 'admin' || role === 'owner';
    const isSupplyAdmin = role === 'supply_admin';
    
    const pages: Record<string, boolean> = {};
    const actions: Record<string, boolean> = {};
    
    availablePages.forEach(page => {
      if (isSupplyAdmin) {
        pages[page.id] = ['dashboard', 'leads', 'prospects', 'validation', 'requerimientos', 'call_center'].includes(page.id);
      } else {
        pages[page.id] = isAdmin;
      }
    });

    availableActions.forEach(action => {
      if (isSupplyAdmin) {
        actions[action.id] = ['create_leads', 'validate_prospects', 'ver_instaladores', 'evaluar_instalacion'].includes(action.id);
      } else {
        actions[action.id] = isAdmin;
      }
    });

    console.log(`Generated permissions for role ${role}:`, { pages, actions });

    return { 
      role, 
      pages, 
      actions,
      displayName: getDisplayName(role)
    };
  });
};

// Add a function to log current permission state for debugging
export const logPermissionsState = (permissions: RolePermission[]) => {
  console.log('Current permissions state:', permissions);
  
  // Log a summary of permissions by role
  permissions.forEach(rolePerm => {
    const pagePermCount = Object.values(rolePerm.pages).filter(Boolean).length;
    const actionPermCount = Object.values(rolePerm.actions).filter(Boolean).length;
    
    console.log(`Role: ${rolePerm.displayName} (${rolePerm.role}) - Pages: ${pagePermCount}/${availablePages.length}, Actions: ${actionPermCount}/${availableActions.length}`);
  });
};
