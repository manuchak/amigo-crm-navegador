
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { 
  useRolePermissions, 
  availablePages, 
  availableActions 
} from './useRolePermissions';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

// Usar el nuevo hook para la lógica de permisos
const UserPermissionConfig: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'pages' | 'actions'>('pages');
  const {
    permissions,
    loading,
    saving,
    handlePermissionChange,
    handleSavePermissions,
  } = useRolePermissions();

  if (loading) {
    return (
      <Card className="shadow-md mt-8">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando configuración de permisos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Configuración de Permisos por Rol</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-2">
          <Button 
            variant={selectedTab === 'pages' ? 'default' : 'outline'} 
            onClick={() => setSelectedTab('pages')}
          >
            Acceso a Páginas
          </Button>
          <Button 
            variant={selectedTab === 'actions' ? 'default' : 'outline'} 
            onClick={() => setSelectedTab('actions')}
          >
            Acciones Permitidas
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Rol</TableHead>
                {selectedTab === 'pages' ? (
                  availablePages.map(page => (
                    <TableHead key={page.id} className="text-center" title={page.description}>
                      {page.name}
                    </TableHead>
                  ))
                ) : (
                  availableActions.map(action => (
                    <TableHead key={action.id} className="text-center" title={action.description}>
                      {action.name}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((rolePermission, roleIndex) => (
                <TableRow key={rolePermission.role}>
                  <TableCell className="font-medium">{rolePermission.displayName}</TableCell>
                  {selectedTab === 'pages' ? (
                    availablePages.map(page => (
                      <TableCell key={page.id} className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            id={`${rolePermission.role}-${page.id}`}
                            checked={rolePermission.pages[page.id]}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(roleIndex, 'pages', page.id, checked as boolean)
                            }
                            disabled={rolePermission.role === 'owner'}
                          />
                        </div>
                      </TableCell>
                    ))
                  ) : (
                    availableActions.map(action => (
                      <TableCell key={action.id} className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            id={`${rolePermission.role}-${action.id}`}
                            checked={rolePermission.actions[action.id]}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(roleIndex, 'actions', action.id, checked as boolean)
                            }
                            disabled={rolePermission.role === 'owner'}
                          />
                        </div>
                      </TableCell>
                    ))
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSavePermissions} 
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissionConfig;
