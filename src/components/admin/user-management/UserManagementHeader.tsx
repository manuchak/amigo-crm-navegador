
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface UserManagementHeaderProps {
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({ loading, onRefresh }) => {
  return (
    <CardHeader className="border-b bg-muted/40">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>Administra los usuarios y sus permisos</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Recargar
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default UserManagementHeader;
