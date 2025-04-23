
import { useCallback } from 'react';
import { getAuthenticatedClient, supabaseAdmin, checkForOwnerRole } from '@/integrations/supabase/client';
import { RolePermission } from '../rolePermissions.constants';
import { getInitialPermissions } from '../rolePermissions.utils';
import { toast } from 'sonner';
import { processPermissionsData } from '../utils/permissionsDataProcessor';
import { usePermissionsSave } from './usePermissionsSave';

export function usePermissionsData() {
  const { savePermissionsToDatabase } = usePermissionsSave();
  
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
      console.log('Loading role permissions, attempt:', retryCount + 1);
      console.log('Current owner status:', isOwner ? '✅ Yes' : '❌ No');
      
      let permissionsData = null;
      const currentOwnerStatus = checkForOwnerRole();
      
      if (currentOwnerStatus !== isOwner) {
        console.log(`Owner status changed from ${isOwner} to ${currentOwnerStatus}`);
        setIsOwner(currentOwnerStatus);
      }
      
      // Intentar cargar con el cliente admin primero (modo más confiable)
      if (currentOwnerStatus) {
        try {
          console.log('Intentando cargar permisos con cliente admin (propietario)');
          
          const { data, error } = await supabaseAdmin
            .from('role_permissions')
            .select('*');
          
          if (error) {
            console.error('Error en consulta admin:', error);
          } else {
            permissionsData = data;
            console.log('Consulta admin exitosa, registros:', permissionsData?.length);
          }
        } catch (adminError) {
          console.error('Error usando cliente admin:', adminError);
        }
      }
      
      // Si el cliente admin falló o el usuario no es propietario, usar cliente estándar
      if (!permissionsData) {
        try {
          console.log('Intentando cargar permisos con cliente estándar');
          const client = await getAuthenticatedClient();
          
          // Consulta de prueba para verificar la conexión
          const testQuery = await client
            .from('role_permissions')
            .select('count(*)', { count: 'exact', head: true });
            
          if (testQuery.error) {
            console.error('Consulta de prueba falló:', testQuery.error);
            throw new Error(`Error de conexión: ${testQuery.error.message}`);
          }
          
          console.log('Consulta de prueba exitosa, procediendo con consulta principal');
          
          const { data, error } = await client
            .from('role_permissions')
            .select('*');
            
          if (error) {
            console.error('Consulta estándar falló:', error);
            throw new Error(`Error de conexión: ${error.message}`);
          }
          
          permissionsData = data;
          console.log('Consulta estándar exitosa, registros:', permissionsData?.length);
        } catch (clientError: any) {
          console.error('Error con cliente estándar:', clientError);
          
          // Si el usuario es admin/owner, intentar un último recurso con supabaseAdmin
          if (isOwner || currentOwnerStatus) {
            console.log('Intentando último recurso con cliente admin');
            try {
              const { data, error } = await supabaseAdmin
                .from('role_permissions')
                .select('*');
                
              if (!error) {
                permissionsData = data;
                console.log('Consulta de último recurso exitosa');
              } else {
                console.error('Consulta de último recurso falló:', error);
              }
            } catch (lastError) {
              console.error('Error en último intento:', lastError);
            }
          }
          
          // Si aún no hay datos, lanzar el error original
          if (!permissionsData) {
            throw clientError;
          }
        }
      }
      
      // Caso cuando no se encuentran permisos o se crean valores predeterminados
      if (!permissionsData || permissionsData.length === 0) {
        console.log('No se encontraron permisos, creando valores predeterminados');
        const defaultPermissions = getInitialPermissions();
        setPermissions(defaultPermissions);
        
        try {
          await savePermissionsToDatabase(defaultPermissions);
          console.log('Permisos predeterminados guardados exitosamente');
        } catch (saveError: any) {
          console.error('Error al guardar permisos predeterminados:', saveError);
          throw new Error(`Error al guardar las configuraciones de permisos predeterminadas: ${saveError.message}`);
        }
      } else {
        console.log('Procesando datos de permisos existentes');
        const loadedPermissions = processPermissionsData(permissionsData);
        console.log('Permisos procesados exitosamente');
        setPermissions(loadedPermissions);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error final en loadPermissions:', err);
      setError(err.message || 'Error al cargar los permisos');
      
      if (err.message?.includes('JWT')) {
        toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      } else if (err.message?.includes('connection')) {
        toast.error('Error de conexión con la base de datos. Verifique su conexión e intente de nuevo.');
      } else {
        toast.error(`Error al cargar permisos: ${err.message || 'Error desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return { loadPermissions };
}
