
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
      
      // Try to fetch permissions - first with admin client if owner
      if (currentOwnerStatus) {
        try {
          console.log('Attempting to fetch permissions with admin client for owner');
          
          const { data, error } = await supabaseAdmin
            .from('role_permissions')
            .select('*');
          
          if (error) {
            console.error('Admin client query failed:', error);
            throw error;
          }
          
          permissionsData = data;
          console.log('Admin client query successful, records:', permissionsData?.length);
        } catch (adminError) {
          console.error('Error using admin client:', adminError);
          // Continue to try standard client as fallback
        }
      }
      
      // If admin client didn't work or user is not an owner, try standard client
      if (!permissionsData) {
        try {
          console.log('Attempting to fetch permissions with standard client');
          const client = await getAuthenticatedClient();
          
          // Test query to make sure connection works
          const testQuery = await client
            .from('role_permissions')
            .select('count(*)', { count: 'exact', head: true });
            
          if (testQuery.error) {
            console.error('Test query failed:', testQuery.error);
            throw new Error(`Error de conexión: ${testQuery.error.message}`);
          }
          
          console.log('Test query successful, proceeding with main query');
          
          const { data, error } = await client
            .from('role_permissions')
            .select('*');
            
          if (error) {
            console.error('Standard client query failed:', error);
            throw new Error(`Error de conexión: ${error.message}`);
          }
          
          permissionsData = data;
          console.log('Standard client query successful, records:', permissionsData?.length);
        } catch (clientError: any) {
          console.error('Error with standard client:', clientError);
          throw clientError;
        }
      }
      
      // Handle the case when no permissions are found or create defaults
      if (!permissionsData || permissionsData.length === 0) {
        console.log('No permissions found, creating defaults');
        const defaultPermissions = getInitialPermissions();
        setPermissions(defaultPermissions);
        
        try {
          await savePermissionsToDatabase(defaultPermissions);
          console.log('Default permissions saved successfully');
        } catch (saveError: any) {
          console.error('Error saving default permissions:', saveError);
          throw new Error(`Error al guardar las configuraciones de permisos predeterminadas: ${saveError.message}`);
        }
      } else {
        console.log('Processing existing permissions data');
        const loadedPermissions = processPermissionsData(permissionsData);
        console.log('Permissions processed successfully');
        setPermissions(loadedPermissions);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Final error in loadPermissions:', err);
      setError(err.message || 'Error al cargar los permisos');
      
      if (err.message?.includes('JWT')) {
        toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      } else {
        toast.error(`Error al cargar permisos: ${err.message || 'Error desconocido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return { loadPermissions };
}
