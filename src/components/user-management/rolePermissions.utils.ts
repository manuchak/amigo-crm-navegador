import { RolePermission } from './rolePermissions.constants';
import { availablePages, availableActions, ROLES } from './rolePermissions.constants';

// Function to get a formatted display name for a role
export const getDisplayName = (role: string): string => {
  const displayNames: Record<string, string> = {
    'owner': 'Propietario',
    'admin': 'Administrador',
    'monitoring_supervisor': 'Supervisor Monitoreo',
    'monitoring': 'Monitoreo',
    'supply_admin': 'Admin Suministros',
    'supply': 'Suministros',
    'bi': 'Business Intelligence',
    'soporte': 'Soporte',
    'unverified': 'No Verificado',
    'pending': 'Pendiente',
    'afiliados': 'Afiliados',
    'atención_afiliado': 'Atención Afiliado'
  };
  
  return displayNames[role] || role;
};

// Function to check if the current user is an owner based on localStorage
export const isUserOwner = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
    console.log('Checking owner status from localStorage:', userData);
    return userData && userData.role === 'owner';
  } catch (error) {
    console.error('Error checking localStorage for owner status:', error);
    return false;
  }
};

// Generate initial permissions structure for all roles
export const getInitialPermissions = (): RolePermission[] => {
  return ROLES.map(role => {
    const perm: RolePermission = {
      role,
      displayName: getDisplayName(role),
      pages: {},
      actions: {}
    };
    
    // For all available pages, set access based on role
    availablePages.forEach(page => {
      if (role === 'owner') {
        // Owner has access to everything
        perm.pages[page.id] = true;
      } else if (role === 'admin') {
        // Admin has access to almost everything
        perm.pages[page.id] = true;
      } else if (['unverified', 'pending'].includes(role)) {
        // Unverified/pending users have limited access
        perm.pages[page.id] = ['login', 'register', 'profile'].includes(page.id);
      } else {
        // Other roles have role-specific access
        switch (role) {
          case 'monitoring_supervisor':
          case 'monitoring':
            perm.pages[page.id] = ['dashboard', 'monitoring', 'custodiosList'].includes(page.id);
            break;
          case 'supply_admin':
          case 'supply':
            perm.pages[page.id] = ['dashboard', 'inventory', 'supplies'].includes(page.id);
            break;
          case 'bi':
            perm.pages[page.id] = ['dashboard', 'reports', 'analytics'].includes(page.id);
            break;
          case 'soporte':
            perm.pages[page.id] = ['dashboard', 'tickets', 'support'].includes(page.id);
            break;
          default:
            perm.pages[page.id] = ['dashboard', 'profile'].includes(page.id);
        }
      }
    });
    
    // For all available actions, set access based on role
    availableActions.forEach(action => {
      if (role === 'owner') {
        // Owner has access to all actions
        perm.actions[action.id] = true;
      } else if (role === 'admin') {
        // Admin has access to most actions, except owner-specific ones
        perm.actions[action.id] = action.id !== 'manage_permissions';
      } else {
        // Other roles have limited actions
        perm.actions[action.id] = ['view_own_profile', 'edit_own_profile'].includes(action.id);
        
        // Role-specific actions
        if (role === 'monitoring_supervisor') {
          perm.actions['manage_custodios'] = true;
          perm.actions['view_reports'] = true;
        }
        
        if (role === 'supply_admin') {
          perm.actions['manage_inventory'] = true;
          perm.actions['create_purchase_orders'] = true;
        }
      }
    });
    
    return perm;
  });
};

// Utility to check if a user is an admin or owner
export const isUserAdminOrOwner = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
    return userData && (userData.role === 'owner' || userData.role === 'admin');
  } catch (error) {
    console.error('Error checking localStorage for admin/owner status:', error);
    return false;
  }
};
