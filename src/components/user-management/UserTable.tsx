
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
import { 
  UserCheck, 
  UserCog, 
  Shield, 
  CheckCircle2, 
  XCircle,
  User
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getRoleDisplayName } from '@/hooks/useRolePermissions';

interface UserTableProps {
  users: UserData[];
  onEditClick: (user: UserData) => void;
  onVerifyUser: (user: UserData) => Promise<void>;
  canEditUser: (user: UserData) => boolean;
  formatDate: (date: Date | null | undefined) => string;
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

  // Function to get badge color based on role
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'destructive';
      case 'supply_admin':
      case 'afiliados':
        return 'secondary';
      case 'supply':
      case 'atención_afiliado':
        return 'outline';
      case 'pending':
        return 'warning';
      case 'unverified':
      default:
        return 'outline';
    }
  };

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
            <TableRow key={user.uid} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.displayName} />
                    ) : (
                      <AvatarFallback className="bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{user.displayName}</span>
                  {user.role === 'owner' && (
                    <Shield className="h-4 w-4 text-amber-500" title="Propietario del sistema" />
                  )}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role) as any}>
                  {getRoleDisplayName(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                {user.emailVerified ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>Verificado</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span>No verificado</span>
                  </div>
                )}
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
                      className="flex items-center gap-1"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Verificar</span>
                    </Button>
                  )}
                  <Button
                    variant={canEditUser(user) ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => onEditClick(user)}
                    disabled={!canEditUser(user)}
                    className="flex items-center gap-1"
                  >
                    <UserCog className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only">Editar Rol</span>
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
