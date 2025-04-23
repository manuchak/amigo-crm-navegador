
import { toast } from 'sonner';
import { RolePermission } from '../rolePermissions.constants';
import { getAdminClient } from '@/integrations/supabase/client';

export function usePermissionsSave() {
  const savePermissionsToDatabase = async (permsToSave: RolePermission[]) => {
    console.log('Iniciando proceso de guardado de permisos');
    
    try {
      // Paso 1: Obtener un cliente admin fresco para cada operación
      console.log('Creando cliente admin fresco para operación de permisos');
      const client = getAdminClient();
      
      // Paso 2: Verificar que el cliente esté funcionando con una consulta simple
      console.log('Validando conexión del cliente admin...');
      const { data: connectionTest, error: connectionError } = await client
        .from('role_permissions')
        .select('count(*)', { count: 'exact', head: true });
        
      if (connectionError) {
        console.error('Falló validación de cliente admin:', connectionError);
        throw new Error(`Error de conexión con la base de datos: ${connectionError.message}`);
      }
      
      console.log('Conexión del cliente admin validada con éxito');
      
      // Paso 3: Preparar datos para inserción
      const permissionsToInsert = preparePermissionsForInsert(permsToSave);
      console.log('Total permisos a insertar:', permissionsToInsert.length);
      
      // Paso 4: Eliminar permisos existentes con una estrategia más robusta
      console.log('Eliminando permisos existentes...');
      
      // Primero obtenemos el conteo total para validar después
      const { count: beforeCount, error: countError } = await client
        .from('role_permissions')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('Error al obtener conteo de permisos:', countError);
        throw new Error(`Error al verificar permisos existentes: ${countError.message}`);
      }
      
      console.log(`Conteo antes de eliminar: ${beforeCount || 0} permisos`);
      
      // Ahora realizamos la eliminación con una consulta más específica
      const { error: deleteError } = await client
        .from('role_permissions')
        .delete()
        .gte('id', 0); // Esto asegura que apuntamos a todas las filas
        
      if (deleteError) {
        console.error('Error al eliminar permisos existentes:', deleteError);
        throw new Error(`Error al eliminar permisos existentes: ${deleteError.message}`);
      }
      
      console.log('Permisos eliminados correctamente');
      
      // Paso 5: Insertar nuevos permisos en lotes para evitar limitaciones de tamaño de solicitud
      const BATCH_SIZE = 20; // Un tamaño de lote más pequeño para mayor fiabilidad
      console.log(`Insertando ${permissionsToInsert.length} permisos en lotes de ${BATCH_SIZE}`);
      
      let totalInserted = 0;
      
      for (let i = 0; i < permissionsToInsert.length; i += BATCH_SIZE) {
        const batch = permissionsToInsert.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        
        console.log(`Insertando lote ${batchNumber} (${batch.length} items)`);
        
        const { error: insertError, data: insertedData } = await client
          .from('role_permissions')
          .insert(batch)
          .select();
          
        if (insertError) {
          console.error(`Error al insertar lote ${batchNumber}:`, insertError);
          throw new Error(`Error al guardar permisos (lote ${batchNumber}): ${insertError.message}`);
        }
        
        totalInserted += batch.length;
        console.log(`Lote ${batchNumber} insertado correctamente - Progreso: ${totalInserted}/${permissionsToInsert.length}`);
      }
      
      // Paso 6: Verificación final para confirmar que todo se guardó correctamente
      const { count: afterCount, error: finalCountError } = await client
        .from('role_permissions')
        .select('*', { count: 'exact', head: true });
        
      if (finalCountError) {
        console.error('Error en verificación final:', finalCountError);
      } else {
        console.log(`Verificación final: ${afterCount} permisos en base de datos`);
        if (afterCount !== permissionsToInsert.length) {
          console.warn(`Advertencia: Discrepancia en número de permisos insertados (${permissionsToInsert.length} vs ${afterCount})`);
        }
      }
      
      console.log('Todos los permisos guardados en la base de datos con éxito');
      toast.success('Permisos guardados correctamente');
    } catch (error: any) {
      console.error('Error crítico en savePermissionsToDatabase:', error);
      
      // Determinar si es un error de API key
      const errorMessage = error.message || 'Error desconocido';
      const isApiKeyError = errorMessage.includes('Invalid API key') || 
                           errorMessage.includes('clave API') || 
                           errorMessage.includes('JWT') ||
                           errorMessage.includes('autenticación');
      
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
