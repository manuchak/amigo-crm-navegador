
import { RolePermission } from '../rolePermissions.constants';
import { availablePages, availableActions, ROLES } from '../rolePermissions.constants';
import { UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Function to get display names for roles
export const getRoleDisplayName = (role: UserRole): string => {
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
    'owner': 'Propietario'
  };
  return displayNames[role] || role;
};

// Function to get default permissions for each role
export const getInitialPermissions = (): RolePermission[] => {
  return ROLES.map(role => {
    const isAdmin = role === 'admin' || role === 'owner';
    const isSupplyAdmin = role === 'supply_admin';
    const isMonitoringSupervisor = role === 'monitoring_supervisor';
    
    const pages: Record<string, boolean> = {};
    const actions: Record<string, boolean> = {};
    
    // Set default page permissions based on role
    availablePages.forEach(page => {
      if (isAdmin) {
        pages[page.id] = true;
      } else if (isSupplyAdmin) {
        pages[page.id] = ['dashboard', 'leads', 'prospects', 'validation', 'requerimientos', 'call_center'].includes(page.id);
      } else if (isMonitoringSupervisor) {
        pages[page.id] = ['dashboard', 'prospects', 'validation'].includes(page.id);
      } else if (role === 'bi') {
        pages[page.id] = ['dashboard'].includes(page.id);
      } else if (role === 'soporte') {
        pages[page.id] = ['dashboard', 'support'].includes(page.id);
      } else {
        pages[page.id] = ['dashboard'].includes(page.id);
      }
    });

    // Set default action permissions based on role
    availableActions.forEach(action => {
      if (isAdmin) {
        actions[action.id] = true;
      } else if (isSupplyAdmin) {
        actions[action.id] = ['create_leads', 'validate_prospects', 'ver_instaladores', 'evaluar_instalacion'].includes(action.id);
      } else if (isMonitoringSupervisor) {
        actions[action.id] = ['validate_prospects', 'ver_instaladores'].includes(action.id);
      } else {
        actions[action.id] = false;
      }
      
      // Special case: Only owner can manage permissions
      if (action.id === 'manage_permissions') {
        actions[action.id] = role === 'owner';
      }
    });

    return { 
      role, 
      pages, 
      actions,
      displayName: getRoleDisplayName(role)
    };
  });
};

export function usePermissionsData() {
  // Load permissions from database
  const loadPermissions = async (
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    setPermissions: (permissions: RolePermission[]) => void,
    setIsOwner: (isOwner: boolean) => void,
    isOwner: boolean,
    retryCount: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check owner status if needed
      if (!isOwner) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setIsOwner(false);
        } else {
          const { data, error } = await supabase.rpc('get_user_role', {
            user_uid: userData.user.id
          });
          
          if (!error && data === 'owner') {
            setIsOwner(true);
          }
        }
      }
      
      // Get permissions from database
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // No permissions in database, use defaults
        console.log('No permissions found in database, using defaults');
        setPermissions(getInitialPermissions());
      } else {
        // Process permissions from database
        console.log(`Found ${data.length} permission entries in database`);
        const rolePerms: Record<string, RolePermission> = {};
        
        // Initialize with default structure
        ROLES.forEach(role => {
          rolePerms[role] = {
            role,
            displayName: getRoleDisplayName(role),
            pages: {},
            actions: {}
          };
          
          // Set all to false by default
          availablePages.forEach(page => {
            rolePerms[role].pages[page.id] = false;
          });
          
          availableActions.forEach(action => {
            rolePerms[role].actions[action.id] = false;
          });
        });
        
        // Fill in permissions from database
        data.forEach(perm => {
          const role = perm.role as UserRole;
          
          if (!rolePerms[role]) return;
          
          if (perm.permission_type === 'page') {
            rolePerms[role].pages[perm.permission_id] = perm.allowed;
          } else if (perm.permission_type === 'action') {
            rolePerms[role].actions[perm.permission_id] = perm.allowed;
          }
        });
        
        // Ensure owner has all permissions
        if (rolePerms.owner) {
          availablePages.forEach(page => {
            rolePerms.owner.pages[page.id] = true;
          });
          
          availableActions.forEach(action => {
            rolePerms.owner.actions[action.id] = true;
          });
        }
        
        setPermissions(Object.values(rolePerms));
      }
    } catch (err: any) {
      console.error('Error loading permissions:', err);
      setError(err.message || 'Error al cargar la configuración de permisos');
      
      // Fallback to defaults
      setPermissions(getInitialPermissions());
    } finally {
      setLoading(false);
    }
  };

  return { loadPermissions };
}
