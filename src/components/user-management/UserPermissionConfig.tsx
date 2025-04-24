
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Badge } from '@/components/ui/badge';

const UserPermissionConfig = () => {
  const {
    permissions,
    loading,
    saving,
    error,
    isOwner,
    handlePermissionChange,
    savePermissions,
    availablePages,
    availableActions,
  } = useRolePermissions();
  
  const [activeTab, setActiveTab] = useState('pages');
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isOwner) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <p className="text-amber-800">Solo el propietario puede configurar permisos del sistema.</p>
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
          onClick={savePermissions} 
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
