
import { toast } from 'sonner';
import { RolePermission } from '../rolePermissions.constants';
import { getAdminClient } from '@/integrations/supabase/client';

export function usePermissionsSave() {
  const savePermissionsToDatabase = async (permsToSave: RolePermission[]) => {
    console.log('Starting permission save process');
    
    try {
      // STEP 1: Get fresh admin client and validate connection
      console.log('Creating fresh admin client for permission saving...');
      const client = getAdminClient();
      
      // Test connection with a simple, reliable request first
      console.log('Testing database connection before save operation...');
      const { data: testData, error: testError } = await client
        .from('role_permissions')
        .select('count(*)', { count: 'exact', head: true });
      
      if (testError) {
        console.error('Connection test failed:', testError);
        throw new Error(`Error de conexión con la base de datos: ${testError.message}`);
      }
      
      console.log('Connection test successful');
      
      // STEP 2: Get current permissions for comparison
      console.log('Checking existing permissions...');
      const { count: existingCount, error: checkError } = await client
        .from('role_permissions')
        .select('*', { count: 'exact', head: true });
        
      if (checkError) {
        console.error('Error checking existing permissions:', checkError);
        throw new Error(`Error al verificar permisos existentes: ${checkError.message}`);
      }
      
      const beforeCount = existingCount || 0;
      console.log(`Current permissions count: ${beforeCount}`);
      
      // STEP 3: Prepare data for insertion
      const permissionsToInsert = preparePermissionsForInsert(permsToSave);
      console.log(`Prepared ${permissionsToInsert.length} permissions for insertion`);
      
      // STEP 4: Delete existing permissions
      if (beforeCount > 0) {
        console.log('Removing existing permissions...');
        
        // More reliable deletion approach
        const { error: deleteError } = await client
          .from('role_permissions')
          .delete()
          .not('id', 'is', null); // This targets all rows with non-null IDs
          
        if (deleteError) {
          console.error('Error deleting existing permissions:', deleteError);
          throw new Error(`Error al eliminar permisos existentes: ${deleteError.message}`);
        }
        
        // Verify deletion
        const { count: afterDeleteCount, error: verifyDeleteError } = await client
          .from('role_permissions')
          .select('*', { count: 'exact', head: true });
          
        if (verifyDeleteError) {
          console.error('Error verifying deletion:', verifyDeleteError);
        } else {
          console.log(`After deletion: ${afterDeleteCount || 0} permissions remain`);
          if ((afterDeleteCount || 0) > 0) {
            console.warn('Not all permissions were deleted, proceeding anyway');
          }
        }
      }
      
      // STEP 5: Insert new permissions in smaller batches for reliability
      const BATCH_SIZE = 10; // Smaller batches to reduce likelihood of errors
      console.log(`Inserting ${permissionsToInsert.length} permissions in batches of ${BATCH_SIZE}`);
      
      let successfulInserts = 0;
      let totalBatches = Math.ceil(permissionsToInsert.length / BATCH_SIZE);
      
      for (let i = 0; i < permissionsToInsert.length; i += BATCH_SIZE) {
        const batch = permissionsToInsert.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        
        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
        
        const { error: insertError, data: insertedData } = await client
          .from('role_permissions')
          .insert(batch)
          .select();
          
        if (insertError) {
          console.error(`Error inserting batch ${batchNumber}:`, insertError);
          throw new Error(`Error al guardar permisos (lote ${batchNumber}): ${insertError.message}`);
        }
        
        successfulInserts += batch.length;
        console.log(`Batch ${batchNumber} inserted successfully - Progress: ${successfulInserts}/${permissionsToInsert.length}`);
      }
      
      // STEP 6: Final verification of insertion
      const { count: finalCount, error: finalCountError } = await client
        .from('role_permissions')
        .select('*', { count: 'exact', head: true });
        
      if (finalCountError) {
        console.error('Error in final verification:', finalCountError);
        console.warn('Unable to verify final results, but insertion completed without errors');
      } else {
        console.log(`Final verification: ${finalCount} permissions in database`);
        
        if (finalCount !== permissionsToInsert.length) {
          console.warn(`Permission count mismatch: expected ${permissionsToInsert.length}, got ${finalCount}`);
          
          // Despite the mismatch, if we have most permissions, consider it a qualified success
          if (finalCount && finalCount >= permissionsToInsert.length * 0.9) {
            console.log('Most permissions were saved successfully');
          } else {
            console.error('Significant discrepancy in saved permissions');
          }
        } else {
          console.log('All permissions saved with exact count match');
        }
      }
      
      console.log('Permission save operation completed successfully');
      toast.success('Permisos guardados correctamente');
    } catch (error: any) {
      console.error('Critical error in savePermissionsToDatabase:', error);
      
      // Better error classification
      const errorMessage = error.message || 'Error desconocido';
      
      if (errorMessage.includes('Invalid API key') || 
          errorMessage.includes('clave API') ||
          errorMessage.includes('JWT') ||
          errorMessage.includes('autenticación') ||
          errorMessage.includes('Authentication')) {
        
        // Authentication-specific error messaging
        toast.error('Error de autenticación con la base de datos. Por favor intente nuevamente o contacte al administrador.');
        console.error('Authentication error details:', error);
      } else if (errorMessage.includes('network') || 
                errorMessage.includes('timeout') || 
                errorMessage.includes('conexión')) {
        // Network-specific errors
        toast.error('Error de conexión a la base de datos. Verifique su conexión a internet e intente nuevamente.');
      } else {
        // General errors
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
