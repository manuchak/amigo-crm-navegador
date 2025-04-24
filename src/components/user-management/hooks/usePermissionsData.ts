
import { supabase } from '@/integrations/supabase/client';
import { RolePermission } from '../rolePermissions.constants';
import { getInitialPermissions } from '../rolePermissions.utils';

export function usePermissionsData() {
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
      // Check owner status if not already set
      let ownerStatus = isOwner;
      if (!ownerStatus) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
            user_uid: userData.user.id
          });
          
          if (!roleError && roleData === 'owner') {
            ownerStatus = true;
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
        setPermissions(getInitialPermissions());
      } else {
        // Process permissions from database
        const processedPermissions = processPermissionsData(data);
        setPermissions(processedPermissions);
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
  
  // Process permissions data from database
  const processPermissionsData = (data: any[]): RolePermission[] => {
    // Import required functions and constants
    const { ROLES, availablePages, availableActions } = require('../rolePermissions.constants');
    const { getDisplayName } = require('../rolePermissions.utils');

    // Initialize permissions object with default structure
    const rolePerms: Record<string, RolePermission> = {};
    
    ROLES.forEach(role => {
      rolePerms[role] = {
        role,
        displayName: getDisplayName(role),
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
      const role = perm.role;
      
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
    
    return Object.values(rolePerms);
  };

  return { loadPermissions };
}
