
import { useCallback } from 'react';
import { getAdminClient, checkForOwnerRole } from '@/integrations/supabase/client';
import { RolePermission } from '../rolePermissions.constants';
import { getInitialPermissions } from '../rolePermissions.utils';
import { toast } from 'sonner';
import { processPermissionsData } from '../utils/permissionsDataProcessor';

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
      console.log('Loading role permissions, attempt:', retryCount + 1);
      
      // Verificar el estado de propietario desde localStorage
      const currentOwnerStatus = checkForOwnerRole();
      console.log('Current owner status:', currentOwnerStatus ? '✅ Yes' : '❌ No');
      
      if (currentOwnerStatus !== isOwner) {
        console.log(`Owner status changed from ${isOwner} to ${currentOwnerStatus}`);
        setIsOwner(currentOwnerStatus);
      }
      
      // Obtenemos un cliente admin completamente nuevo en cada carga
      // Esto evita problemas de caché de token o sesión
      console.log('Obteniendo cliente admin para cargar permisos...');
      const adminClient = getAdminClient();
      
      // Primera prueba de conexión básica (sin datos) para validar el cliente
      const { error: connectionError } = await adminClient.from('role_permissions')
        .select('count(*)', { count: 'exact', head: true });
      
      if (connectionError) {
        console.error('Error en prueba de conexión:', connectionError);
        throw new Error(`Error de conexión inicial: ${connectionError.message}`);
      }
      
      console.log('Conexión de prueba exitosa, procediendo a consultar permisos');

      // Consulta real de datos de permisos con el cliente validado
      const { data: permissionsData, error: queryError } = await adminClient
        .from('role_permissions')
        .select('*');
      
      if (queryError) {
        console.error('Error fetching permissions data:', queryError);
        throw new Error(`Error al cargar permisos: ${queryError.message}`);
      }
      
      console.log('Datos de permisos obtenidos:', permissionsData?.length || 0, 'registros');
      
      // Manejar el caso donde no se encuentran permisos
      if (!permissionsData || permissionsData.length === 0) {
        console.log('No se encontraron permisos, creando valores predeterminados');
        const defaultPermissions = getInitialPermissions();
        setPermissions(defaultPermissions);
      } else {
        console.log('Procesando datos de permisos existentes');
        const loadedPermissions = processPermissionsData(permissionsData);
        setPermissions(loadedPermissions);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error crítico en loadPermissions:', err);
      
      // Comprobación específica de errores relacionados con la API key
      const errorMessage = err.message || 'Error desconocido';
      const isApiKeyError = errorMessage.includes('Invalid API key') || 
                           errorMessage.includes('clave API') || 
                           errorMessage.includes('JWT') ||
                           errorMessage.includes('autenticación');
      
      if (isApiKeyError) {
        setError('Error de autenticación con la base de datos. Por favor intente nuevamente.');
      } else {
        setError(errorMessage);
      }
      
      // Usar permisos predeterminados como respaldo en caso de error
      console.log('Cargando permisos predeterminados como respaldo');
      const defaultPermissions = getInitialPermissions();
      setPermissions(defaultPermissions);
      
      toast.error(`Error al cargar permisos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return { loadPermissions };
}
