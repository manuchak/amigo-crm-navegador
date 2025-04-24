
import React from 'react';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserManagementHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ loading, onRefresh }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administra los usuarios del sistema y sus niveles de permiso
            </CardDescription>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </Button>
      </div>
    </CardHeader>
  );
};

export default UserManagementHeader;
