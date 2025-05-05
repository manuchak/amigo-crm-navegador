import React, { useState, useEffect } from 'react';
import { useRolePermissions } from './hooks/useRolePermissions';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Loader2, 
  AlertTriangle, 
  Shield, 
  Lock, 
  CheckCircle2, 
  Info, 
  Users,
  UserCog
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { checkForOwnerRole } from '@/integrations/supabase/client';
import { isUserOwner } from './rolePermissions.utils';

const UserPermissionConfig = () => {
  const { userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');
  const [isVerifyingOwner, setIsVerifyingOwner] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  const {
    permissions,
    loading,
    saving,
    error,
    isOwner,
    users,
    handlePermissionChange,
    handleSavePermissions,
    reloadPermissions,
    availablePages,
    availableActions,
    ROLES
  } = useRolePermissions();

  // Log users when component mounts or users change
  useEffect(() => {
    console.log("Users in UserPermissionConfig:", users);
  }, [users]);

  // Check owner status on mount
  useEffect(() => {
    const verifyOwnerStatus = async () => {
      setIsVerifyingOwner(true);
      try {
        // Check local storage
        const localOwnerStatus = isUserOwner();
        
        // Double check with Supabase
        const dbOwnerStatus = await checkForOwnerRole();
        
        console.log('Owner status check results:', {
          localStorage: localOwnerStatus ? '✅' : '❌',
          supabase: dbOwnerStatus ? '✅' : '❌'
        });
        
        if (!localOwnerStatus && !dbOwnerStatus && userData?.email === 'manuel.chacon@detectasecurity.io') {
          toast.warning('Se detectó que tu cuenta debería tener permisos de propietario pero no los tiene configurados correctamente');
        }
      } catch (error) {
        console.error('Error verifying owner status:', error);
      } finally {
        setIsVerifyingOwner(false);
      }
    };
    
    verifyOwnerStatus();
  }, [userData, refreshUserData]);

  // Determine effective owner status combining DB and localStorage checks
  const effectiveOwnerStatus = isOwner || isUserOwner();
  
  const handleForceRefresh = async () => {
    try {
      await refreshUserData();
      reloadPermissions();
      toast.success('Información de permisos actualizada');
    } catch (error) {
      console.error('Error updating permission data:', error);
      toast.error('Error al actualizar información de permisos');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Card className="border shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Gestión de Permisos</span>
          </CardTitle>
          <CardDescription>
            Cargando configuración de permisos del sistema...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          
          <Button 
            onClick={handleForceRefresh} 
            variant="outline" 
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar cargar de nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Access denied state
  if (!effectiveOwnerStatus) {
    return (
      <Card className="border shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Shield className="h-5 w-5 text-amber-600" />
            <span>Acceso Restringido</span>
          </CardTitle>
          <CardDescription className="text-amber-700">
            Solo el propietario del sistema puede configurar los permisos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-800">Permisos insuficientes</AlertTitle>
            <AlertDescription className="text-amber-700">
              Para gestionar los permisos del sistema, necesitas tener el rol de Propietario.
              Si crees que deberías tener acceso, contacta al administrador del sistema.
            </AlertDescription>
          </Alert>
          
          <div className="p-4 bg-slate-50 rounded-md">
            <h3 className="font-medium text-sm mb-2">Información de usuario:</h3>
            <div className="text-sm space-y-1 text-slate-600">
              <p><span className="font-medium">Usuario:</span> {userData?.email || 'No autenticado'}</p>
              <p><span className="font-medium">Rol actual:</span> {userData?.role || 'No definido'}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleForceRefresh} 
            variant="outline" 
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Verificar permisos
          </Button>
          
          <div className="text-xs text-muted-foreground mt-4">
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)} 
              className="text-xs text-muted-foreground underline"
            >
              {showDebugInfo ? 'Ocultar información de depuración' : 'Mostrar información de depuración'}
            </button>
            
            {showDebugInfo && (
              <div className="mt-2 p-3 border rounded bg-slate-50 overflow-auto text-xs">
                <p className="font-semibold mb-1">Variables de estado:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>isOwner (DB): {isOwner ? 'true' : 'false'}</li>
                  <li>isUserOwner (localStorage): {isUserOwner() ? 'true' : 'false'}</li>
                  <li>effectiveOwnerStatus: {effectiveOwnerStatus ? 'true' : 'false'}</li>
                </ul>
                
                {userData && (
                  <>
                    <p className="mt-2 font-semibold">Datos de usuario:</p>
                    <pre className="mt-1 p-2 bg-slate-100 rounded text-xs overflow-auto">
                      {JSON.stringify(userData, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main content - permission management
  return (
    <Card className="border shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Gestión de Permisos</span>
        </CardTitle>
        <CardDescription>
          Configura los permisos para cada rol del sistema. Define qué páginas y acciones pueden realizar los usuarios según su rol.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Información sobre permisos</h3>
            <p className="text-sm text-blue-700 mt-1">
              Aquí puedes configurar qué permisos tiene cada rol en el sistema. Puedes habilitar o deshabilitar 
              acceso a páginas y acciones específicas para cada rol.
            </p>
            <div className="mt-2 text-sm text-blue-700">
              <p><span className="font-medium">Importante:</span> El rol de Propietario siempre tiene todos los permisos habilitados y no se puede modificar.</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center flex-wrap gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="roles" className="flex items-center gap-1.5">
                <UserCog className="h-3.5 w-3.5" />
                <span>Roles y Usuarios</span>
              </TabsTrigger>
              <TabsTrigger value="pages" className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Acceso a Páginas</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Acceso a Acciones</span>
              </TabsTrigger>
            </TabsList>
          
            <div className="flex gap-2 w-full mb-4">
              <Button 
                onClick={reloadPermissions} 
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar
              </Button>
              
              <Button 
                onClick={handleSavePermissions}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
            
            <TabsContent value="roles" className="m-0 w-full">
              <UserRolesTable users={users} />
            </TabsContent>
            
            <TabsContent value="pages" className="m-0 w-full">
              <PermissionsTable
                title="Permisos de Páginas"
                permissions={permissions}
                items={availablePages}
                type="pages"
                onChange={handlePermissionChange}
                roles={ROLES}
              />
            </TabsContent>
            
            <TabsContent value="actions" className="m-0 w-full">
              <PermissionsTable
                title="Permisos de Acciones"
                permissions={permissions}
                items={availableActions}
                type="actions"
                onChange={handlePermissionChange}
                roles={ROLES}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

interface UserRolesTableProps {
  users: any[];
}

const UserRolesTable: React.FC<UserRolesTableProps> = ({ users }) => {
  console.log("Users in UserRolesTable:", users);
  
  if (!users || users.length === 0) {
    return (
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>No hay usuarios registrados</AlertTitle>
        <AlertDescription>
          No se encontraron usuarios en el sistema. Cuando los usuarios se registren, aparecerán aquí.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Usuario</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium text-center">Rol Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell>{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={
                      user.role === 'owner' 
                        ? 'default' 
                        : user.role === 'admin' 
                          ? 'destructive' 
                          : 'outline'
                    }
                    className="font-normal"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface PermissionsTableProps {
  title: string;
  permissions: any[];
  items: any[];
  type: 'pages' | 'actions';
  onChange: (roleIndex: number, type: 'pages' | 'actions', id: string, checked: boolean) => void;
  roles: string[];
}

const PermissionsTable: React.FC<PermissionsTableProps> = ({
  title,
  permissions,
  items,
  type,
  onChange,
  roles
}) => {
  if (!permissions || permissions.length === 0) {
    return (
      <Alert>
        <AlertTitle>No hay datos de permisos</AlertTitle>
        <AlertDescription>
          No se pudieron cargar los permisos. Intente recargar la página.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter out unverified and pending roles for display
  const activeRoles = permissions.filter(
    p => !['unverified', 'pending'].includes(p.role)
  );
  
  // Sort roles by importance
  const sortedActiveRoles = [...activeRoles].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      'owner': 1,
      'admin': 2,
      'monitoring_supervisor': 3,
      'monitoring': 4,
      'supply_admin': 5,
      'bi': 6,
      'supply': 7,
      'soporte': 8,
      'atención_afiliado': 9,
      'afiliados': 10
    };
    
    return (roleOrder[a.role] || 100) - (roleOrder[b.role] || 100);
  });

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[240px] font-medium">{title}</TableHead>
              {sortedActiveRoles.map((role, index) => (
                <TableHead key={index} className="text-center min-w-[90px]">
                  <Badge 
                    variant={
                      role.role === 'owner' 
                        ? 'default' 
                        : role.role === 'admin' 
                          ? 'destructive' 
                          : 'outline'
                    }
                    className="font-normal whitespace-nowrap"
                  >
                    {role.displayName}
                  </Badge>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div>{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </TableCell>
                
                {sortedActiveRoles.map((role, roleIndex) => {
                  const originalRoleIndex = permissions.findIndex(p => p.role === role.role);
                  const isOwnerRole = role.role === 'owner';
                  const isManagePermissions = type === 'actions' && item.id === 'manage_permissions';
                  const isDisabled = isOwnerRole || (isManagePermissions && role.role !== 'owner');
                  const isChecked = type === 'pages' 
                    ? role.pages[item.id] 
                    : role.actions[item.id];
                  
                  return (
                    <TableCell key={roleIndex} className="text-center">
                      {isOwnerRole ? (
                        <Switch 
                          checked={true} 
                          disabled 
                          className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" 
                        />
                      ) : (
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            onChange(
                              originalRoleIndex,
                              type,
                              item.id,
                              !!checked
                            );
                          }}
                          disabled={isDisabled}
                          className={isChecked ? "data-[state=checked]:bg-primary" : ""}
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserPermissionConfig;
