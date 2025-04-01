
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
import UserAvatar from './UserAvatar';
import RoleBadge from './RoleBadge';
import EmailVerificationStatus from './EmailVerificationStatus';

interface UserTableProps {
  users: UserData[];
  onEditClick: (user: UserData) => void;
  onVerifyUser: (user: UserData) => Promise<void>;
  canEditUser: (user: UserData) => boolean;
  formatDate: (date: Date) => string;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditClick,
  onVerifyUser,
  canEditUser,
  formatDate
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Verificado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Último Acceso</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
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
              <TableCell>{formatDate(user.lastLogin)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!user.emailVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerifyUser(user)}
                      disabled={!canEditUser(user)}
                    >
                      Verificar Email
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick(user)}
                    disabled={!canEditUser(user)}
                  >
                    Editar Rol
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
