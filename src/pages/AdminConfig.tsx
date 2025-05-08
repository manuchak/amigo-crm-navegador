
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth';
import UserManagementPanel from '@/components/admin/UserManagementPanel';
import UserPermissionConfig from '@/components/user-management/UserPermissionConfig';
import { Settings, Users, Lock, RefreshCw, AlertTriangle, Database, ShieldCheck } from 'lucide-react';
import { supabase, checkForOwnerRole } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setSpecificUserAsVerifiedOwner, setManuelAsOwner } from '@/utils/setVerifiedOwner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isUserAdminOrOwner } from '@/components/user-management/rolePermissions.utils';

// Define AdminConfig as a regular function component instead of an arrow function
function AdminConfig() {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("users");
  const [ownerStatus, setOwnerStatus] = useState<boolean>(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [isRunningEdgeFunction, setIsRunningEdgeFunction] = useState<boolean>(false);
  const [directDbSuccess, setDirectDbSuccess] = useState<boolean>(false);
  const [localAdminStatus, setLocalAdminStatus] = useState<boolean>(false);
  
  // Check local storage for admin/owner status
  useEffect(() => {
    const isLocalAdmin = isUserAdminOrOwner();
    setLocalAdminStatus(isLocalAdmin);
    
    if (isLocalAdmin) {
      console.log("User identified as admin or owner from local storage");
    }
  }, [userData]);
  
  // Check and verify owner status function
  const checkOwnerStatus = useCallback(async () => {
    try {
      setIsCheckingOwner(true);
      setOwnerError(null);
      
      // First check if current user is already an owner
      if (userData?.role === 'owner') {
        console.log("User is already verified as owner");
        setOwnerStatus(true);
        setLastChecked(new Date());
        return true;
      }
      
      // Check with Supabase DB using our helper function
      const supabaseOwnerStatus = await checkForOwnerRole();
      setOwnerStatus(supabaseOwnerStatus);
      setLastChecked(new Date());
      
      if (supabaseOwnerStatus) {
        console.log("✅ Current user verified as owner");
        toast.success("Has sido verificado como propietario del sistema");
        return true;
      } else {
        console.log("❌ Current user is not owner");
        
        // If email matches Manuel, try to set as owner
        if (userData?.email?.toLowerCase() === 'manuel.chacon@detectasecurity.io') {
          console.log("Attempting to set Manuel as owner...");
          const success = await setSpecificUserAsVerifiedOwner(userData.email, false);
          if (success) {
            console.log("Manuel has been set as owner");
            toast.success("Tu cuenta ha sido establecida como propietario del sistema");
            await refreshUserData();
            setOwnerStatus(true);
            return true;
          } else {
            setOwnerError("Failed to set Manuel as owner automatically");
            console.error("Failed to set Manuel as owner");
            return false;
          }
        }
        return false;
      }
    } catch (error: any) {
      setOwnerError(`Error checking owner status: ${error.message}`);
      console.error("Error checking owner status:", error);
      return false;
    } finally {
      setIsCheckingOwner(false);
    }
  }, [userData, refreshUserData]);

  const setOwnerRoleViaEdgeFunction = async () => {
    setIsRunningEdgeFunction(true);
    setOwnerError(null);
    
    try {
      // Call our edge function to directly set the owner role
      const { data, error } = await supabase.functions.invoke('set-owner', {
        method: 'POST',
      });
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error from edge function');
      }
      
      toast.success("Tu rol ha sido establecido como propietario correctamente");
      console.log("Owner role set successfully via edge function", data);
      setDirectDbSuccess(true);
      
      // Refresh user data to show the new role
      await refreshUserData();
      setOwnerStatus(true);
    } catch (error: any) {
      console.error("Failed to set owner role via edge function:", error);
      setOwnerError(`Error asignando rol de propietario: ${error.message}`);
      toast.error("No se pudo asignar el rol de propietario");
    } finally {
      setIsRunningEdgeFunction(false);
    }
  };

  const setOwnerRoleViaDirectUpsert = async () => {
    setIsRunningEdgeFunction(true);
    setOwnerError(null);
    
    try {
      // Call our edge function but with a special flag to use direct database operations
      const { data, error } = await supabase.functions.invoke('set-owner', {
        method: 'POST',
        body: { useDirectDbOperation: true }
      });
      
      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error from edge function');
      }
      
      toast.success("Tu rol ha sido establecido como propietario mediante operación directa en DB");
      console.log("Owner role set successfully via direct database operation", data);
      setDirectDbSuccess(true);
      
      // Refresh user data to show the new role
      await refreshUserData();
      setOwnerStatus(true);
    } catch (error: any) {
      console.error("Failed to set owner role via direct database operation:", error);
      setOwnerError(`Error asignando rol de propietario: ${error.message}`);
      toast.error("No se pudo asignar el rol de propietario mediante operación directa");
    } finally {
      setIsRunningEdgeFunction(false);
    }
  };

  // Initial owner status check
  useEffect(() => {
    const checkInitialOwnerStatus = async () => {
      await checkOwnerStatus();
    };

    if (!lastChecked) {
      checkInitialOwnerStatus();
    }
  }, [lastChecked, checkOwnerStatus]);
  
  // Force refresh when userData changes
  useEffect(() => {
    if (userData && !lastChecked) {
      checkOwnerStatus();
    }
  }, [userData, lastChecked, checkOwnerStatus]);
  
  const handleForceOwnerCheck = async () => {
    setIsCheckingOwner(true);
    try {
      const success = await setManuelAsOwner();
      if (success) {
        await refreshUserData();
        toast.success("Permisos de propietario actualizados correctamente");
        setOwnerStatus(true);
      } else {
        toast.error("No se pudo establecer el permiso de propietario");
      }
    } catch (error: any) {
      setOwnerError(`Error setting owner: ${error.message}`);
      console.error("Error setting owner:", error);
      toast.error("Error al actualizar permisos de propietario");
    } finally {
      setIsCheckingOwner(false);
    }
  };
  
  // Use both database check and local storage check for admin status
  const effectiveAdminStatus = userData?.role === 'admin' || 
                             userData?.role === 'owner' || 
                             ownerStatus || 
                             localAdminStatus;

  if (!effectiveAdminStatus) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a la configuración de administrador.
              Tu rol actual es: {userData?.role || "no definido"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ownerError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de verificación</AlertTitle>
                <AlertDescription>{ownerError}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-muted-foreground">
              Si crees que deberías tener acceso, por favor contacta al administrador del sistema.
            </p>
            {userData?.email?.toLowerCase() === 'manuel.chacon@detectasecurity.io' && (
              <div className="space-y-4">
                <Button 
                  onClick={handleForceOwnerCheck} 
                  variant="outline"
                  disabled={isCheckingOwner}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingOwner ? 'animate-spin' : ''}`} />
                  Verificar permisos de propietario
                </Button>
                
                <Button
                  onClick={setOwnerRoleViaEdgeFunction}
                  variant="default"
                  disabled={isRunningEdgeFunction}
                  className="ml-0 mt-2 w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRunningEdgeFunction ? 'animate-spin' : ''}`} />
                  Asignar rol de propietario directamente
                </Button>
                
                <Button
                  onClick={setOwnerRoleViaDirectUpsert}
                  variant="default"
                  disabled={isRunningEdgeFunction || directDbSuccess}
                  className="ml-0 mt-2 w-full bg-amber-600 hover:bg-amber-700"
                >
                  <Database className={`h-4 w-4 mr-2 ${isRunningEdgeFunction ? 'animate-spin' : ''}`} />
                  Forzar cambio de rol en base de datos
                </Button>
              </div>
            )}
            
            {userData && (
              <div className="mt-4 p-3 bg-muted rounded text-xs">
                <p className="font-semibold mb-1">Información del usuario:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email: {userData.email}</li>
                  <li>Rol: {userData.role}</li>
                  <li>ID: {userData.uid}</li>
                  <li>Verificado por email: {userData.emailVerified ? 'Sí' : 'No'}</li>
                  <li>Admin/Owner en localStorage: {localAdminStatus ? 'Sí' : 'No'}</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Administrador</h1>
          <p className="text-muted-foreground">
            Configura usuarios, permisos y funcionalidades avanzadas del sistema.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border rounded-lg p-1">
            <TabsTrigger value="users" className="rounded-md text-sm">
              <Users className="h-4 w-4 mr-2" />
              <span>Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="rounded-md text-sm">
              <Lock className="h-4 w-4 mr-2" />
              <span>Permisos</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md text-sm">
              <Settings className="h-4 w-4 mr-2" />
              <span>Sistema</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <UserManagementPanel />
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-4">
            <UserPermissionConfig />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Configuración avanzada del sistema y opciones de seguridad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidad en desarrollo
                </p>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Información del Sistema</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">ID del Proyecto:</span>
                    <span>beefjsdgrdeiymzxwxru</span>
                    <span className="text-muted-foreground">Versión:</span>
                    <span>1.0.0</span>
                    <span className="text-muted-foreground">Entorno:</span>
                    <span>Producción</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminConfig;
