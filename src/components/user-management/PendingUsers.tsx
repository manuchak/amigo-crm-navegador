
import React from 'react';
import { UserData, UserRole } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, User, Shield } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getRoleDisplayName } from '@/hooks/useRolePermissions';

interface PendingUsersProps {
  users: UserData[];
  onAssignRole: (user: UserData, role: UserRole) => Promise<void>;
  onVerifyUser: (user: UserData) => Promise<void>;
  formatDate: (date: Date | string | null | undefined) => string;
}

const PendingUsers: React.FC<PendingUsersProps> = ({
  users,
  onAssignRole,
  onVerifyUser,
  formatDate
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay solicitudes de usuarios pendientes</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {users.map(user => (
        <Card key={user.uid} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
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
                <CardTitle className="text-lg font-medium">{user.displayName || user.email}</CardTitle>
              </div>
              <Badge variant={user.role === 'unverified' ? 'outline' : 'warning'}>
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de registro</p>
                <p>{formatDate(user.createdAt)}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-muted-foreground">Acciones</h4>
                
                <div className="flex flex-wrap gap-2">
                  {!user.emailVerified && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onVerifyUser(user)}
                      className="flex items-center gap-1"
                    >
                      <UserCheck className="h-4 w-4" /> 
                      Verificar Email
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    onClick={() => onAssignRole(user, 'atención_afiliado')}
                  >
                    Atención al Afiliado
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    onClick={() => onAssignRole(user, 'supply')}
                  >
                    Supply
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                    onClick={() => onAssignRole(user, 'supply_admin')}
                  >
                    Supply Admin
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    onClick={() => onAssignRole(user, 'afiliados')}
                  >
                    Afiliados
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="flex items-center gap-1"
                    onClick={() => onAssignRole(user, 'admin')}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600"
                    onClick={() => onAssignRole(user, 'unverified')}
                  >
                    <UserX className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingUsers;
