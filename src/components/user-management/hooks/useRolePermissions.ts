
import { useEffect } from 'react';
import { useRolePermissionsState } from './useRolePermissionsState';
import { usePermissionsData } from './usePermissionsData';
import { usePermissionsSave } from './usePermissionsSave';
import { toast } from 'sonner';

export function useRolePermissions() {
  const state = useRolePermissionsState();
  const { loadPermissions } = usePermissionsData();
  const { savePermissionsToDatabase } = usePermissionsSave();

  useEffect(() => {
    loadPermissions(
      state.setLoading,
      state.setError,
      state.setPermissions,
      state.setIsOwner,
      state.isOwner,
      state.retryCount
    );
  }, [state.retryCount]);

  const handlePermissionChange = (
    roleIndex: number,
    type: 'pages' | 'actions',
    id: string,
    checked: boolean
  ) => {
    const newPermissions = [...state.permissions];
    if (type === 'pages') {
      newPermissions[roleIndex].pages[id] = checked;
    } else {
      newPermissions[roleIndex].actions[id] = checked;
    }
    state.setPermissions(newPermissions);
  };

  const handleSavePermissions = async () => {
    try {
      state.setSaving(true);
      state.setError(null);
      console.log('Starting save permissions operation...');
      
      await savePermissionsToDatabase(state.permissions);
      
    } catch (error: any) {
      console.error('Handle save permissions error:', error);
      state.setError(error.message || 'Error al guardar la configuración de permisos');
      toast.error('Error al guardar la configuración de permisos: ' + (error.message || 'Error desconocido'));
    } finally {
      state.setSaving(false);
    }
  };

  const reloadPermissions = () => {
    console.log('Manual reload triggered');
    state.setRetryCount(prev => prev + 1);
  };

  return {
    ...state,
    handlePermissionChange,
    handleSavePermissions,
    reloadPermissions,
  };
}
