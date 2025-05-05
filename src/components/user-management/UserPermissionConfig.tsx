
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRolePermissions } from './hooks/useRolePermissions';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { setManuelAsOwner } from '@/utils/setVerifiedOwner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { availablePages, availableActions } from './rolePermissions.constants';
import { isUserOwner, isUserAdminOrOwner } from './rolePermissions.utils';

const UserPermissionConfig = () => {
  const {
    permissions,
    loading,
    saving,
    error,
    isOwner,
    handlePermissionChange,
    savePermissions,
    handleSavePermissions,
    reloadPermissions,
    checkOwnerStatus,
    setRetryCount
  } = useRolePermissions();
  
  const { currentUser, userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('pages');
  const [verifyingOwner, setVerifyingOwner] = useState(false);
  const [ownerAssignmentStatus, setOwnerAssignmentStatus] = useState<'idle' | 'assigning' | 'success' | 'failed'>('idle');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [localOwnerStatus, setLocalOwnerStatus] = useState<boolean>(false);
  
  // Check local storage for owner status along with database check
  useEffect(() => {
    const localOwner = isUserOwner();
    setLocalOwnerStatus(localOwner);
    
    if (localOwner) {
      console.log("User identified as owner from local storage");
    }
  }, [userData]);
  
  // Verificar status de propietario al cargar y cuando cambia el usuario
  useEffect(() => {
    const verifyOwnerStatus = async () => {
      try {
        setVerifyingOwner(true);
        
        // Verificar si el usuario actual ya es propietario
        const isCurrentOwner = await checkOwnerStatus();
        console.log("Owner verification result:", isCurrentOwner ? "✅ Yes" : "❌ No");
        
        // Si no es propietario y el email coincide con Manuel, intentar asignar automáticamente
        if (!isCurrentOwner && userData?.email === 'manuel.chacon@detectasecurity.io') {
          console.log("Attempting to automatically set Manuel Chacon as owner...");
          setOwnerAssignmentStatus('assigning');
          
          const success = await setManuelAsOwner();
          if (success) {
            console.log("✅ Manuel Chacon successfully set as owner");
            setOwnerAssignmentStatus('success');
            toast.success("Has sido asignado como propietario del sistema");
            await refreshUserData();
            
            // Wait a moment before retrying permission load
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1500);
          } else {
            console.log("❌ Failed to set Manuel as owner automatically");
            setOwnerAssignmentStatus('failed');
            
            // Collect diagnostic information
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              
              // Get current role
              const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
                user_uid: sessionData?.session?.user?.id || ''
              });
              
              // Try to get user_roles data directly
              const { data: userRolesData, error: userRolesError } = await supabase
                .from('user_roles')
                .select('*')
                .eq('user_id', sessionData?.session?.user?.id || '');
              
              setDebugInfo({
                timestamp: new Date().toISOString(),
                session: sessionData?.session ? {
                  userId: sessionData.session.user.id,
                  email: sessionData.session.user.email,
                  aud: sessionData.session.user.aud,
                  role: sessionData.session.user.role
                } : null,
                role: {
                  fromRpc: roleData,
                  rpcError: roleError ? String(roleError) : null
                },
                userRoles: {
                  data: userRolesData,
                  error: userRolesError ? String(userRolesError) : null
                }
              });
            } catch (diagError) {
              console.error("Error collecting diagnostic info:", diagError);
              setDebugInfo({
                error: String(diagError),
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.error("Error verifying owner status:", error);
        setDebugInfo({
          error: String(error),
          timestamp: new Date().toISOString()
        });
        setOwnerAssignmentStatus('failed');
      } finally {
        setVerifyingOwner(false);
      }
    };

    verifyOwnerStatus();
  }, [userData, checkOwnerStatus, refreshUserData, setRetryCount]);
  
  const handleForceAssignOwner = async () => {
    setVerifyingOwner(true);
    setOwnerAssignmentStatus('assigning');
    setPermissionError(null);
    
    try {
      const success = await setManuelAsOwner();
      if (success) {
        toast.success("Has sido asignado como propietario del sistema");
        setOwnerAssignmentStatus('success');
        await refreshUserData();
        
        // Wait a bit before reloading permissions to ensure role is updated
        setTimeout(() => {
          reloadPermissions();
        }, 1000);
      } else {
        setOwnerAssignmentStatus('failed');
        setPermissionError("No se pudo asignar el rol de propietario");
        toast.error("No se pudo asignar el rol de propietario");
      }
    } catch (error) {
      console.error("Error assigning owner:", error);
      setOwnerAssignmentStatus('failed');
      setPermissionError(`Error al intentar asignar permisos de propietario: ${error}`);
      toast.error("Error al intentar asignar permisos de propietario");
    } finally {
      setVerifyingOwner(false);
    }
  };
  
  const handleForceRefresh = async () => {
    setVerifyingOwner(true);
    setPermissionError(null);
    
    try {
      await refreshUserData();
      reloadPermissions();
      toast.success("Información de permisos actualizada");
      
      // Re-check owner status after refresh
      const isOwnerNow = await checkOwnerStatus();
      if (isOwnerNow) {
        setOwnerAssignmentStatus('success');
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      setPermissionError(`Error al actualizar información de permisos: ${error}`);
      toast.error("Error al actualizar información de permisos");
    } finally {
      setVerifyingOwner(false);
    }
  };
  
  // Force user to be treated as owner if they have that role in local storage
  const effectiveOwnerStatus = isOwner || localOwnerStatus;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando configuración de permisos...</span>
      </div>
    );
  }
  
  // Si no es propietario, mostrar mensaje y botón para refrescar
  if (!effectiveOwnerStatus) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6 space-y-4">
          {permissionError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error de permisos</AlertTitle>
              <AlertDescription>{permissionError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="text-lg font-medium text-amber-800">Acceso Restringido</h3>
              <p className="text-sm text-amber-700">Solo el propietario puede configurar permisos del sistema.</p>
            </div>
          </div>
          
          <div className="text-sm text-amber-700 bg-white rounded-md p-4 border border-amber-200">
            <p className="font-medium mb-2">Estado actual:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Usuario: {userData?.email || 'No identificado'}</li>
              <li>Rol actual: {userData?.role || 'No definido'}</li>
              <li>Estado propietario DB: {isOwner ? 'Sí' : 'No'}</li>
              <li>Estado propietario Local: {localOwnerStatus ? 'Sí' : 'No'}</li>
              <li>Estado de asignación: {
                ownerAssignmentStatus === 'idle' ? 'No iniciado' :
                ownerAssignmentStatus === 'assigning' ? 'En proceso' :
                ownerAssignmentStatus === 'success' ? 'Exitoso' :
                ownerAssignmentStatus === 'failed' ? 'Fallido' : 'Desconocido'
              }</li>
            </ul>
          </div>
          
          {userData?.email === 'manuel.chacon@detectasecurity.io' && (
            <div className="mt-4 space-y-2">
              <Button 
                onClick={handleForceAssignOwner} 
                className="w-full"
                disabled={verifyingOwner || ownerAssignmentStatus === 'assigning'}
              >
                {verifyingOwner || ownerAssignmentStatus === 'assigning' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Asignando permisos...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Asignar permisos de propietario
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleForceRefresh} 
                variant="outline" 
                className="w-full border-amber-300"
                disabled={verifyingOwner}
              >
                {verifyingOwner ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar estado
                  </>
                )}
              </Button>
            </div>
          )}
          
          {debugInfo && (
            <div className="mt-4 p-3 bg-white rounded-md border border-amber-200 text-xs font-mono">
              <p className="font-semibold mb-1">Información de diagnóstico:</p>
              <pre className="overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de permisos</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center gap-2 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <ShieldCheck className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="font-medium text-blue-800">Gestión de Permisos</h3>
          <p className="text-sm text-blue-700">
            Aquí puedes configurar qué permisos tiene cada rol en el sistema. Puedes habilitar o deshabilitar 
            acceso a páginas y acciones específicas.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="pages">Acceso a Páginas</TabsTrigger>
            <TabsTrigger value="actions">Acceso a Acciones</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          onClick={handleSavePermissions} 
          disabled={saving || loading}
          className="ml-4"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
      
      <TabsContent value="pages" className="m-0">
        <PermissionsTable
          title="Permisos de Páginas"
          permissions={permissions}
          items={availablePages}
          type="pages"
          onChange={handlePermissionChange}
        />
      </TabsContent>
      
      <TabsContent value="actions" className="m-0">
        <PermissionsTable
          title="Permisos de Acciones"
          permissions={permissions}
          items={availableActions}
          type="actions"
          onChange={handlePermissionChange}
        />
      </TabsContent>
    </div>
  );
};

const PermissionsTable = ({
  title,
  permissions,
  items,
  type,
  onChange,
}: {
  title: string;
  permissions: any[];
  items: any[];
  type: 'pages' | 'actions';
  onChange: (roleIndex: number, type: 'pages' | 'actions', id: string, checked: boolean) => void;
}) => {
  // Filter out unverified and pending roles
  const activerPermissions = permissions.filter(
    p => !['unverified', 'pending'].includes(p.role)
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="h-12 px-4 text-left font-medium">{title}</th>
              {activerPermissions.map((role, index) => (
                <th key={index} className="h-12 px-2 text-center font-medium">
                  <Badge 
                    variant={
                      role.role === 'owner' 
                        ? 'default' 
                        : role.role === 'admin' 
                          ? 'destructive' 
                          : 'outline'
                    }
                    className="font-normal"
                  >
                    {role.displayName}
                  </Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="p-4 align-middle">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground text-xs">{item.description}</div>
                </td>
                
                {activerPermissions.map((role, roleIndex) => {
                  // Owner always has all permissions and can't be changed
                  const isOwnerRole = role.role === 'owner';
                  
                  // For manage_permissions action, only owner can have it
                  const isManagePermissions = type === 'actions' && item.id === 'manage_permissions';
                  const isDisabled = isOwnerRole || (isManagePermissions && role.role !== 'owner');
                  
                  return (
                    <td key={roleIndex} className="p-2 text-center align-middle">
                      {isOwnerRole ? (
                        <Switch 
                          checked={true} 
                          disabled 
                          className="data-[state=checked]:bg-amber-500" 
                        />
                      ) : (
                        <Checkbox
                          checked={type === 'pages' ? role.pages[item.id] : role.actions[item.id]}
                          onCheckedChange={(checked) => {
                            onChange(
                              permissions.findIndex(p => p.role === role.role),
                              type,
                              item.id,
                              !!checked
                            );
                          }}
                          disabled={isDisabled}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPermissionConfig;
