
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ShieldCheck, RefreshCw, Shield } from 'lucide-react';
import {
  useRolePermissions,
  availablePages,
  availableActions,
} from './useRolePermissions';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UserPermissionConfig: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'pages' | 'actions'>('pages');
  const {
    permissions,
    loading,
    saving,
    error,
    isOwner,
    handlePermissionChange,
    handleSavePermissions,
    reloadPermissions,
  } = useRolePermissions();

  // Log owner status when it changes
  useEffect(() => {
    console.log('UserPermissionConfig owner status:', isOwner ? '✅ Yes' : '❌ No');
  }, [isOwner]);

  const onSave = async () => {
    try {
      await handleSavePermissions();
    } catch (error) {
      console.error('Error saving permissions:', error);
      // Error is handled inside handleSavePermissions
    }
  };

  const onRetry = () => {
    reloadPermissions();
    toast.info('Recargando configuración de permisos...');
  };

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
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Configuración de Permisos por Rol</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              title="Recargar permisos"
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Recargar</span>
            </Button>
            
            {isOwner && (
              <Alert variant="default" className="max-w-fit p-1 px-3 bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 text-sm">Modo Propietario: acceso total</AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 border-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription className="text-sm flex-1">
                {error}
              </AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto border-rose-300 hover:bg-rose-50"
                onClick={onRetry}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reintentar
              </Button>
            </div>
          </Alert>
        )}
        
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
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {rolePermission.role === 'owner' && (
                        <Shield className="h-4 w-4 text-amber-500" />
                      )}
                      {rolePermission.displayName}
                    </div>
                  </TableCell>
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
                            className={rolePermission.role === 'owner' ? "opacity-60" : ""}
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
                            className={rolePermission.role === 'owner' ? "opacity-60" : ""}
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
            onClick={onSave} 
            disabled={saving || !!error}
            className={isOwner ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Guardando...' : isOwner ? 'Guardar con Privilegios de Propietario' : 'Guardar Configuración'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissionConfig;
