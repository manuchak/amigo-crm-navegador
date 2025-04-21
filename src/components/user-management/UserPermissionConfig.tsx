
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define page access and permissions types
interface PageAccess {
  id: string;
  name: string;
  description: string;
}

interface RolePermission {
  role: UserRole;
  pages: Record<string, boolean>;
  actions: Record<string, boolean>;
  displayName: string;
}

// Define available pages and permissions
const availablePages: PageAccess[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Página principal' },
  { id: 'leads', name: 'Leads', description: 'Gestión de leads' },
  { id: 'prospects', name: 'Prospectos', description: 'Gestión de prospectos' },
  { id: 'validation', name: 'Validación', description: 'Validación de prospectos' },
  { id: 'user_management', name: 'Usuarios', description: 'Gestión de usuarios' },
  { id: 'requerimientos', name: 'Requerimientos', description: 'Gestión de requerimientos' },
  { id: 'call_center', name: 'Call Center', description: 'Centro de llamadas' },
  { id: 'support', name: 'Soporte', description: 'Tickets de soporte' },
];

const availableActions: PageAccess[] = [
  { id: 'create_users', name: 'Crear usuarios', description: 'Puede crear nuevos usuarios' },
  { id: 'edit_roles', name: 'Editar roles', description: 'Puede cambiar roles de usuarios' },
  { id: 'verify_users', name: 'Verificar usuarios', description: 'Puede verificar usuarios' },
  { id: 'validate_prospects', name: 'Validar prospectos', description: 'Puede validar prospectos' },
  { id: 'create_leads', name: 'Crear leads', description: 'Puede crear nuevos leads' },
];

// Helper function to display role names in Spanish
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

const UserPermissionConfig: React.FC = () => {
  // Initialize permissions with default values
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
      // Set default permissions based on role
      const isAdmin = role === 'admin' || role === 'owner';
      const isSupplyAdmin = role === 'supply_admin';
      
      const pages: Record<string, boolean> = {};
      const actions: Record<string, boolean> = {};
      
      // Set default page access
      availablePages.forEach(page => {
        // Owners and admins have access to all pages
        pages[page.id] = isAdmin;
        
        // Supply admin has access to certain pages
        if (isSupplyAdmin) {
          pages[page.id] = ['dashboard', 'prospects', 'validation'].includes(page.id);
        }
      });
      
      // Set default actions
      availableActions.forEach(action => {
        actions[action.id] = isAdmin;
        
        // Supply admin can validate prospects but not manage users
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

  const [permissions, setPermissions] = useState<RolePermission[]>(getInitialPermissions);
  const [selectedTab, setSelectedTab] = useState<'pages' | 'actions'>('pages');

  const handlePermissionChange = (roleIndex: number, type: 'pages' | 'actions', id: string, checked: boolean) => {
    const newPermissions = [...permissions];
    
    if (type === 'pages') {
      newPermissions[roleIndex].pages[id] = checked;
    } else {
      newPermissions[roleIndex].actions[id] = checked;
    }
    
    setPermissions(newPermissions);
  };

  const handleSavePermissions = () => {
    // Here you would save the permissions to your backend
    console.log('Saving permissions:', permissions);
    
    // Show success message
    toast.success('Configuración de permisos guardada correctamente');
  };

  return (
    <Card className="shadow-md mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Configuración de Permisos por Rol</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-2">
          <Button 
            variant={selectedTab === 'pages' ? 'default' : 'outline'} 
            onClick={() => setSelectedTab('pages')}
          >
            Acceso a Páginas
          </Button>
          <Button 
            variant={selectedTab === 'actions' ? 'default' : 'outline'} 
            onClick={() => setSelectedTab('actions')}
          >
            Acciones Permitidas
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Rol</TableHead>
                {selectedTab === 'pages' ? (
                  availablePages.map(page => (
                    <TableHead key={page.id} className="text-center" title={page.description}>
                      {page.name}
                    </TableHead>
                  ))
                ) : (
                  availableActions.map(action => (
                    <TableHead key={action.id} className="text-center" title={action.description}>
                      {action.name}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((rolePermission, roleIndex) => (
                <TableRow key={rolePermission.role}>
                  <TableCell className="font-medium">{rolePermission.displayName}</TableCell>
                  {selectedTab === 'pages' ? (
                    availablePages.map(page => (
                      <TableCell key={page.id} className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            id={`${rolePermission.role}-${page.id}`}
                            checked={rolePermission.pages[page.id]}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(roleIndex, 'pages', page.id, checked as boolean)
                            }
                            disabled={rolePermission.role === 'owner'} // Owner always has all permissions
                          />
                        </div>
                      </TableCell>
                    ))
                  ) : (
                    availableActions.map(action => (
                      <TableCell key={action.id} className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            id={`${rolePermission.role}-${action.id}`}
                            checked={rolePermission.actions[action.id]}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(roleIndex, 'actions', action.id, checked as boolean)
                            }
                            disabled={rolePermission.role === 'owner'} // Owner always has all permissions
                          />
                        </div>
                      </TableCell>
                    ))
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSavePermissions}>Guardar Configuración</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissionConfig;
