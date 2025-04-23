
import { supabaseAdmin, getAuthenticatedClient, checkForOwnerRole } from '@/integrations/supabase/client';
import { RolePermission } from '../rolePermissions.constants';
import { toast } from 'sonner';

export function usePermissionsSave() {
  const savePermissionsToDatabase = async (permsToSave: RolePermission[]) => {
    console.log('Saving permissions to database');
    const permissionsToInsert = preparePermissionsForInsert(permsToSave);

    console.log('Total permissions to insert:', permissionsToInsert.length);
    
    try {
      // Determine which client to use based on owner status
      const isOwner = checkForOwnerRole();
      const client = isOwner ? supabaseAdmin : await getAuthenticatedClient();
      
      console.log('Deleting existing permissions...');
      
      // Delete existing permissions first
      const { error: deleteError } = await client
        .from('role_permissions')
        .delete()
        .filter('id', 'gte', 0);
      
      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError);
        throw new Error(`Error al eliminar permisos existentes: ${deleteError.message}`);
      }
      
      console.log('Inserting new permissions in batches...');
      const BATCH_SIZE = 20;
      
      for (let i = 0; i < permissionsToInsert.length; i += BATCH_SIZE) {
        const batch = permissionsToInsert.slice(i, i + BATCH_SIZE);
        
        const { error: insertError } = await client
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) {
          console.error('Error inserting permissions batch:', insertError);
          throw new Error(`Error al guardar nuevos permisos: ${insertError.message}`);
        }
        
        console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} inserted successfully`);
      }
      
      console.log('All permissions saved to database successfully');
      toast.success('Permisos guardados correctamente');
    } catch (error: any) {
      console.error('Error in savePermissionsToDatabase:', error);
      toast.error(`Error al guardar permisos: ${error.message || 'Error desconocido'}`);
      throw error;
    }
  };

  return { savePermissionsToDatabase };
}

function preparePermissionsForInsert(permsToSave: RolePermission[]) {
  const permissionsToInsert = [];
  
  for (const rolePerm of permsToSave) {
    // Add page permissions
    for (const pageId in rolePerm.pages) {
      permissionsToInsert.push({
        role: rolePerm.role,
        permission_type: 'page',
        permission_id: pageId,
        allowed: rolePerm.pages[pageId]
      });
    }
    
    // Add action permissions
    for (const actionId in rolePerm.actions) {
      permissionsToInsert.push({
        role: rolePerm.role,
        permission_type: 'action',
        permission_id: actionId,
        allowed: rolePerm.actions[actionId]
      });
    }
  }

  return permissionsToInsert;
}
