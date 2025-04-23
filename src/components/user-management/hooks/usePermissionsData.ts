
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
      
      // Check owner status from localStorage to determine which client to use
      const currentOwnerStatus = checkForOwnerRole();
      console.log('Current owner status:', currentOwnerStatus ? '✅ Yes' : '❌ No');
      
      if (currentOwnerStatus !== isOwner) {
        console.log(`Owner status changed from ${isOwner} to ${currentOwnerStatus}`);
        setIsOwner(currentOwnerStatus);
      }

      // Always use a fresh admin client for permissions access
      console.log('Getting fresh admin client for permissions data');
      const adminClient = getAdminClient();
      
      // Test connection first to validate API key
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await adminClient
        .from('role_permissions')
        .select('count(*)');
        
      if (testError) {
        console.error('Admin client connection test failed:', testError);
        throw new Error(`Error de conexión con la base de datos: ${testError.message}`);
      }
        
      console.log('Connection test successful, proceeding with permissions query');
      
      // Proceed with actual data query
      const { data: permissionsData, error: queryError } = await adminClient
        .from('role_permissions')
        .select('*');
      
      if (queryError) {
        console.error('Error fetching permissions data:', queryError);
        throw new Error(`Error al cargar permisos: ${queryError.message}`);
      }
      
      console.log('Permission data fetched successfully, records found:', permissionsData?.length);
      
      // Handle the case where no permissions are found
      if (!permissionsData || permissionsData.length === 0) {
        console.log('No permissions found, creating default values');
        const defaultPermissions = getInitialPermissions();
        setPermissions(defaultPermissions);
      } else {
        console.log('Processing existing permissions data');
        const loadedPermissions = processPermissionsData(permissionsData);
        setPermissions(loadedPermissions);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error in loadPermissions:', err);
      
      // Check if this is an API key related error
      const errorMessage = err.message || 'Error desconocido';
      const isApiKeyError = errorMessage.includes('Invalid API key') || 
                           errorMessage.includes('clave API') || 
                           errorMessage.includes('JWT');
      
      if (isApiKeyError) {
        setError('Error de autenticación con la base de datos. Por favor intente nuevamente.');
      } else {
        setError(errorMessage);
      }
      
      // Use default permissions as fallback in case of error
      console.log('Loading default permissions as fallback');
      const defaultPermissions = getInitialPermissions();
      setPermissions(defaultPermissions);
      
      toast.error(`Error al cargar permisos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return { loadPermissions };
}
