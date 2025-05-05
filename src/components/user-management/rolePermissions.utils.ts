
import { UserRole } from '@/types/auth';
import { PageAccess, RolePermission, availablePages, availableActions, ROLES } from './rolePermissions.constants';

export const getDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    'unverified': 'No verificado',
    'pending': 'Pendiente',
    'supply': 'Supply',
    'supply_admin': 'Supply Admin',
    'soporte': 'Soporte',
    'atención_afiliado': 'Atención al Afiliado',
    'afiliados': 'Afiliados',
    'admin': 'Administrador',
    'owner': 'Propietario',
    'bi': 'Business Intelligence',
    'monitoring': 'Monitoreo',
    'monitoring_supervisor': 'Supervisor Monitoreo'
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
      // Supply admin permissions for specific pages
      if (isSupplyAdmin) {
        pages[page.id] = [
          'dashboard',
          'leads',
          'prospects',
          'validation',
          'requerimientos',
          'call_center'
        ].includes(page.id);
      } else {
        // Default admin permissions
        pages[page.id] = isAdmin;
      }
    });

    availableActions.forEach(action => {
      // Supply admin permissions for actions
      if (isSupplyAdmin) {
        actions[action.id] = [
          'create_leads',
          'validate_prospects',
          'ver_instaladores',
          'evaluar_instalacion'
        ].includes(action.id);
      } else {
        // Default admin permissions
        actions[action.id] = isAdmin;
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
