
import { useState, useEffect } from 'react';
import { supabase, getAuthenticatedClient } from '@/integrations/supabase/client';
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

  useEffect(() => {
    loadPermissions();
    // eslint-disable-next-line
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      console.log('Loading role permissions from Supabase...');
      
      // Get an authenticated client to ensure we have a valid session
      const authenticatedClient = await getAuthenticatedClient();
      
      const { data: permissionsData, error } = await authenticatedClient
        .from('role_permissions')
        .select('*');

      console.log('Permissions data from Supabase:', permissionsData);
      
      if (error) {
        console.error('Error loading permissions:', error);
        toast.error('Error al cargar las configuraciones de permisos');
        // Initialize with default permissions but don't save them yet
        setPermissions(getInitialPermissions());
        setLoading(false);
        return;
      }
      
      if (!permissionsData || permissionsData.length === 0) {
        const defaultPermissions = getInitialPermissions();
        setPermissions(defaultPermissions);
        
        try {
          await savePermissionsToDatabase(defaultPermissions);
        } catch (err) {
          console.error('Error saving default permissions:', err);
          toast.error('Error al guardar las configuraciones de permisos predeterminadas');
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
        setPermissions(loadedPermissions);
      }
    } catch (err) {
      console.error('Error in loadPermissions:', err);
      toast.error('Error al cargar los permisos');
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

  const savePermissionsToDatabase = async (permsToSave: RolePermission[]) => {
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

    console.log('Permissions to insert:', permissionsToInsert.length, 'records');
    
    try {
      // Get an authenticated client
      const authenticatedClient = await getAuthenticatedClient();
      
      // First delete existing permissions
      const { error: deleteError } = await authenticatedClient
        .from('role_permissions')
        .delete()
        .not('id', 'is', null); // This is safer than using .neq('id', 0)
        
      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError);
        throw new Error('Error al eliminar permisos existentes');
      }
      
      // Then insert new permissions in batches to avoid hitting request size limits
      for (let i = 0; i < permissionsToInsert.length; i += 10) {
        const batch = permissionsToInsert.slice(i, i + 10);
        console.log(`Inserting batch ${i/10 + 1}/${Math.ceil(permissionsToInsert.length/10)}`, batch);
        
        const { error: insertError } = await authenticatedClient
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) {
          console.error('Error inserting permissions batch:', insertError);
          throw new Error('Error al guardar nuevos permisos');
        }
      }
      
      console.log('Successfully saved all permissions to database');
    } catch (error) {
      console.error('Error in savePermissionsToDatabase:', error);
      throw error;
    }
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      console.log('Saving permissions to database...');
      await savePermissionsToDatabase(permissions);
      toast.success('Configuración de permisos guardada correctamente');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Error al guardar la configuración de permisos');
    } finally {
      setSaving(false);
    }
  };

  return {
    permissions,
    setPermissions,
    loading,
    saving,
    handlePermissionChange,
    handleSavePermissions,
  };
}
