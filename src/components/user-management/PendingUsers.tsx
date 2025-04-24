
import React from 'react';
import { UserData, UserRole } from '@/types/auth';
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
import { UserCheck, Clock, AlertCircle, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getRoleDisplayName } from '@/hooks/useRolePermissions';

interface PendingUsersProps {
  users: UserData[];
  onAssignRole: (user: UserData, role: UserRole) => Promise<void>;
  onVerifyUser: (user: UserData) => Promise<void>;
  formatDate: (date: Date | null | undefined) => string;
}

const PendingUsers: React.FC<PendingUsersProps> = ({
  users,
  onAssignRole,
  onVerifyUser,
  formatDate
}) => {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No hay solicitudes pendientes</h3>
        <p className="mt-2 text-center text-muted-foreground">
          No hay usuarios pendientes de verificación o asignación de rol en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-medium">
          Usuarios pendientes de asignación: {users.length}
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
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
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'pending' ? "warning" : "outline"}>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getRoleDisplayName(user.role)}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!user.emailVerified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerifyUser(user)}
                        className="flex items-center gap-1"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Verificar</span>
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
    </div>
  );
};

// CheckCircle icon for the empty state
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
};

export default PendingUsers;
