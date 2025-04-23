
import { getAdminClient, getAuthenticatedClient, checkForOwnerRole } from '@/integrations/supabase/client';
import { RolePermission } from '../rolePermissions.constants';
import { toast } from 'sonner';

export function usePermissionsSave() {
  const savePermissionsToDatabase = async (permsToSave: RolePermission[], customClient = null) => {
    console.log('Saving permissions to database');
    const permissionsToInsert = preparePermissionsForInsert(permsToSave);

    console.log('Total permissions to insert:', permissionsToInsert.length);
    
    try {
      let client = customClient;
      const currentOwnerStatus = checkForOwnerRole();
      
      if (!client) {
        if (currentOwnerStatus) {
          console.log('Using admin client for owner');
          client = getAdminClient();
        } else {
          console.log('Getting authenticated client');
          client = await getAuthenticatedClient();
        }
      }
      
      console.log('Deleting existing permissions...');
      let deleteSuccess = false;
      
      if (currentOwnerStatus) {
        try {
          const adminDb = getAdminClient();
          const { error: deleteError } = await adminDb.delete();
          
          if (deleteError) {
            console.error('Admin client delete failed:', deleteError);
            throw deleteError;
          } else {
            deleteSuccess = true;
            console.log('Admin client delete successful');
          }
        } catch (adminError) {
          console.error('Error with admin client delete:', adminError);
        }
      }
      
      if (!deleteSuccess) {
        console.log('Using standard client for delete operation');
        const standardClient = await getAuthenticatedClient();
        const { error: deleteError } = await standardClient.from('role_permissions').delete().neq('id', 0);
        
        if (deleteError) {
          console.error('Standard client delete failed:', deleteError);
          throw deleteError;
        }
      }
      
      console.log('Inserting new permissions in batches...');
      const BATCH_SIZE = 20;
      const client_to_use = currentOwnerStatus ? getAdminClient() : (await getAuthenticatedClient()).from('role_permissions');
      
      for (let i = 0; i < permissionsToInsert.length; i += BATCH_SIZE) {
        const batch = permissionsToInsert.slice(i, i + BATCH_SIZE);
        
        const { error: insertError } = await client_to_use.insert(batch);
          
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
