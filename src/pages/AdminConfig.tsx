
import React, { useState } from 'react';
import { Shield, Users, Webhook, Activity, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LEADS_WEBHOOK_URL, LEADS_WEBHOOK_NAME, LEADS_WEBHOOK_API_KEY } from '@/components/call-center/utils/webhook';

const AdminConfig = () => {
  const [activeTab, setActiveTab] = useState('webhooks');
  
  // Sample admin users data
  const adminUsers = [
    { id: 1, name: 'Admin Principal', email: 'admin@custodioscrm.com', role: 'Super Admin', lastLogin: '2025-03-31' },
    { id: 2, name: 'Gerente Comercial', email: 'comercial@custodioscrm.com', role: 'Manager', lastLogin: '2025-03-30' },
    { id: 3, name: 'Supervisor Ventas', email: 'supervisor@custodioscrm.com', role: 'Editor', lastLogin: '2025-03-29' },
  ];
  
  // Sample webhooks data with the actual webhook we have
  const webhooks = [
    { 
      id: 1, 
      name: LEADS_WEBHOOK_NAME, 
      url: LEADS_WEBHOOK_URL, 
      apiKey: LEADS_WEBHOOK_API_KEY,
      status: 'Activo', 
      lastSync: '2025-03-31 18:46:53', 
      dataType: 'Leads'
    },
    { 
      id: 2, 
      name: 'CustodiosCRM Data Processing', 
      url: 'https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl', 
      apiKey: null,
      status: 'Activo', 
      lastSync: '2025-03-31 18:47:37', 
      dataType: 'Procesamiento'
    },
  ];
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, you would show a toast notification here
  };
  
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8 animate-fade-up">
            <div className="bg-gradient-to-br from-primary to-accent rounded-full p-2.5 flex items-center justify-center">
              <Shield size={28} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Configuración del Sistema
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-3xl mb-8 animate-fade-up animate-delay-100">
            Gestione los webhooks, usuarios administradores y configuraciones generales del sistema.
          </p>
          
          <Tabs defaultValue="webhooks" className="animate-fade-up animate-delay-200" onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="webhooks" className="flex items-center gap-2">
                <Webhook className="w-4 h-4" />
                <span>Webhooks</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Administradores</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Estado del Sistema</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="webhooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5 text-primary" />
                    Webhooks Conectados
                  </CardTitle>
                  <CardDescription>
                    Administre las integraciones y webhooks conectados al sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>API Key</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Último Sincronización</TableHead>
                        <TableHead>Tipo de Datos</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell className="font-medium">{webhook.name}</TableCell>
                          <TableCell className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[180px]">{webhook.url}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard(webhook.url)}
                                className="h-6 w-6 p-0"
                              >
                                <ClipboardCheck className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {webhook.apiKey ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs truncate max-w-[120px]">{webhook.apiKey}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => copyToClipboard(webhook.apiKey || '')}
                                  className="h-6 w-6 p-0"
                                >
                                  <ClipboardCheck className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No requerida</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={webhook.status === 'Activo' ? 'default' : 'destructive'}>
                              {webhook.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{webhook.lastSync}</TableCell>
                          <TableCell>{webhook.dataType}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">Verificar</Button>
                              <Button variant="outline" size="sm">Reconfigurar</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Administradores del Sistema
                  </CardTitle>
                  <CardDescription>
                    Gestione los usuarios con acceso administrativo al sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Último Acceso</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={
                              user.role === 'Super Admin' 
                                ? 'default' 
                                : user.role === 'Manager' 
                                  ? 'outline' 
                                  : 'secondary'
                            }>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.lastLogin}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">Editar</Button>
                              <Button variant="outline" size="sm">Resetear Clave</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-6">
                    <Button>
                      <Users className="mr-2 h-4 w-4" />
                      Agregar Nuevo Administrador
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Estado del Sistema
                  </CardTitle>
                  <CardDescription>
                    Monitoreo y configuración general del sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Rendimiento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Velocidad de respuesta</span>
                              <span className="font-medium">Excelente</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[90%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Disponibilidad</span>
                              <span className="font-medium">99.9%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[99%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Sincronización de datos</span>
                              <span className="font-medium">Actualizado</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[95%]" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Configuración General</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Notificaciones por email</span>
                            <Button variant="outline" size="sm">Configurar</Button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Copias de seguridad</span>
                            <Button variant="outline" size="sm">Programar</Button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Reiniciar conexiones</span>
                            <Button variant="outline" size="sm">Ejecutar</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="py-6 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} CustodiosCRM by Detecta. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default AdminConfig;
