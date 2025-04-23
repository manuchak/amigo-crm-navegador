
import { useState, useEffect } from 'react';
import { supabase, getAuthenticatedClient, supabaseAdmin, checkForOwnerRole } from '@/integrations/supabase/client';
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

  useEffect(() => {
    checkOwnerStatus();
    loadPermissions();
    // eslint-disable-next-line
  }, [retryCount]);

  // Check if current user is owner for special handling
  const checkOwnerStatus = () => {
    const isOwnerUser = checkForOwnerRole();
    setIsOwner(isOwnerUser);
    console.log('Owner check result:', isOwnerUser ? '✅ Yes' : '❌ No');
  };

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading role permissions from Supabase...');
      
      // Decide which client to use based on owner status
      let client;
      
      try {
        if (isOwner) {
          console.log('Using admin client for owner user');
          client = supabaseAdmin;
        } else {
          client = await getAuthenticatedClient();
        }
        
        console.log('Authentication successful, fetching permissions');
        
        // Fetch permissions
        const { data: permissionsData, error } = await client
          .from('role_permissions')
          .select('*');

        if (error) {
          console.error('Error loading permissions:', error);
          
          // Check if it's an authentication error and we need to retry with admin client
          if (error.code === 'PGRST301' || error.message.includes('JWT') || error.message.includes('auth')) {
            if (isOwner && retryCount < 1) {
              console.log('Authentication error detected for owner, will retry with admin client');
              setRetryCount(prev => prev + 1);
              return;
            }
          }
          
          throw new Error('Error al cargar las configuraciones de permisos: ' + error.message);
        }
        
        console.log('Permissions data loaded:', permissionsData?.length || 0, 'records');
        
        if (!permissionsData || permissionsData.length === 0) {
          const defaultPermissions = getInitialPermissions();
          setPermissions(defaultPermissions);
          
          try {
            await savePermissionsToDatabase(defaultPermissions, client);
            console.log('Default permissions saved to database');
          } catch (err) {
            console.error('Error saving default permissions:', err);
            throw new Error('Error al guardar las configuraciones de permisos predeterminadas');
          }
        } else {
          const loadedPermissions: RolePermission[] = [];
          for (const role of ROLES) {
            const rolePerms = permissionsData.filter((p: any) => p.role === role);
            const pages: Record<string, boolean> = {};
            const actions: Record<string, boolean> = {};
            
            availablePages.forEach(page => {
              const pagePermRecord = rolePerms.find((p: any) => p.permission_type === 'page' && p.permission_id === page.id);
              pages[page.id] = !!pagePermRecord && pagePermRecord.allowed;
            });
            
            availableActions.forEach(action => {
              const actionPermRecord = rolePerms.find((p: any) => p.permission_type === 'action' && p.permission_id === action.id);
              actions[action.id] = !!actionPermRecord && actionPermRecord.allowed;
            });
            
            loadedPermissions.push({
              role,
              pages,
              actions,
              displayName: getDisplayName(role)
            });
          }
          console.log('Permissions loaded and processed successfully');
          setPermissions(loadedPermissions);
        }
      } catch (authError: any) {
        console.error('Authentication error in loadPermissions:', authError);
        
        // If we're owner or already retried with normal client, try admin client as last resort
        if ((isOwner || retryCount > 0) && retryCount < 2) {
          console.log('Using admin client as fallback, retry:', retryCount + 1);
          setRetryCount(prev => prev + 1);
          return;
        }
        
        throw authError;
      }
    } catch (err: any) {
      console.error('Final error in loadPermissions:', err);
      setError(err.message || 'Error al cargar los permisos');
      toast.error('Error al cargar los permisos: ' + (err.message || 'Error desconocido'));
      setPermissions(getInitialPermissions());
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
    console.log('Saving permissions to database:', permsToSave);
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
      // First use a more reliable delete query 
      console.log('Deleting existing permissions...');
      const { error: deleteError } = await client
        .from('role_permissions')
        .delete()
        .gte('id', 0); // This ensures we match all records
        
      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError);
        throw new Error('Error al eliminar permisos existentes: ' + deleteError.message);
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
          throw new Error('Error al guardar nuevos permisos: ' + insertError.message);
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
      
      // For consistency, recheck owner status before attempting save
      const currentIsOwner = checkForOwnerRole();
      if (currentIsOwner !== isOwner) {
        setIsOwner(currentIsOwner);
      }
      
      // Select appropriate client based on role
      let client;
      try {
        if (currentIsOwner) {
          console.log('Owner detected, using admin client for save operation');
          client = supabaseAdmin;
        } else {
          console.log('Non-owner user, getting authenticated client');
          client = await getAuthenticatedClient();
        }
        
        // Verify client is ready before proceeding
        const testResult = await client.from('role_permissions').select('count(*)', { count: 'exact', head: true });
        console.log('Client connection test:', testResult.error ? 'Failed' : 'Successful');
        
        if (testResult.error) {
          // If normal client fails and user is owner, fall back to admin
          if (currentIsOwner) {
            console.log('Test connection failed, forcing admin client');
            client = supabaseAdmin;
          } else {
            throw new Error('No se pudo conectar al servidor: ' + testResult.error.message);
          }
        }
        
        await savePermissionsToDatabase(permissions, client);
        toast.success('Configuración de permisos guardada correctamente');
        console.log('Permissions saved successfully');
        
      } catch (saveError: any) {
        console.error('Error during save operation:', saveError);
        
        // If save failed and we haven't tried admin yet but user is owner, try one more time
        if (currentIsOwner && saveError.message.includes('auth')) {
          try {
            console.log('Final attempt using direct admin client');
            await savePermissionsToDatabase(permissions, supabaseAdmin);
            toast.success('Configuración de permisos guardada correctamente (modo administrador)');
            return;
          } catch (finalError: any) {
            console.error('Final save attempt failed:', finalError);
            throw finalError;
          }
        }
        
        throw saveError;
      }
    } catch (error: any) {
      console.error('Handle save permissions error:', error);
      setError(error.message || 'Error al guardar la configuración de permisos');
      toast.error('Error al guardar la configuración de permisos: ' + (error.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  return {
    permissions,
    setPermissions,
    loading,
    saving,
    error,
    isOwner,
    handlePermissionChange,
    handleSavePermissions,
  };
}
