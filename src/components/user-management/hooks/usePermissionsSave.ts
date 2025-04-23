
import { toast } from 'sonner';
import { RolePermission } from '../rolePermissions.constants';
import { getAdminClient } from '@/integrations/supabase/client';

export function usePermissionsSave() {
  const savePermissionsToDatabase = async (permsToSave: RolePermission[]) => {
    console.log('Starting permissions save process');
    
    // Create fresh admin client for permissions operations
    let client;
    
    try {
      console.log('Creating fresh admin client for permissions operations');
      client = getAdminClient();
      
      // Validate client is working with a simple query
      const { data: connectionTest, error: connectionError } = await client
        .from('role_permissions')
        .select('count(*)')
        .limit(1);
        
      if (connectionError) {
        console.error('Admin client connection validation failed:', connectionError);
        throw new Error(`Error de conexión con la base de datos: ${connectionError.message}`);
      }
      
      console.log('Admin client connection validated successfully');
      
      const permissionsToInsert = preparePermissionsForInsert(permsToSave);
      console.log('Total permissions to insert:', permissionsToInsert.length);
      
      // Delete existing permissions
      console.log('Deleting existing permissions...');
      
      // Use a more reliable deletion approach
      const { error: deleteError } = await client
        .from('role_permissions')
        .delete()
        .gte('id', 1); // This ensures we're targeting all rows
        
      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError);
        throw new Error(`Error al eliminar permisos existentes: ${deleteError.message}`);
      }
      
      console.log('Permissions deleted successfully');
      
      // Insert new permissions in batches to avoid request size limitations
      const BATCH_SIZE = 20;
      console.log(`Inserting ${permissionsToInsert.length} permissions in batches of ${BATCH_SIZE}`);
      
      for (let i = 0; i < permissionsToInsert.length; i += BATCH_SIZE) {
        const batch = permissionsToInsert.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        
        console.log(`Inserting batch ${batchNumber} (${batch.length} items)`);
        
        const { error: insertError } = await client
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) {
          console.error(`Error inserting batch ${batchNumber}:`, insertError);
          throw new Error(`Error al guardar permisos (lote ${batchNumber}): ${insertError.message}`);
        }
        
        console.log(`Batch ${batchNumber} inserted successfully`);
      }
      
      console.log('All permissions saved to database successfully');
      toast.success('Permisos guardados correctamente');
    } catch (error: any) {
      console.error('Error in savePermissionsToDatabase:', error);
      
      // Determine if this is an API key error
      const errorMessage = error.message || 'Error desconocido';
      const isApiKeyError = errorMessage.includes('Invalid API key') || 
                           errorMessage.includes('clave API') || 
                           errorMessage.includes('JWT');
      
      if (isApiKeyError) {
        toast.error('Error de autenticación con la base de datos. Por favor intente nuevamente o contacte al administrador.');
      } else {
        toast.error(`Error al guardar permisos: ${errorMessage}`);
      }
      
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
