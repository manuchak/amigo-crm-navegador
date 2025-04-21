
import React from 'react';
import { UserData } from '@/types/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserAvatar from './UserAvatar';
import RoleBadge from './RoleBadge';
import EmailVerificationStatus from './EmailVerificationStatus';
import { formatDate } from './utils';

interface RegistrationRequestsTableProps {
  users: UserData[];
  onAssignRole: (user: UserData, role: string) => Promise<void>;
  onVerifyUser: (user: UserData) => Promise<void>;
}

const RegistrationRequestsTable: React.FC<RegistrationRequestsTableProps> = ({
  users,
  onAssignRole,
  onVerifyUser,
}) => {
  // Filter to show only unverified or pending users
  const pendingUsers = users.filter(user => 
    user.role === 'unverified' || user.role === 'pending'
  );

  if (pendingUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay solicitudes de registro pendientes</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-medium mb-4">Solicitudes de Registro Pendientes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Verificado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingUsers.map((user) => (
            <TableRow key={user.uid} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <UserAvatar photoURL={user.photoURL} displayName={user.displayName} />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <EmailVerificationStatus isVerified={user.emailVerified} />
              </TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!user.emailVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerifyUser(user)}
                    >
                      Verificar
                    </Button>
                  )}
                  <div className="flex gap-1">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onAssignRole(user, 'atención_afiliado')}
                    >
                      Atención Afiliado
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onAssignRole(user, 'supply')}
                    >
                      Supply
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RegistrationRequestsTable;
