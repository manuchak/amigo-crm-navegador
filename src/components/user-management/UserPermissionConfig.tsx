import React, { useState, useEffect } from 'react';
import { useRolePermissions } from './hooks/useRolePermissions';
import { getDisplayName, isUserOwner } from './rolePermissions.utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { 
  ShieldCheck, Save, RefreshCw, Loader2, AlertTriangle, 
  Shield, Lock, CheckCircle2, Info, UserCog, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { checkForOwnerRole } from '@/integrations/supabase/client';
import { useUserVerification } from '@/hooks/user-management/useUserVerification';

const UserPermissionConfig = () => {
  const { userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');
  const [isVerifyingOwner, setIsVerifyingOwner] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState<string | null>(null);
  
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

  const { verifyEmail, setUserAsVerifiedOwner } = useUserVerification({
    setLoading: (id: string | null) => setLoadingVerify(id), 
    refreshUserData: async () => {
      await refreshUserData();
      await reloadPermissions();
    }
  });

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

  const handleVerifyUser = async (userId: string, email: string) => {
    setLoadingVerify(userId);
    try {
      const result = await verifyEmail(userId);
      if (result.success) {
        toast.success(`Usuario ${email} verificado correctamente`);
        reloadPermissions(); // Refresh the data to show updated verification status
      } else {
        toast.error(`Error al verificar el usuario: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Error al verificar usuario');
    } finally {
      setLoadingVerify(null);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Card className="border rounded-xl shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl flex items-center gap-2 font-medium">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            <span>Gestión de Permisos</span>
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
            Cargando configuración de permisos del sistema...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          
          <Button 
            onClick={handleForceRefresh} 
            variant="outline" 
            className="w-full mt-4"
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
      <Card className="border rounded-xl shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-xl flex items-center gap-2 font-medium text-amber-600">
            <Shield className="h-5 w-5 text-amber-600" />
            <span>Acceso Restringido</span>
          </CardTitle>
          <CardDescription className="text-sm text-amber-700">
            Solo el propietario del sistema puede configurar los permisos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-300 font-medium">Permisos insuficientes</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
              Para gestionar los permisos del sistema, necesitas tener el rol de Propietario.
              Si crees que deberías tener acceso, contacta al administrador del sistema.
            </AlertDescription>
          </Alert>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
            <h3 className="font-medium text-sm mb-2 text-slate-700 dark:text-slate-300">Información de usuario:</h3>
            <div className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
              <p><span className="font-medium">Usuario:</span> {userData?.email || 'No autenticado'}</p>
              <p><span className="font-medium">Rol actual:</span> {userData?.role || 'No definido'}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleForceRefresh} 
            variant="outline" 
            className="w-full mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Verificar permisos
          </Button>
          
          <div className="text-xs text-muted-foreground mt-4">
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)} 
              className="text-xs text-muted-foreground hover:text-blue-500 underline"
            >
              {showDebugInfo ? 'Ocultar información de depuración' : 'Mostrar información de depuración'}
            </button>
            
            {showDebugInfo && (
              <div className="mt-2 p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50 overflow-auto text-xs">
                <p className="font-semibold mb-1">Variables de estado:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>isOwner (DB): {isOwner ? 'true' : 'false'}</li>
                  <li>isUserOwner (localStorage): {isUserOwner() ? 'true' : 'false'}</li>
                  <li>effectiveOwnerStatus: {effectiveOwnerStatus ? 'true' : 'false'}</li>
                </ul>
                
                {userData && (
                  <>
                    <p className="mt-2 font-semibold">Datos de usuario:</p>
                    <pre className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto">
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
    <Card className="border rounded-xl shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-xl flex items-center gap-2 font-medium">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <span>Gestión de Permisos</span>
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
          Configura los permisos para cada rol del sistema.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        {error && (
          <Alert variant="destructive" className="mb-4 rounded-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="rounded-lg border border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900/30 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300">Información sobre permisos</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Configura qué permisos tiene cada rol en el sistema. El rol de Propietario siempre tiene todos los permisos habilitados.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 w-full mb-4">
          <Button 
            onClick={reloadPermissions} 
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar
          </Button>
          
          <Button 
            onClick={handleSavePermissions}
            disabled={saving}
            size="sm"
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-6 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger 
              value="roles" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md flex items-center gap-1.5"
            >
              <UserCog className="h-3.5 w-3.5" />
              <span>Usuarios y Roles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pages" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Acceso a Páginas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="actions" 
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 rounded-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Acceso a Acciones</span>
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="roles" className="m-0 w-full">
            <UserRolesTable 
              users={users} 
              onVerifyUser={handleVerifyUser}
              loadingVerify={loadingVerify}
            />
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
      </CardContent>
    </Card>
  );
};

interface UserRolesTableProps {
  users: any[];
  onVerifyUser: (userId: string, email: string) => Promise<void>;
  loadingVerify: string | null;
}

const UserRolesTable: React.FC<UserRolesTableProps> = ({ users, onVerifyUser, loadingVerify }) => {
  console.log("Users in UserRolesTable:", users);
  
  if (!users || users.length === 0) {
    return (
      <Alert className="mb-6 rounded-lg">
        <Info className="h-4 w-4" />
        <AlertTitle>No hay usuarios registrados</AlertTitle>
        <AlertDescription>
          No se encontraron usuarios en el sistema. Cuando los usuarios se registren, aparecerán aquí.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden mb-6 bg-white dark:bg-slate-800/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800">
              <TableHead className="font-medium">Usuario</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium text-center">Rol Actual</TableHead>
              <TableHead className="font-medium text-center">Verificado</TableHead>
              <TableHead className="font-medium text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/70">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-medium">
                      {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span>{user.displayName || 'Sin nombre'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">{user.email}</TableCell>
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
                    {getDisplayName(user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {user.emailVerified ? (
                    <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Check className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      No verificado
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {!user.emailVerified && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onVerifyUser(user.uid, user.email)}
                      disabled={loadingVerify === user.uid}
                      className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 text-xs rounded-full px-3 py-1 h-7"
                    >
                      {loadingVerify === user.uid ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verificar
                        </>
                      )}
                    </Button>
                  )}
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
      <Alert className="rounded-lg">
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
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800">
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
              <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/70">
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
                          className={isChecked ? "data-[state=checked]:bg-blue-500" : ""}
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
