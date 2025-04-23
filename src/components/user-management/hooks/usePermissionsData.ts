
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
      
      // First, check if we're in owner mode - this affects how we proceed
      const currentOwnerStatus = checkForOwnerRole();
      console.log('Current owner status:', currentOwnerStatus ? '✅ Yes' : '❌ No');
      
      if (currentOwnerStatus !== isOwner) {
        console.log(`Owner status changed from ${isOwner} to ${currentOwnerStatus}`);
        setIsOwner(currentOwnerStatus);
      }
      
      // Use a fresh admin client for every operation
      console.log('Creating fresh admin client for permissions...');
      const adminClient = getAdminClient();
      
      // Test connection with a simple, lightweight request first before proceeding
      console.log('Testing initial database connection...');
      const { data: testData, error: testError } = await adminClient.rpc('version');
      
      if (testError) {
        console.error('Initial connection test failed:', testError);
        throw new Error(`Error de conexión inicial: ${testError.message}`);
      }
      
      console.log('Connection test successful:', testData ? 'Connected' : 'No data');
      
      // Now proceed to get the actual permissions
      console.log('Fetching permissions data...');
      const { data: permissionsData, error: queryError } = await adminClient
        .from('role_permissions')
        .select('*');
      
      if (queryError) {
        console.error('Error fetching permissions data:', queryError);
        throw new Error(`Error al cargar permisos: ${queryError.message}`);
      }
      
      console.log('Permission data received:', permissionsData?.length || 0, 'records');
      
      // Handle case where no permissions found
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
      console.error('Critical error in loadPermissions:', err);
      
      // Check for specific API key errors
      const errorMessage = err.message || 'Error desconocido';
      const isApiKeyError = errorMessage.includes('Invalid API key') || 
                           errorMessage.includes('clave API') || 
                           errorMessage.includes('JWT') ||
                           errorMessage.includes('autenticación') ||
                           errorMessage.includes('Authentication');
      
      if (isApiKeyError) {
        setError('Error de autenticación con la base de datos. Por favor intente nuevamente.');
        
        // Additional debugging for authentication errors
        console.error('Authentication error details:', err);
        console.log('Current owner status:', checkForOwnerRole() ? 'Owner' : 'Not owner');
      } else {
        setError(errorMessage);
      }
      
      // Always load default permissions as fallback
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
