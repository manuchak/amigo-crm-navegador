
import React from 'react';
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

const UserManagementHeader: React.FC = () => {
  return (
    <CardHeader>
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <CardTitle className="text-2xl">Gestión de Usuarios</CardTitle>
          <CardDescription>
            Administra los usuarios del sistema y sus niveles de permiso
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
};

export default UserManagementHeader;
