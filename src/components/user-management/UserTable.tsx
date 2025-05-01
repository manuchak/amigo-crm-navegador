
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
  User,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getRoleDisplayName } from '@/hooks/useRolePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserTableProps {
  users: UserData[];
  onEditClick: (user: UserData) => void;
  onVerifyUser: (user: UserData) => Promise<void>;
  canEditUser: (user: UserData) => boolean;
  formatDate: (date: Date | null | undefined) => string;
  currentUser?: UserData | null;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditClick,
  onVerifyUser,
  canEditUser,
  formatDate,
  currentUser
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <h3 className="font-medium text-lg">No hay usuarios registrados</h3>
          <p className="text-muted-foreground mb-4">
            No se encontraron usuarios en el sistema o podría haber un problema con los permisos.
          </p>
          
          {currentUser && (
            <Alert className="max-w-md">
              <AlertDescription>
                <p>Estás conectado como: <strong>{currentUser.email}</strong></p>
                <p>Rol: <strong>{getRoleDisplayName(currentUser.role)}</strong></p>
                <p>Si no estás viendo los usuarios esperados, podrías no tener los permisos necesarios.</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
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
      {currentUser && currentUser.uid && users.every(user => user.uid !== currentUser.uid) && (
        <Alert className="mb-4">
          <AlertDescription>
            <p className="text-sm">
              <strong>Nota:</strong> Tu usuario actual <strong>({currentUser.email})</strong> no aparece en esta lista.
              Esto podría deberse a un problema de permisos o configuración.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
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
            <TableRow key={user.uid} className={`hover:bg-muted/50 ${currentUser && user.uid === currentUser.uid ? 'bg-blue-50' : ''}`}>
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
                  {currentUser && user.uid === currentUser.uid && (
                    <Badge variant="outline" className="ml-1">Tú</Badge>
                  )}
                  {user.role === 'owner' && (
                    <Shield className="h-4 w-4 text-amber-500" aria-label="Propietario del sistema" />
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
