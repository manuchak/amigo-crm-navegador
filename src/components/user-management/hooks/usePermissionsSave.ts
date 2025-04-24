
import { supabase } from '@/integrations/supabase/client';
import { RolePermission } from '../rolePermissions.constants';

export function usePermissionsSave() {
  const savePermissionsToDatabase = async (permissions: RolePermission[]): Promise<void> => {
    try {
      console.log('Saving permissions to database:', permissions);
      // Format data for database
      const permissionsToSave: any[] = [];
      
      permissions.forEach(rolePerm => {
        // Add page permissions
        Object.entries(rolePerm.pages).forEach(([pageId, allowed]) => {
          permissionsToSave.push({
            role: rolePerm.role,
            permission_type: 'page',
            permission_id: pageId,
            allowed
          });
        });
        
        // Add action permissions
        Object.entries(rolePerm.actions).forEach(([actionId, allowed]) => {
          permissionsToSave.push({
            role: rolePerm.role,
            permission_type: 'action',
            permission_id: actionId,
            allowed
          });
        });
      });
      
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .not('id', 'is', null);
        
      if (deleteError) throw deleteError;
      
      // Insert new permissions in batches
      const BATCH_SIZE = 50;
      for (let i = 0; i < permissionsToSave.length; i += BATCH_SIZE) {
        const batch = permissionsToSave.slice(i, i + BATCH_SIZE);
        
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) throw insertError;
      }
      
      console.log('Permissions saved successfully');
    } catch (err) {
      console.error('Error in savePermissionsToDatabase:', err);
      throw err;
    }
  };

  return { savePermissionsToDatabase };
}
