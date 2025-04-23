
import { availablePages, availableActions, RolePermission, ROLES } from '../rolePermissions.constants';
import { getDisplayName } from '../rolePermissions.utils';

export function processPermissionsData(permissionsData: any[]): RolePermission[] {
  const loadedPermissions: RolePermission[] = [];
  
  for (const role of ROLES) {
    const rolePerms = permissionsData.filter((p: any) => p.role === role);
    const pages: Record<string, boolean> = {};
    const actions: Record<string, boolean> = {};
    
    availablePages.forEach(page => {
      const pagePermRecord = rolePerms.find((p: any) => 
        p.permission_type === 'page' && p.permission_id === page.id);
      pages[page.id] = !!pagePermRecord && pagePermRecord.allowed;
    });
    
    availableActions.forEach(action => {
      const actionPermRecord = rolePerms.find((p: any) => 
        p.permission_type === 'action' && p.permission_id === action.id);
      actions[action.id] = !!actionPermRecord && actionPermRecord.allowed;
    });
    
    loadedPermissions.push({
      role,
      pages,
      actions,
      displayName: getDisplayName(role)
    });
  }
  
  return loadedPermissions;
}
