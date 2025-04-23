
import { useCallback } from 'react';
import { getAuthenticatedClient, supabaseAdmin, checkForOwnerRole } from '@/integrations/supabase/client';
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

      let permissionsData = null;

      // Try loading with admin client if user is owner
      if (currentOwnerStatus) {
        try {
          console.log('Loading permissions with admin client (owner mode)');
          
          // Explicitly use apikey header with the service role key
          const { data, error } = await supabaseAdmin
            .from('role_permissions')
            .select('*');
          
          if (error) {
            console.error('Admin client query failed:', error);
          } else {
            permissionsData = data;
            console.log('Admin client query successful, records:', permissionsData?.length);
          }
        } catch (adminError) {
          console.error('Error with admin client:', adminError);
        }
      }

      // If the admin client failed or user is not owner, try with standard client
      if (!permissionsData) {
        try {
          console.log('Attempting to load permissions with standard client');
          const client = await getAuthenticatedClient();
          
          const { data, error } = await client
            .from('role_permissions')
            .select('*');
          
          if (error) {
            console.error('Standard client query failed:', error);
            throw error;
          }
          
          permissionsData = data;
          console.log('Standard client query successful, records:', permissionsData?.length);
        } catch (error: any) {
          console.error('Error loading permissions with standard client:', error);
          
          // One last fallback attempt for owners
          if (currentOwnerStatus) {
            try {
              console.log('Final fallback attempt with admin client');
              const { data } = await supabaseAdmin
                .from('role_permissions')
                .select('*');
                
              permissionsData = data;
              console.log('Fallback query successful');
            } catch (fallbackError) {
              console.error('Fallback query failed:', fallbackError);
            }
          }
          
          // If still no data, create default permissions
          if (!permissionsData) {
            console.log('Unable to load permissions data, using defaults');
          }
        }
      }

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
      console.error('Final error in loadPermissions:', err);
      setError(err.message || 'Error al cargar los permisos');
      
      // Use default permissions as fallback in case of error
      const defaultPermissions = getInitialPermissions();
      setPermissions(defaultPermissions);
      
      toast.error(`Error al cargar permisos: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return { loadPermissions };
}
