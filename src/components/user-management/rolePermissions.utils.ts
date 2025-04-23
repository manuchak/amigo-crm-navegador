
import { UserRole } from '@/types/auth';
import { PageAccess, RolePermission, availablePages, availableActions, ROLES } from './rolePermissions.constants';

export const getDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    'unverified': 'No verificado',
    'pending': 'Pendiente',
    'supply': 'Supply',
    'supply_admin': 'Supply Admin',
    'atención_afiliado': 'Atención al Afiliado',
    'afiliados': 'Afiliados',
    'admin': 'Administrador',
    'owner': 'Propietario'
  };
  return displayNames[role] || role;
};

export const getInitialPermissions = (): RolePermission[] => {
  return ROLES.map(role => {
    const isAdmin = role === 'admin' || role === 'owner';
    const isSupplyAdmin = role === 'supply_admin';
    const pages: Record<string, boolean> = {};
    const actions: Record<string, boolean> = {};
    availablePages.forEach(page => {
      pages[page.id] = isAdmin;
      if (isSupplyAdmin) {
        pages[page.id] = ['dashboard', 'prospects', 'validation'].includes(page.id);
      }
    });
    availableActions.forEach(action => {
      actions[action.id] = isAdmin;
      if (isSupplyAdmin) {
        actions[action.id] = ['validate_prospects'].includes(action.id);
      }
    });
    return { 
      role, 
      pages, 
      actions,
      displayName: getDisplayName(role)
    };
  });
};
