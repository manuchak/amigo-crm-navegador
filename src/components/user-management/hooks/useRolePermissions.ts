
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { availablePages, availableActions, ROLES, RolePermission } from '../rolePermissions.constants';
import { getDisplayName, getInitialPermissions, isUserOwner } from '../rolePermissions.utils';

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check if the current user is an owner with more verbose logging
  const checkOwnerStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Verificando status de propietario...");
      
      // Check local storage first
      const localOwnerStatus = isUserOwner();
      if (localOwnerStatus) {
        console.log("Owner status from local storage: ✅ Yes");
        setIsOwner(true);
        return true;
      }
      
      // Get current user from Supabase
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error al obtener usuario actual:", userError);
        return false;
      }
      
      if (!userData.user) {
        console.log("No se encontró un usuario autenticado");
        return false;
      }
      
      console.log("Usuario autenticado:", userData.user.email);
      
      // Check if user is owner through RPC function
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
        user_uid: userData.user.id
      });
      
      if (roleError) {
        console.error("Error al verificar rol de usuario:", roleError);
        return false;
      }
      
      const ownerStatus = roleData === 'owner';
      console.log("Resultado de verificación de rol:", roleData, "¿Es propietario?:", ownerStatus);
      
      // Update state with owner status
      setIsOwner(ownerStatus);
      
      return ownerStatus;
    } catch (err) {
      console.error('Error checking owner status:', err);
      
      // Fallback check from localStorage
      if (typeof window !== 'undefined') {
        try {
          const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
          if (userData && userData.role === 'owner') {
            console.log('Owner status from localStorage fallback: ✅ Yes');
            setIsOwner(true);
            return true;
          }
        } catch (e) {
          console.error('localStorage parsing error:', e);
        }
      }
      
      setIsOwner(false);
      return false;
    }
  }, []);

  // Load permissions from database with improved error handling
  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Iniciando carga de permisos...");
      
      // Check owner status first
      const ownerStatus = await checkOwnerStatus();
      console.log("Estado de propietario verificado:", ownerStatus);
      
      // Get permissions from database
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');
        
      if (error) {
        console.error("Error obteniendo permisos:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        // No permissions in database, use defaults
        console.log('No se encontraron permisos en la base de datos, usando valores predeterminados');
        const defaultPermissions = getInitialPermissions();
        console.log('Permisos predeterminados:', defaultPermissions);
        setPermissions(defaultPermissions);
      } else {
        // Process permissions from database
        console.log(`Encontrados ${data.length} permisos en la base de datos`);
        const rolePerms: Record<string, RolePermission> = {};
        
        // Initialize with default structure
        ROLES.forEach(role => {
          rolePerms[role] = {
            role,
            displayName: getDisplayName(role),
            pages: {},
            actions: {}
          };
          
          // Set all to false by default
          availablePages.forEach(page => {
            rolePerms[role].pages[page.id] = false;
          });
          
          availableActions.forEach(action => {
            rolePerms[role].actions[action.id] = false;
          });
        });
        
        // Fill in permissions from database
        data.forEach(perm => {
          const role = perm.role;
          
          if (!rolePerms[role]) return;
          
          if (perm.permission_type === 'page') {
            rolePerms[role].pages[perm.permission_id] = perm.allowed;
          } else if (perm.permission_type === 'action') {
            rolePerms[role].actions[perm.permission_id] = perm.allowed;
          }
        });
        
        // Ensure owner has all permissions
        if (rolePerms.owner) {
          availablePages.forEach(page => {
            rolePerms.owner.pages[page.id] = true;
          });
          
          availableActions.forEach(action => {
            rolePerms.owner.actions[action.id] = true;
          });
        }
        
        console.log("Permisos procesados:", Object.keys(rolePerms).length, "roles");
        setPermissions(Object.values(rolePerms));
      }
    } catch (err: any) {
      console.error('Error loading permissions:', err);
      setError(err.message || 'Error al cargar la configuración de permisos');
      
      // Fallback to defaults
      console.log("Usando permisos predeterminados como fallback");
      const defaultPermissions = getInitialPermissions();
      console.log('Permisos predeterminados (fallback):', defaultPermissions);
      setPermissions(defaultPermissions);
    } finally {
      setLoading(false);
    }
  }, [checkOwnerStatus]);

  // Save permissions to database with improved logging
  const handleSavePermissions = async () => {
    const localOwnerStatus = isUserOwner();
    
    if (!isOwner && !localOwnerStatus) {
      console.error("Intento de guardar permisos sin ser propietario");
      setError("Solo el propietario puede guardar permisos");
      toast.error("Solo el propietario puede guardar permisos");
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      console.log('Guardando permisos en la base de datos...');
      
      // Format data for database
      const permissionsToSave: any[] = [];
      
      permissions.forEach(rolePerm => {
        // Add page permissions
        Object.entries(rolePerm.pages).forEach(([pageId, allowed]) => {
          permissionsToSave.push({
            role: rolePerm.role,
            permission_type: 'page',
            permission_id: pageId,
            allowed
          });
        });
        
        // Add action permissions
        Object.entries(rolePerm.actions).forEach(([actionId, allowed]) => {
          permissionsToSave.push({
            role: rolePerm.role,
            permission_type: 'action',
            permission_id: actionId,
            allowed
          });
        });
      });
      
      console.log(`Guardando ${permissionsToSave.length} permisos`);
      
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .not('id', 'is', null);
        
      if (deleteError) {
        console.error("Error al eliminar permisos existentes:", deleteError);
        throw deleteError;
      }
      
      // Insert new permissions in batches
      const BATCH_SIZE = 50;
      for (let i = 0; i < permissionsToSave.length; i += BATCH_SIZE) {
        const batch = permissionsToSave.slice(i, i + BATCH_SIZE);
        
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) {
          console.error("Error al insertar lote de permisos:", insertError);
          throw insertError;
        }
      }
      
      console.log("Permisos guardados correctamente");
      toast.success('Permisos guardados correctamente');
    } catch (err: any) {
      console.error('Error al guardar permisos:', err);
      setError(err.message || 'Error al guardar los permisos');
      toast.error('Error al guardar los permisos');
    } finally {
      setSaving(false);
    }
  };

  // Load permissions on mount or retry
  useEffect(() => {
    console.log("Cargando permisos (intento #" + retryCount + ")");
    loadPermissions();
  }, [loadPermissions, retryCount]);

  // Handle permission change
  const handlePermissionChange = (
    roleIndex: number,
    type: 'pages' | 'actions',
    id: string,
    allowed: boolean
  ) => {
    const newPermissions = [...permissions];
    
    // Update the permission
    if (type === 'pages') {
      newPermissions[roleIndex].pages[id] = allowed;
    } else {
      newPermissions[roleIndex].actions[id] = allowed;
    }
    
    setPermissions(newPermissions);
  };
  
  // Function to force reload permissions
  const reloadPermissions = () => {
    console.log('Recarga manual de permisos iniciada');
    setRetryCount(prev => prev + 1);
  };

  return {
    permissions,
    loading,
    saving,
    error,
    isOwner,
    loadPermissions,
    savePermissions: handleSavePermissions,
    handleSavePermissions,
    handlePermissionChange,
    checkOwnerStatus,
    setRetryCount,
    availablePages,
    availableActions,
    ROLES,
    getRoleDisplayName: getDisplayName, // Provide the function under the expected name for backward compatibility
    reloadPermissions
  };
}
