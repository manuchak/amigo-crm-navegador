
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import UserManagementPanel from '@/components/admin/UserManagementPanel';
import UserPermissionConfig from '@/components/user-management/UserPermissionConfig';
import { Settings, Users, Lock } from 'lucide-react';
import { setSpecificUserAsVerifiedOwner } from '@/utils/setVerifiedOwner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminConfig = () => {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("users");
  const [ownerStatus, setOwnerStatus] = useState<boolean>(false);
  
  // Force check and set owner status on component mount
  useEffect(() => {
    const ensureOwnerIsSet = async () => {
      // Always try to set Manuel as owner on component mount
      const result = await setSpecificUserAsVerifiedOwner('manuel.chacon@detectasecurity.io');
      if (result) {
        console.log("Manuel Chacon has been set as owner successfully");
        
        // Force refresh user data to reflect the new role
        try {
          await refreshUserData();
          
          // Double-check if current user is the owner
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const { data: roleData } = await supabase.rpc('get_user_role', {
              user_uid: userData.user.id
            });
            
            setOwnerStatus(roleData === 'owner');
            
            if (roleData === 'owner') {
              toast.success("Has sido verificado como propietario del sistema");
              console.log("✅ Current user is owner");
            } else {
              console.warn("❌ Current user is not owner, role:", roleData);
            }
          }
        } catch (error) {
          console.error("Error refreshing user data after setting owner:", error);
        }
      } else {
        console.error("Failed to set Manuel Chacon as owner");
      }
    };

    ensureOwnerIsSet();
  }, [refreshUserData]);
  
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
          <CardContent>
            <p className="text-muted-foreground">
              Si crees que deberías tener acceso, por favor contacta al administrador del sistema.
            </p>
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
