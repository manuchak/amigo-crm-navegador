
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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
    availablePages,
    availableActions,
    reloadPermissions,
    checkOwnerStatus,
    setRetryCount
  } = useRolePermissions();
  
  const { currentUser, userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('pages');
  const [verifyingOwner, setVerifyingOwner] = useState(false);
  
  // Verificar status de propietario al cargar y cuando cambia el usuario
  useEffect(() => {
    const verifyOwnerStatus = async () => {
      try {
        // Verificar si el usuario actual ya es propietario
        const isCurrentOwner = await checkOwnerStatus();
        console.log("Resultado de verificación de propietario:", isCurrentOwner);
        
        if (!isCurrentOwner && userData?.email === 'manuel.chacon@detectasecurity.io') {
          console.log("Intentando establecer a Manuel Chacon como propietario...");
          
          // Intentar establecer al usuario como propietario
          try {
            const { data: authData } = await supabase.auth.getUser();
            if (authData.user) {
              const { error: rpcError } = await supabase.rpc('update_user_role', {
                target_user_id: authData.user.id,
                new_role: 'owner'
              });
              
              if (rpcError) {
                console.error('Error asignando rol de propietario:', rpcError);
              } else {
                console.log('Rol de propietario asignado correctamente');
                // Recargar permisos después de actualizar el rol
                setRetryCount(prev => prev + 1);
                await refreshUserData();
              }
            }
          } catch (err) {
            console.error('Error en proceso de asignación de propietario:', err);
          }
        }
      } catch (error) {
        console.error("Error verificando estado de propietario:", error);
      }
    };

    verifyOwnerStatus();
  }, [userData, checkOwnerStatus, refreshUserData, setRetryCount]);
  
  const handleForceRefresh = async () => {
    setVerifyingOwner(true);
    try {
      await refreshUserData();
      reloadPermissions();
      toast.success("Información de permisos actualizada");
    } catch (error) {
      console.error("Error al actualizar permisos:", error);
      toast.error("Error al actualizar información de permisos");
    } finally {
      setVerifyingOwner(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Si no es propietario, mostrar mensaje y botón para refrescar
  if (!isOwner) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6 space-y-4">
          <p className="text-amber-800">Solo el propietario puede configurar permisos del sistema.</p>
          <div className="text-sm text-amber-700">
            <p>Estado actual:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Usuario: {userData?.email || 'No identificado'}</li>
              <li>Rol actual: {userData?.role || 'No definido'}</li>
              <li>Estado propietario: {isOwner ? 'Sí' : 'No'}</li>
            </ul>
          </div>
          <Button 
            onClick={handleForceRefresh} 
            variant="outline" 
            className="mt-4 border-amber-300"
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
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="pages">Acceso a Páginas</TabsTrigger>
            <TabsTrigger value="actions">Acceso a Acciones</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button 
          onClick={handleSavePermissions || savePermissions} 
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
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="h-10 px-4 text-left font-medium">{title}</th>
              {activerPermissions.map((role, index) => (
                <th key={index} className="h-10 px-2 text-center font-medium">
                  <Badge 
                    variant={role.role === 'owner' ? 'default' : role.role === 'admin' ? 'destructive' : 'outline'}
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
                          disabled={isOwnerRole}
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
