
/**
 * Utility functions for role-based permissions
 */

// Check if current user is an owner based on localStorage
export const isUserOwner = (): boolean => {
  try {
    const currentUser = localStorage.getItem('current_user');
    
    if (!currentUser) {
      console.log('No current_user found in localStorage');
      return false;
    }
    
    const userData = JSON.parse(currentUser);
    const isOwner = userData && userData.role === 'owner';
    
    console.log(`isUserOwner check result: ${isOwner ? 'true' : 'false'}`);
    console.log('User data from localStorage:', userData);
    
    return isOwner;
  } catch (error) {
    console.error('Error checking for owner role in localStorage:', error);
    return false;
  }
};

// Check if current user is an admin or owner
export const isUserAdminOrOwner = (): boolean => {
  try {
    const currentUser = localStorage.getItem('current_user');
    
    if (!currentUser) return false;
    
    const userData = JSON.parse(currentUser);
    return userData && (userData.role === 'owner' || userData.role === 'admin');
  } catch (error) {
    console.error('Error checking for admin role:', error);
    return false;
  }
};

// Get a human-friendly display name for a role
export const getDisplayName = (role: string): string => {
  const displayNames: Record<string, string> = {
    'owner': 'Propietario',
    'admin': 'Administrador',
    'monitoring_supervisor': 'Supervisor',
    'monitoring': 'Monitoreo',
    'supply_admin': 'Admin Suministros',
    'supply': 'Suministros',
    'bi': 'Business Intelligence',
    'soporte': 'Soporte',
    'atención_afiliado': 'Atención Afiliado',
    'afiliados': 'Afiliados',
    'unverified': 'Sin verificar',
    'pending': 'Pendiente'
  };
  
  return displayNames[role] || role;
};
