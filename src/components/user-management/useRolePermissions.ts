
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
    // eslint-disable-next-line
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading role permissions from Supabase...');
      
      try {
        // Get an authenticated client to ensure we have a valid session
        const authenticatedClient = await getAuthenticatedClient();
        console.log('Session authentication successful');
        
        // Obtenemos los permisos
        const { data: permissionsData, error } = await authenticatedClient
          .from('role_permissions')
          .select('*');

        console.log('Permissions data from Supabase:', permissionsData);
        
        if (error) {
          console.error('Error loading permissions:', error);
          setError('Error al cargar las configuraciones de permisos');
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
            console.log('Default permissions saved to database');
          } catch (err) {
            console.error('Error saving default permissions:', err);
            setError('Error al guardar las configuraciones de permisos predeterminadas');
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
      } catch (authError: any) {
        console.error('Authentication error in loadPermissions:', authError);
        setError(authError.message || 'Error de autenticación');
        toast.error('Error de autenticación: ' + (authError.message || 'Error desconocido'));
        setPermissions(getInitialPermissions());
      }
    } catch (err: any) {
      console.error('Error in loadPermissions:', err);
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
      // Verificar explícitamente que tenemos una sesión válida antes de continuar
      const authenticatedClient = await getAuthenticatedClient();
      
      // Primero, eliminar todos los registros existentes usando una expresión WHERE más clara
      console.log('Deleting existing permissions...');
      
      // Primera estrategia: eliminar todos los registros sin filtro
      const { error: deleteError } = await authenticatedClient
        .from('role_permissions')
        .delete()
        .neq('id', -1);  // Esto eliminará todos los registros (id nunca es -1)
        
      if (deleteError) {
        console.error('Error deleting existing permissions:', deleteError);
        throw new Error('Error al eliminar permisos existentes: ' + deleteError.message);
      }
      
      // Insertar nuevos permisos en lotes para evitar límites de tamaño de solicitud
      console.log('Inserting new permissions...');
      for (let i = 0; i < permissionsToInsert.length; i += 10) {
        const batch = permissionsToInsert.slice(i, i + 10);
        console.log(`Inserting batch ${Math.floor(i/10) + 1}/${Math.ceil(permissionsToInsert.length/10)}`, batch);
        
        const { error: insertError } = await authenticatedClient
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) {
          console.error('Error inserting permissions batch:', insertError);
          throw new Error('Error al guardar nuevos permisos: ' + insertError.message);
        }
      }
      
      console.log('Successfully saved all permissions to database');
    } catch (error: any) {
      console.error('Error in savePermissionsToDatabase:', error);
      throw error;
    }
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);
      setError(null);
      console.log('Saving permissions to database...');
      
      try {
        await savePermissionsToDatabase(permissions);
        toast.success('Configuración de permisos guardada correctamente');
      } catch (saveError: any) {
        console.error('Error saving permissions:', saveError);
        
        // Si el error parece ser de autenticación, intentar refrescar la sesión y reintentar
        if (saveError.message && saveError.message.includes('autenticada')) {
          console.log('Error de autenticación detectado, intentando refrescar sesión...');
          
          try {
            // Forzar refresco de sesión
            await supabase.auth.refreshSession();
            // Reintentar guardado
            await savePermissionsToDatabase(permissions);
            toast.success('Configuración de permisos guardada correctamente');
            return;
          } catch (retryError: any) {
            console.error('Error en segundo intento:', retryError);
            throw retryError;
          }
        } else {
          throw saveError;
        }
      }
    } catch (error: any) {
      console.error('Error en handleSavePermissions:', error);
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
    handlePermissionChange,
    handleSavePermissions,
  };
}
