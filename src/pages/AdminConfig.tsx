
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import UserManagementPanel from '@/components/admin/UserManagementPanel';
import UserPermissionConfig from '@/components/user-management/UserPermissionConfig';
import { Settings, Users, Lock, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setSpecificUserAsVerifiedOwner, setManuelAsOwner } from '@/utils/setVerifiedOwner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define AdminConfig as a regular function component instead of an arrow function
function AdminConfig() {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("users");
  const [ownerStatus, setOwnerStatus] = useState<boolean>(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [isRunningEdgeFunction, setIsRunningEdgeFunction] = useState<boolean>(false);
  
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
      
      // Get current user from Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setOwnerError("No authenticated user found");
        console.error("No authenticated user found");
        return false;
      }
      
      console.log("Current user:", authData.user.email);
      
      // Check user role from Supabase
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
        user_uid: authData.user.id
      });
      
      if (roleError) {
        setOwnerError(`Error getting user role: ${roleError.message}`);
        console.error("Error getting user role:", roleError);
        return false;
      }
      
      // Update owner status based on role check
      const isOwner = roleData === 'owner';
      setOwnerStatus(isOwner);
      setLastChecked(new Date());
      
      if (isOwner) {
        console.log("✅ Current user verified as owner");
        toast.success("Has sido verificado como propietario del sistema");
        return true;
      } else {
        console.log("❌ Current user is not owner, role:", roleData);
        
        // If email matches Manuel, try to set as owner
        if (authData.user.email?.toLowerCase() === 'manuel.chacon@detectasecurity.io') {
          console.log("Attempting to set Manuel as owner...");
          const success = await setSpecificUserAsVerifiedOwner(authData.user.email, false);
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
  
  // Only show admin features if user has correct role
  const isAdmin = userData?.role === 'admin' || userData?.role === 'owner' || ownerStatus;

  if (!isAdmin) {
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Permisos</CardTitle>
                <CardDescription>
                  Configura los permisos para cada rol del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserPermissionConfig />
              </CardContent>
            </Card>
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
