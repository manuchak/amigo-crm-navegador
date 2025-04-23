
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: permissionsData, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) {
        console.error('Error loading permissions:', error);
        toast.error('Error al cargar las configuraciones de permisos');
        setPermissions(getInitialPermissions());
        return;
      }
      if (!permissionsData || permissionsData.length === 0) {
        const defaultPermissions = getInitialPermissions();
        setPermissions(defaultPermissions);
        await savePermissionsToDatabase(defaultPermissions);
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
    const permissionsToInsert = [];
    for (const rolePerm of permsToSave) {
      for (const pageId in rolePerm.pages) {
        permissionsToInsert.push({
          role: rolePerm.role,
          permission_type: 'page',
          permission_id: pageId,
          allowed: rolePerm.pages[pageId]
        });
      }
      for (const actionId in rolePerm.actions) {
        permissionsToInsert.push({
          role: rolePerm.role,
          permission_type: 'action',
          permission_id: actionId,
          allowed: rolePerm.actions[actionId]
        });
      }
    }
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .neq('id', 0);
    if (deleteError) {
      console.error('Error deleting existing permissions:', deleteError);
      throw new Error('Error al eliminar permisos existentes');
    }
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(permissionsToInsert);
    if (insertError) {
      console.error('Error inserting permissions:', insertError);
      throw new Error('Error al guardar nuevos permisos');
    }
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
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
