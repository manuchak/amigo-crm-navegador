
import React from 'react';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Users, RefreshCw, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserManagementHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ loading, onRefresh }) => {
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-2">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administra los usuarios del sistema y sus niveles de permiso
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default UserManagementHeader;
