
import { UserRole } from '@/types/auth';

/**
 * Gets a human-readable display name for a user role
 */
export const getRoleDisplayName = (role: string): string => {
  const displayNames: Record<string, string> = {
    'unverified': 'No verificado',
    'pending': 'Pendiente',
    'soporte': 'Soporte',
    'supply': 'Supply',
    'supply_admin': 'Supply Admin',
    'bi': 'Business Intelligence',
    'monitoring': 'Monitoreo',
    'monitoring_supervisor': 'Supervisor Monitoreo',
    'admin': 'Administrador',
    'owner': 'Propietario',
    'afiliados': 'Afiliados',
    'atención_afiliado': 'Atención Afiliado'
  };
  
  return displayNames[role] || role;
};

/**
 * Determines if a user with the given role can perform an action
 */
export const useRolePermissions = (userRole: UserRole | undefined) => {
  // Define the permissions hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    'owner': 100,
    'admin': 90,
    'supply_admin': 80,
    'bi': 70,
    'monitoring_supervisor': 60,
    'monitoring': 50,
    'supply': 40,
    'soporte': 30,
    'afiliados': 20,
    'atención_afiliado': 15,
    'pending': 10,
    'unverified': 0
  };

  const canAccessUserManagement = (): boolean => {
    if (!userRole) return false;
    return roleHierarchy[userRole] >= roleHierarchy['admin'];
  };

  const canEditRoles = (): boolean => {
    if (!userRole) return false;
    return roleHierarchy[userRole] >= roleHierarchy['admin'];
  };

  const canVerifyUsers = (): boolean => {
    if (!userRole) return false;
    return roleHierarchy[userRole] >= roleHierarchy['admin'];
  };

  return {
    canAccessUserManagement,
    canEditRoles,
    canVerifyUsers,
    roleHierarchy
  };
};

export default useRolePermissions;
