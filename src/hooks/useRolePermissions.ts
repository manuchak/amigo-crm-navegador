
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/types/auth';

// Permission types
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermission {
  role: UserRole;
  displayName: string;
  pages: Record<string, boolean>;
  actions: Record<string, boolean>;
}

// Available permissions
export const availablePages: Permission[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Página principal' },
  { id: 'leads', name: 'Leads', description: 'Gestión de leads' },
  { id: 'prospects', name: 'Prospectos', description: 'Gestión de prospectos' },
  { id: 'validation', name: 'Validación', description: 'Validación de prospectos' },
  { id: 'user_management', name: 'Usuarios', description: 'Gestión de usuarios' },
  { id: 'requerimientos', name: 'Requerimientos', description: 'Gestión de requerimientos' },
  { id: 'call_center', name: 'Call Center', description: 'Centro de llamadas' },
  { id: 'support', name: 'Soporte', description: 'Tickets de soporte' },
];

export const availableActions: Permission[] = [
  { id: 'create_users', name: 'Crear usuarios', description: 'Puede crear nuevos usuarios' },
  { id: 'edit_roles', name: 'Editar roles', description: 'Puede cambiar roles de usuarios' },
  { id: 'verify_users', name: 'Verificar usuarios', description: 'Puede verificar usuarios' },
  { id: 'validate_prospects', name: 'Validar prospectos', description: 'Puede validar prospectos' },
  { id: 'create_leads', name: 'Crear leads', description: 'Puede crear nuevos leads' },
  { id: 'registrar_instalador', name: 'Registrar instalador', description: 'Registrar instaladores de GPS' },
  { id: 'ver_instaladores', name: 'Ver instaladores', description: 'Ver, listar y monitorear instaladores' },
  { id: 'evaluar_instalacion', name: 'Evaluar instalación', description: 'Evaluar la instalación realizada' },
];

// User roles
export const ROLES: UserRole[] = [
  'supply', 
  'supply_admin', 
  'atención_afiliado', 
  'afiliados',
  'admin', 
  'owner',
  'pending',
  'unverified'
];

// Role display names
export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    'unverified': 'No verificado',
    'pending': 'Pendiente',
    'supply': 'Supply',
    'supply_admin': 'Supply Admin',
    'atención_afiliado': 'Atención al Afiliado',
    'afiliados': 'Afiliados',
    'admin': 'Administrador',
    'owner': 'Propietario'
  };
  return displayNames[role] || role;
};

// Get initial permissions for roles
export const getInitialPermissions = (): RolePermission[] => {
  return ROLES.map(role => {
    const isAdmin = role === 'admin' || role === 'owner';
    const isSupplyAdmin = role === 'supply_admin';
    
    const pages: Record<string, boolean> = {};
    const actions: Record<string, boolean> = {};
    
    availablePages.forEach(page => {
      if (isSupplyAdmin) {
        pages[page.id] = ['dashboard', 'leads', 'prospects', 'validation', 'requerimientos', 'call_center'].includes(page.id);
      } else {
        pages[page.id] = isAdmin;
      }
    });

    availableActions.forEach(action => {
      if (isSupplyAdmin) {
        actions[action.id] = ['create_leads', 'validate_prospects', 'ver_instaladores', 'evaluar_instalacion'].includes(action.id);
      } else {
        actions[action.id] = isAdmin;
      }
    });

    return { 
      role, 
      pages, 
      actions,
      displayName: getRoleDisplayName(role)
    };
  });
};

export const useRolePermissions = () => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Check if the current user is an owner
  const checkOwnerStatus = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { data, error } = await supabase.rpc('get_user_role', {
        user_uid: userData.user.id
      });

      if (!error && data === 'owner') {
        setIsOwner(true);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error checking owner status:', err);
      return false;
    }
  }, []);

  // Load permissions from database
  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check owner status
      const ownerStatus = await checkOwnerStatus();
      setIsOwner(ownerStatus);
      
      // Get permissions from database
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // No permissions in database, use defaults
        setPermissions(getInitialPermissions());
      } else {
        // Process permissions from database
        const rolePerms: Record<string, RolePermission> = {};
        
        // Initialize with default structure
        ROLES.forEach(role => {
          rolePerms[role] = {
            role,
            displayName: getRoleDisplayName(role),
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
          const role = perm.role as UserRole;
          
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
        
        setPermissions(Object.values(rolePerms));
      }
    } catch (err: any) {
      console.error('Error loading permissions:', err);
      setError(err.message || 'Error al cargar la configuración de permisos');
      
      // Fallback to defaults
      setPermissions(getInitialPermissions());
    } finally {
      setLoading(false);
    }
  }, [checkOwnerStatus]);

  // Save permissions to database
  const savePermissions = async () => {
    setSaving(true);
    setError(null);
    
    try {
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
      
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .not('id', 'is', null);
        
      if (deleteError) throw deleteError;
      
      // Insert new permissions in batches
      const BATCH_SIZE = 50;
      for (let i = 0; i < permissionsToSave.length; i += BATCH_SIZE) {
        const batch = permissionsToSave.slice(i, i + BATCH_SIZE);
        
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(batch);
          
        if (insertError) throw insertError;
      }
      
      toast.success('Permisos guardados correctamente');
    } catch (err: any) {
      console.error('Error saving permissions:', err);
      setError(err.message || 'Error al guardar los permisos');
      toast.error('Error al guardar los permisos');
    } finally {
      setSaving(false);
    }
  };

  // Load permissions on mount
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

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

  // Check if a user has permission for a page or action
  const hasPermission = async (type: 'page' | 'action', id: string): Promise<boolean> => {
    try {
      // Custom implementation using direct database query
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const userRole = await supabase.rpc('get_user_role', {
        user_uid: userData.user.id
      });

      if (userRole.error) throw userRole.error;
      
      // Owner always has all permissions
      if (userRole.data === 'owner') return true;

      // Query the role_permissions table directly
      const { data, error } = await supabase
        .from('role_permissions')
        .select('allowed')
        .eq('role', userRole.data)
        .eq('permission_type', type)
        .eq('permission_id', id)
        .maybeSingle();

      if (error) throw error;
      
      return data?.allowed === true;
      
    } catch (err) {
      console.error(`Error checking permission (${type}:${id}):`, err);
      return false;
    }
  };

  return {
    permissions,
    loading,
    saving,
    error,
    isOwner,
    loadPermissions,
    savePermissions,
    handlePermissionChange,
    hasPermission,
    checkOwnerStatus,
    availablePages,
    availableActions,
    ROLES,
    getRoleDisplayName
  };
};
