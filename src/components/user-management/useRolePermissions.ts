import { useState, useEffect, useCallback } from 'react';
import { 
  supabase, 
  getAuthenticatedClient, 
  supabaseAdmin, 
  checkForOwnerRole 
} from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  availablePages,
  availableActions,
  RolePermission,
  PageAccess,
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
  }, [retryCount, isOwner]);

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading role permissions, attempt:', retryCount + 1);
      console.log('Current owner status:', isOwner ? '✅ Yes' : '❌ No');
      
      // Select client based on owner status
      let client;
      
      if (isOwner) {
        // For owners, use admin client with service role key directly
        console.log('Using admin client for owner');
        client = supabaseAdmin;
      } else {
        try {
          // For regular users, get authenticated client
          console.log('Getting authenticated client for regular user');
          client = await getAuthenticatedClient();
        } catch (authError: any) {
          console.error('Authentication error:', authError);
          
          // Special handling for owners if normal auth fails
          const isActuallyOwner = checkForOwnerRole();
          if (isActuallyOwner && !isOwner) {
            console.log('Owner detected after auth error, updating status');
            setIsOwner(true);
            setRetryCount(prev => prev + 1);
            return;
          }
          
          throw new Error(`Error de autenticación: ${authError.message}`);
        }
      }

      // Verify we have a valid client before proceeding
      if (!client) {
        console.error('No valid client obtained');
        throw new Error('No se pudo obtener un cliente válido para la base de datos');
      }
      
      // Run a test query to verify client is working
      const testQuery = await client.from('role_permissions').select('count(*)', { count: 'exact', head: true });
      if (testQuery.error) {
        console.error('Test query failed:', testQuery.error);
        
        // Last chance for owners - retry with direct admin client
        if (isOwner && retryCount < 1) {
          console.log('Retrying with direct admin client');
          setRetryCount(prev => prev + 1);
          return;
        }
        
        throw new Error(`Error de conexión: ${testQuery.error.message}`);
      }
      
      console.log('Test query successful, proceeding to fetch permissions');
      
      // Fetch permissions data
      const { data: permissionsData, error } = await client
        .from('role_permissions')
        .select('*');

      if (error) {
        console.error('Error loading permissions:', error);
        
        // Check if it's an authentication error
        if (error.code === 'PGRST301' || 
            error.message.includes('JWT') || 
            error.message.includes('auth') || 
            error.message.includes('API key')) {
          
          if (retryCount < 2) {
            console.log('Auth error detected, will retry');
            // Recheck owner status before retry
            const currentlyOwner = checkForOwnerRole();
            if (currentlyOwner !== isOwner) {
              setIsOwner(currentlyOwner);
            }
            setRetryCount(prev => prev + 1);
            return;
          }
        }
        
        throw new Error(`Error al cargar las configuraciones de permisos: ${error.message}`);
      }
      
      console.log('Permissions data loaded:', permissionsData?.length || 0, 'records');
      
      // If no permissions exist, create default ones
      if (!permissionsData || permissionsData.length === 0) {
        console.log('No permissions found, creating defaults');
        const defaultPermissions = getInitialPermissions();
        setPermissions(defaultPermissions);
        
        try {
          await savePermissionsToDatabase(defaultPermissions, client);
          console.log('Default permissions saved successfully');
        } catch (saveError: any) {
          console.error('Error saving default permissions:', saveError);
          throw new Error(`Error al guardar las configuraciones de permisos predeterminadas: ${saveError.message}`);
        }
      } else {
        // Process existing permissions data
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
      toast.error('Error al cargar los permisos: ' + (err.message || 'Error desconocido'));
      
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

  const savePermissionsToDatabase = async (permsToSave: RolePermission[], client: any) => {
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
      // First delete all existing permissions
      // Use a safer approach for delete
      console.log('Deleting existing permissions...');
      const { error: deleteError } = await client
        .from('role_permissions')
        .delete()
        .gt('id', 0); // This ensures we match all records
        
      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError);
        throw new Error(`Error al eliminar permisos existentes: ${deleteError.message}`);
      }
      
      // Insert new permissions in batches to avoid request size limits
      console.log('Inserting new permissions in batches...');
      const BATCH_SIZE = 20;
      
      for (let i = 0; i < permissionsToInsert.length; i += BATCH_SIZE) {
        const batch = permissionsToInsert.slice(i, i + BATCH_SIZE);
        
        const { error: insertError } = await client
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) {
          console.error('Error inserting permissions batch:', insertError);
          throw new Error(`Error al guardar nuevos permisos: ${insertError.message}`);
        }
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
      const currentIsOwner = checkForOwnerRole();
      console.log('Owner status during save:', currentIsOwner ? '✅ Yes' : '❌ No');
      
      if (currentIsOwner !== isOwner) {
        console.log('Owner status changed, updating');
        setIsOwner(currentIsOwner);
      }
      
      // Select appropriate client based on role
      let client;
      
      if (currentIsOwner) {
        // Always use admin client directly for owners
        console.log('Using direct admin client for save operation');
        client = supabaseAdmin;
      } else {
        try {
          console.log('Getting authenticated client for save operation');
          client = await getAuthenticatedClient();
        } catch (authError: any) {
          console.error('Auth error during save:', authError);
          
          // Final check for owner role as fallback
          if (checkForOwnerRole()) {
            console.log('Auth error but owner detected, using admin client');
            client = supabaseAdmin;
          } else {
            throw authError;
          }
        }
      }
      
      // Verify client before proceeding
      if (!client) {
        throw new Error('No se pudo obtener un cliente válido para guardar los cambios');
      }
      
      // Test client connection
      const testResult = await client.from('role_permissions').select('count(*)', { count: 'exact', head: true });
      console.log('Save client test:', testResult.error ? 'Failed ❌' : 'Success ✅');
      
      if (testResult.error) {
        // Last resort fallback to admin for owners
        if (currentIsOwner) {
          console.log('Test failed, forcing direct admin client');
          client = supabaseAdmin;
        } else {
          throw new Error(`Error de conexión: ${testResult.error.message}`);
        }
      }
      
      // Save permissions using the selected client
      await savePermissionsToDatabase(permissions, client);
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
