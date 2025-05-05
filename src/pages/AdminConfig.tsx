
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import UserManagementPanel from '@/components/admin/UserManagementPanel';
import UserPermissionConfig from '@/components/user-management/UserPermissionConfig';
import { Settings, Users, Lock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setSpecificUserAsVerifiedOwner, setManuelAsOwner } from '@/utils/setVerifiedOwner';
import { Button } from '@/components/ui/button';

const AdminConfig = () => {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("users");
  const [ownerStatus, setOwnerStatus] = useState<boolean>(false);
  const [isCheckingOwner, setIsCheckingOwner] = useState<boolean>(false);
  
  // Check and verify owner status on component mount
  useEffect(() => {
    const checkOwnerStatus = async () => {
      try {
        setIsCheckingOwner(true);
        
        // First check if current user is already an owner
        if (userData?.role === 'owner') {
          console.log("User is already verified as owner");
          setOwnerStatus(true);
          return;
        }
        
        // Get current user from Supabase
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          console.error("No authenticated user found");
          return;
        }
        
        console.log("Current user:", authData.user.email);
        
        // Check user role from Supabase
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role', {
          user_uid: authData.user.id
        });
        
        if (roleError) {
          console.error("Error getting user role:", roleError);
          return;
        }
        
        // Update owner status based on role check
        const isOwner = roleData === 'owner';
        setOwnerStatus(isOwner);
        
        if (isOwner) {
          console.log("✅ Current user verified as owner");
          toast.success("Has sido verificado como propietario del sistema");
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
            } else {
              console.error("Failed to set Manuel as owner");
            }
          }
        }
        
        // Force refresh user data to reflect any role changes
        await refreshUserData();
      } catch (error) {
        console.error("Error checking owner status:", error);
      } finally {
        setIsCheckingOwner(false);
      }
    };

    checkOwnerStatus();
  }, [userData, refreshUserData]);
  
  const handleForceOwnerCheck = async () => {
    setIsCheckingOwner(true);
    try {
      const success = await setManuelAsOwner();
      if (success) {
        await refreshUserData();
        toast.success("Permisos de propietario actualizados correctamente");
      } else {
        toast.error("No se pudo establecer el permiso de propietario");
      }
    } catch (error) {
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
            <p className="text-muted-foreground">
              Si crees que deberías tener acceso, por favor contacta al administrador del sistema.
            </p>
            {userData?.email?.toLowerCase() === 'manuel.chacon@detectasecurity.io' && (
              <Button 
                onClick={handleForceOwnerCheck} 
                variant="outline"
                disabled={isCheckingOwner}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar permisos de propietario
              </Button>
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
};

export default AdminConfig;
