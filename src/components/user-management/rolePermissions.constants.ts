
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
  { id: 'admin_config', name: 'Configuración Admin', description: 'Configuración de administrador' },
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
  { id: 'manage_permissions', name: 'Gestionar permisos', description: 'Puede configurar permisos de sistema' },
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
