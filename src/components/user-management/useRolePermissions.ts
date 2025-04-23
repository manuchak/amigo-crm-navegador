import { useState, useEffect, useCallback } from 'react';
import { 
  supabase, 
  getAuthenticatedClient, 
  supabaseAdmin, 
  checkForOwnerRole,
  getAdminClient
} from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  availablePages,
  availableActions,
  RolePermission,
  ROLES
} from './rolePermissions.constants';
import { getDisplayName, getInitialPermissions } from './rolePermissions.utils';
import { UserRole } from '@/types/auth';

// Export the constants for external usage
export { availablePages, availableActions };

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check owner status on component mount
  useEffect(() => {
    const ownerStatus = checkForOwnerRole();
    console.log('Initial owner status:', ownerStatus ? '✅ Yes' : '❌ No');
    setIsOwner(ownerStatus);
  }, []);
  
  // Load permissions with retry mechanism
  useEffect(() => {
    loadPermissions();
    // eslint-disable-next-line
  }, [retryCount]);

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading role permissions, attempt:', retryCount + 1);
      console.log('Current owner status:', isOwner ? '✅ Yes' : '❌ No');
      
      let permissionsData = null;
      const currentOwnerStatus = checkForOwnerRole();
      
      // Update owner status if it changed
      if (currentOwnerStatus !== isOwner) {
        console.log(`Owner status changed from ${isOwner} to ${currentOwnerStatus}`);
        setIsOwner(currentOwnerStatus);
      }
      
      // Try with admin client first if owner
      if (currentOwnerStatus) {
        try {
          console.log('Attempting to fetch permissions with admin client for owner');
          
          // Use direct admin client with explicit headers
          const adminQuery = getAdminClient()
            .select('*');
            
          const { data, error } = await adminQuery;
          
          if (error) {
            console.error('Admin client query failed:', error);
            throw error;
          }
          
          permissionsData = data;
          console.log('Admin client query successful, records:', permissionsData?.length);
        } catch (adminError) {
          console.error('Error using admin client:', adminError);
          // Continue to standard client as fallback
        }
      }
      
      // If not owner or admin client failed, try with standard authenticated client
      if (!permissionsData) {
        try {
          console.log('Attempting to fetch permissions with standard client');
          const client = await getAuthenticatedClient();
          
          // Test query first to validate connection
          const testQuery = await client.from('role_permissions')
            .select('count(*)', { count: 'exact', head: true })
            .limit(1);
            
          if (testQuery.error) {
            console.error('Test query failed:', testQuery.error);
            throw new Error(`Error de conexión: ${testQuery.error.message}`);
          }
          
          console.log('Test query successful, proceeding with main query');
          
          // Main query
          const { data, error } = await client.from('role_permissions')
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
      
      // If no permissions exist, create default ones
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
        // Process existing permissions data
        console.log('Processing existing permissions data');
        const loadedPermissions: RolePermission[] = [];
        
        for (const role of ROLES) {
          const rolePerms = permissionsData.filter((p: any) => p.role === role);
          const pages: Record<string, boolean> = {};
          const actions: Record<string, boolean> = {};
          
          availablePages.forEach(page => {
            const pagePermRecord = rolePerms.find((p: any) => 
              p.permission_type === 'page' && p.permission_id === page.id);
            pages[page.id] = !!pagePermRecord && pagePermRecord.allowed;
          });
          
          availableActions.forEach(action => {
            const actionPermRecord = rolePerms.find((p: any) => 
              p.permission_type === 'action' && p.permission_id === action.id);
            actions[action.id] = !!actionPermRecord && actionPermRecord.allowed;
          });
          
          loadedPermissions.push({
            role,
            pages,
            actions,
            displayName: getDisplayName(role)
          });
        }
        
        console.log('Permissions processed successfully');
        setPermissions(loadedPermissions);
      }
      
      // Clear any existing error
      setError(null);
    } catch (err: any) {
      console.error('Final error in loadPermissions:', err);
      setError(err.message || 'Error al cargar los permisos');
      
      // Set default permissions to keep UI working
      if (permissions.length === 0) {
        setPermissions(getInitialPermissions());
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    roleIndex: number, 
    type: 'pages' | 'actions', 
    id: string, 
    checked: boolean
  ) => {
    const newPermissions = [...permissions];
    if (type === 'pages') {
      newPermissions[roleIndex].pages[id] = checked;
    } else {
      newPermissions[roleIndex].actions[id] = checked;
    }
    setPermissions(newPermissions);
  };

  const savePermissionsToDatabase = async (permsToSave: RolePermission[], customClient = null) => {
    console.log('Saving permissions to database');
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

    console.log('Total permissions to insert:', permissionsToInsert.length);
    
    try {
      // Determine which client to use
      let client = customClient;
      const currentOwnerStatus = checkForOwnerRole();
      
      if (!client) {
        if (currentOwnerStatus) {
          console.log('Using admin client for owner');
          client = supabaseAdmin;
        } else {
          console.log('Getting authenticated client');
          client = await getAuthenticatedClient();
        }
      }
      
      // Delete existing permissions
      console.log('Deleting existing permissions...');
      let deleteSuccess = false;
      
      // For owner users, use the more reliable direct admin client
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
          // Fall through to standard client approach
        }
      }
      
      // If admin client failed or user is not owner, try standard approach
      if (!deleteSuccess) {
        console.log('Using standard client for delete operation');
        const { error: deleteError } = await client.from('role_permissions').delete().neq('id', 0);
        
        if (deleteError) {
          console.error('Standard client delete failed:', deleteError);
          throw deleteError;
        }
      }
      
      // Insert new permissions in batches
      console.log('Inserting new permissions in batches...');
      const BATCH_SIZE = 20;
      const client_to_use = currentOwnerStatus ? getAdminClient() : client.from('role_permissions');
      
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
    } catch (error: any) {
      console.error('Error in savePermissionsToDatabase:', error);
      throw error;
    }
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      setError(null);
      console.log('Starting save permissions operation...');
      
      // Re-verify owner status for consistency
      const currentOwnerStatus = checkForOwnerRole();
      console.log('Owner status during save:', currentOwnerStatus ? '✅ Yes' : '❌ No');
      
      if (currentOwnerStatus !== isOwner) {
        console.log('Owner status changed, updating');
        setIsOwner(currentOwnerStatus);
      }
      
      // Save permissions
      await savePermissionsToDatabase(permissions);
      toast.success('Configuración de permisos guardada correctamente');
      console.log('Permissions saved successfully');
      
    } catch (error: any) {
      console.error('Handle save permissions error:', error);
      setError(error.message || 'Error al guardar la configuración de permisos');
      toast.error('Error al guardar la configuración de permisos: ' + (error.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  // Add a manual reload function
  const reloadPermissions = useCallback(() => {
    console.log('Manual reload triggered');
    setRetryCount(prev => prev + 1);
  }, []);

  return {
    permissions,
    setPermissions,
    loading,
    saving,
    error,
    isOwner,
    handlePermissionChange,
    handleSavePermissions,
    reloadPermissions,
  };
}
