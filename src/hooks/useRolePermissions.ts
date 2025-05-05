import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole, UserData } from '@/types/auth';

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
  'soporte',
  'atención_afiliado',
  'afiliados',
  'bi',
  'monitoring',
  'monitoring_supervisor',
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
    'soporte': 'Soporte',
    'atención_afiliado': 'Atención al Afiliado',
    'afiliados': 'Afiliados',
    'bi': 'Business Intelligence',
    'monitoring': 'Monitoreo',
    'monitoring_supervisor': 'Supervisor Monitoreo',
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
  const [retryCount, setRetryCount] = useState(0);
  const [users, setUsers] = useState<any[]>([]);

  // Check if the current user is an owner with more verbose logging
  const checkOwnerStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Verificando status de propietario...");
      
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

  // New function to fetch users from Supabase
  const fetchUsers = useCallback(async () => {
    try {
      console.log("Fetching users from Supabase...");
      
      // Get profiles from Supabase
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      if (!profiles || profiles.length === 0) {
        console.log("No profiles found in Supabase");
        return [];
      }
      
      console.log(`Found ${profiles.length} profiles in Supabase`);
      
      // Get role information for each profile
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Get role for this user
            const { data: roleData, error: roleError } = await supabase.rpc(
              'get_user_role',
              { user_uid: profile.id }
            );
            
            const role = roleError ? 'unverified' : (roleData as UserRole || 'unverified');
            console.log(`User ${profile.id} (${profile.email}) has role: ${role}`);
            
            return {
              id: profile.id,
              uid: profile.id,
              email: profile.email || '',
              displayName: profile.display_name || profile.email || '',
              photoURL: profile.photo_url || undefined,
              role: role,
              createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
              lastLogin: profile.last_login ? new Date(profile.last_login) : new Date()
            };
          } catch (error) {
            console.error(`Error getting role for user ${profile.id}:`, error);
            return {
              id: profile.id,
              uid: profile.id,
              email: profile.email || '',
              displayName: profile.display_name || profile.email || '',
              photoURL: profile.photo_url || undefined,
              role: 'unverified',
              createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
              lastLogin: profile.last_login ? new Date(profile.last_login) : new Date()
            };
          }
        })
      );
      
      console.log(`Processed ${usersWithRoles.length} users with roles`);
      return usersWithRoles;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
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
      
      // Fetch users
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      console.log(`Loaded ${fetchedUsers.length} users`);
      
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
        setPermissions(getInitialPermissions());
      } else {
        // Process permissions from database
        console.log(`Encontrados ${data.length} permisos en la base de datos`);
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
        
        console.log("Permisos procesados:", Object.keys(rolePerms).length, "roles");
        setPermissions(Object.values(rolePerms));
      }
    } catch (err: any) {
      console.error('Error loading permissions:', err);
      setError(err.message || 'Error al cargar la configuración de permisos');
      
      // Fallback to defaults
      console.log("Usando permisos predeterminados como fallback");
      setPermissions(getInitialPermissions());
    } finally {
      setLoading(false);
    }
  }, [checkOwnerStatus, fetchUsers]);

  // Save permissions to database with improved logging
  const handleSavePermissions = async () => {
    if (!isOwner) {
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

  // Check if a user has permission for a page or action
  const hasPermission = async (type: 'page' | 'action', id: string): Promise<boolean> => {
    try {
      // First check if user is owner - owners have all permissions
      const ownerStatus = await checkOwnerStatus();
      if (ownerStatus) {
        console.log(`Usuario es propietario, otorgando permiso ${type} para ${id}`);
        return true;
      }
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log('No se encontró usuario, denegando permiso');
        return false;
      }

      // Get user role
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
        user_uid: userData.user.id
      });

      if (roleError) {
        console.error('Error al obtener rol de usuario:', roleError);
        throw roleError;
      }
      
      // Owner role double check
      if (roleData === 'owner') return true;

      // Query the role_permissions table
      const { data, error } = await supabase
        .from('role_permissions')
        .select('allowed')
        .eq('role', roleData)
        .eq('permission_type', type)
        .eq('permission_id', id)
        .maybeSingle();

      if (error) {
        console.error(`Error verificando permiso ${type} para ${id}:`, error);
        throw error;
      }
      
      const hasAccess = data?.allowed === true;
      console.log(`Verificación de permiso para ${type}:${id} para usuario con rol ${roleData}: ${hasAccess ? 'otorgado ✅' : 'denegado ❌'}`);
      return hasAccess;
      
    } catch (err) {
      console.error(`Error en hasPermission (${type}:${id}):`, err);
      return false;
    }
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
    users,
    loadPermissions,
    savePermissions: handleSavePermissions,
    handleSavePermissions,
    handlePermissionChange,
    hasPermission,
    checkOwnerStatus,
    setRetryCount,
    availablePages,
    availableActions,
    ROLES,
    getRoleDisplayName,
    reloadPermissions
  };
};
