
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
      
      // Siempre usar directamente supabaseAdmin para los propietarios
      let client = isOwner ? supabaseAdmin : null;
      
      // Si no es propietario o necesitamos verificar la autenticación
      if (!client) {
        try {
          client = await getAuthenticatedClient();
          console.log('Authentication successful, client obtained');
        } catch (authError: any) {
          console.error('Authentication error:', authError);
          
          // Último intento - verificar si es propietario nuevamente
          const isActuallyOwner = checkForOwnerRole();
          if (isActuallyOwner) {
            console.log('Owner detected after auth error, using admin client');
            client = supabaseAdmin;
            // Actualizar estado si es propietario pero no lo teníamos registrado
            if (!isOwner) {
              setIsOwner(true);
            }
          } else {
            throw new Error(`Error de autenticación: ${authError.message}`);
          }
        }
      }

      // Verificar que tenemos un cliente válido antes de continuar
      if (!client) {
        console.error('No valid client obtained');
        throw new Error('No se pudo obtener un cliente válido para la base de datos');
      }
      
      // Ejecutar una consulta de prueba para verificar que el cliente funciona
      console.log('Testing database connection...');
      
      try {
        // Consulta explícita con headers adicionales para el propietario
        const headers: Record<string, string> = {};
        
        // Si es propietario, asegurarnos que las credenciales estén en los headers
        if (isOwner) {
          const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjkzMjU5NCwiZXhwIjoyMDU4NTA4NTk0fQ.7alp-dJOJPuUEjiWb71LOFlRFE6QrQQxuXXSTBJwyAM";
          headers['apikey'] = SUPABASE_SERVICE_ROLE_KEY;
          headers['Authorization'] = `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`;
          console.log('Added service role credentials to headers');
        }
        
        const testQuery = await client.from('role_permissions')
          .select('count(*)', { count: 'exact', head: true })
          .limit(1);
        
        if (testQuery.error) {
          console.error('Test query failed:', testQuery.error);
          throw new Error(`Error de conexión: ${testQuery.error.message}`);
        }
        
        console.log('Connection test successful, proceeding to fetch permissions');
      } catch (testError: any) {
        console.error('Connection test error:', testError);
        
        // Si es propietario y falla, intentar con el cliente admin forzando headers
        if (isOwner && retryCount < 3) {
          console.log('Retrying with forced service role credentials');
          setRetryCount(prev => prev + 1);
          return;
        }
        
        throw new Error(`Error de conexión: ${testError.message}`);
      }
      
      // Fetch permissions data with proper headers
      console.log('Fetching permissions data...');
      const { data: permissionsData, error } = await client
        .from('role_permissions')
        .select('*');

      if (error) {
        console.error('Error loading permissions:', error);
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
      // Primero eliminar todos los permisos existentes usando una técnica más segura
      console.log('Deleting existing permissions...');
      
      // Método 1: Intentar eliminar directamente con el service role para propietarios
      if (isOwner) {
        const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjkzMjU5NCwiZXhwIjoyMDU4NTA4NTk0fQ.7alp-dJOJPuUEjiWb71LOFlRFE6QrQQxuXXSTBJwyAM";
        
        // Intento con servicio fetch nativo para mayor control
        try {
          const response = await fetch('https://beefjsdgrdeiymzxwxru.supabase.co/rest/v1/role_permissions', {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            }
          });
          
          if (response.ok) {
            console.log('Successfully deleted all permissions using native fetch');
          } else {
            console.error('Failed to delete permissions:', await response.text());
            throw new Error(`Error al eliminar permisos existentes: ${response.statusText}`);
          }
        } catch (fetchError) {
          console.error('Native fetch delete error:', fetchError);
          // Continuar intentando con el método del cliente
          const { error: deleteError } = await client
            .from('role_permissions')
            .delete()
            .neq('id', 0); // Esto selecciona todos los registros
            
          if (deleteError) {
            console.error('Error deleting existing permissions:', deleteError);
            throw new Error(`Error al eliminar permisos existentes: ${deleteError.message}`);
          }
        }
      } else {
        // Para usuarios no propietarios, usar el método normal
        const { error: deleteError } = await client
          .from('role_permissions')
          .delete()
          .neq('id', 0);
          
        if (deleteError) {
          console.error('Error deleting existing permissions:', deleteError);
          throw new Error(`Error al eliminar permisos existentes: ${deleteError.message}`);
        }
      }
      
      // Insertar nuevos permisos en lotes para evitar límites de tamaño de solicitud
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
      
      // Re-verificar estado de propietario por consistencia
      const currentIsOwner = checkForOwnerRole();
      console.log('Owner status during save:', currentIsOwner ? '✅ Yes' : '❌ No');
      
      if (currentIsOwner !== isOwner) {
        console.log('Owner status changed, updating');
        setIsOwner(currentIsOwner);
      }
      
      // Siempre usar el cliente de admin para propietarios
      let client = currentIsOwner ? supabaseAdmin : null;
      
      // Si no es propietario, obtener cliente autenticado
      if (!client) {
        try {
          client = await getAuthenticatedClient();
          console.log('Auth client obtained for save operation');
        } catch (authError: any) {
          console.error('Auth error during save:', authError);
          
          // Último intento para propietarios
          if (checkForOwnerRole()) {
            console.log('Auth error but owner detected, using admin client');
            client = supabaseAdmin;
          } else {
            throw authError;
          }
        }
      }
      
      // Verificar cliente antes de continuar
      if (!client) {
        throw new Error('No se pudo obtener un cliente válido para guardar los cambios');
      }
      
      // Guardar permisos con el cliente seleccionado
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
