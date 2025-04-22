
import { useState, useEffect } from 'react';
import { UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PageAccess {
  id: string;
  name: string;
  description: string;
}
export interface RolePermission {
  role: UserRole;
  pages: Record<string, boolean>;
  actions: Record<string, boolean>;
  displayName: string;
}

export const availablePages: PageAccess[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Página principal' },
  { id: 'leads', name: 'Leads', description: 'Gestión de leads' },
  { id: 'prospects', name: 'Prospectos', description: 'Gestión de prospectos' },
  { id: 'validation', name: 'Validación', description: 'Validación de prospectos' },
  { id: 'user_management', name: 'Usuarios', description: 'Gestión de usuarios' },
  { id: 'requerimientos', name: 'Requerimientos', description: 'Gestión de requerimientos' },
  { id: 'call_center', name: 'Call Center', description: 'Centro de llamadas' },
  { id: 'support', name: 'Soporte', description: 'Tickets de soporte' },
];

export const availableActions: PageAccess[] = [
  { id: 'create_users', name: 'Crear usuarios', description: 'Puede crear nuevos usuarios' },
  { id: 'edit_roles', name: 'Editar roles', description: 'Puede cambiar roles de usuarios' },
  { id: 'verify_users', name: 'Verificar usuarios', description: 'Puede verificar usuarios' },
  { id: 'validate_prospects', name: 'Validar prospectos', description: 'Puede validar prospectos' },
  { id: 'create_leads', name: 'Crear leads', description: 'Puede crear nuevos leads' },
];

const getDisplayName = (role: UserRole): string => {
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

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Inicializa permisos por defecto según el rol
  const getInitialPermissions = (): RolePermission[] => {
    const roles: UserRole[] = [
      'supply', 
      'supply_admin', 
      'atención_afiliado', 
      'afiliados',
      'admin', 
      'owner'
    ];
    return roles.map(role => {
      const isAdmin = role === 'admin' || role === 'owner';
      const isSupplyAdmin = role === 'supply_admin';
      const pages: Record<string, boolean> = {};
      const actions: Record<string, boolean> = {};
      availablePages.forEach(page => {
        pages[page.id] = isAdmin;
        if (isSupplyAdmin) {
          pages[page.id] = ['dashboard', 'prospects', 'validation'].includes(page.id);
        }
      });
      availableActions.forEach(action => {
        actions[action.id] = isAdmin;
        if (isSupplyAdmin) {
          actions[action.id] = ['validate_prospects'].includes(action.id);
        }
      });
      return { 
        role, 
        pages, 
        actions,
        displayName: getDisplayName(role)
      };
    });
  };

  // Cargar permisos desde supabase al montar
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
        const roles: UserRole[] = [
          'supply', 
          'supply_admin', 
          'atención_afiliado', 
          'afiliados',
          'admin', 
          'owner'
        ];
        for (const role of roles) {
          const rolePerms = permissionsData.filter(p => p.role === role);
          const pages: Record<string, boolean> = {};
          const actions: Record<string, boolean> = {};
          availablePages.forEach(page => {
            const pagePermRecord = rolePerms.find(p => p.permission_type === 'page' && p.permission_id === page.id);
            pages[page.id] = !!pagePermRecord && pagePermRecord.allowed;
          });
          availableActions.forEach(action => {
            const actionPermRecord = rolePerms.find(p => p.permission_type === 'action' && p.permission_id === action.id);
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
    availablePages,
    availableActions
  };
}
