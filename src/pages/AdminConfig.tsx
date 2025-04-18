
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { UserManagementPanel } from '@/components/admin/user-management';
import { VapiConfigPanel } from '@/components/call-center/vapi-config';
import { VapiWebhookDebugger } from '@/components/call-center/webhook-debugger';
import { Settings, Users, Phone, Webhook } from 'lucide-react';

const AdminConfig = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("users");
  
  // Only show admin features if user has correct role
  const isAdmin = userData?.role === 'admin' || userData?.role === 'owner';

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a la configuración de administrador.
            </CardDescription>
          </CardHeader>
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
            <TabsTrigger value="vapi" className="rounded-md text-sm">
              <Phone className="h-4 w-4 mr-2" />
              <span>VAPI Config</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="rounded-md text-sm">
              <Webhook className="h-4 w-4 mr-2" />
              <span>Webhooks</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md text-sm">
              <Settings className="h-4 w-4 mr-2" />
              <span>Sistema</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <UserManagementPanel />
          </TabsContent>
          
          <TabsContent value="vapi" className="space-y-4">
            <VapiConfigPanel />
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-4">
            <VapiWebhookDebugger />
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
