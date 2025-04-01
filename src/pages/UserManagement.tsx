
import React, { useState, useEffect } from 'react';
import { useAuth, UserData, UserRole } from '@/context/AuthContext';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Search, UserCheck, Clock, ShieldAlert, 
  CheckCircle, Shield, ShieldQuestion 
} from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';

const UserManagement = () => {
  const { getAllUsers, updateUserRole } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');

  // Role definitions with display names and colors
  const roles: {[key in UserRole]: {name: string, color: string}} = {
    'unverified': { name: 'No verificado', color: 'bg-gray-500' },
    'pending': { name: 'Pendiente', color: 'bg-yellow-500' },
    'atención_afiliado': { name: 'Atención al Afiliado', color: 'bg-blue-500' },
    'supply': { name: 'Supply', color: 'bg-green-500' },
    'supply_admin': { name: 'Supply Admin', color: 'bg-indigo-500' },
    'afiliados': { name: 'Afiliados', color: 'bg-purple-500' },
    'admin': { name: 'Admin', color: 'bg-red-500' },
    'owner': { name: 'Owner', color: 'bg-black' }
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
      setLoading(false);
    };
    
    fetchUsers();
  }, [getAllUsers]);

  // Handle role change
  const handleRoleChange = async () => {
    if (selectedUser && selectedRole) {
      await updateUserRole(selectedUser.uid, selectedRole as UserRole);
      
      // Update local state to reflect the change
      setUsers(users.map(user => 
        user.uid === selectedUser.uid 
          ? { ...user, role: selectedRole as UserRole } 
          : user
      ));
      
      // Close dialog
      setDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole('');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get role badge component
  const getRoleBadge = (role: UserRole) => {
    let icon = <ShieldQuestion className="h-3 w-3 mr-1" />;
    
    switch(role) {
      case 'unverified':
        icon = <ShieldAlert className="h-3 w-3 mr-1" />;
        break;
      case 'pending':
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case 'admin':
      case 'owner':
        icon = <Shield className="h-3 w-3 mr-1" />;
        break;
      default:
        icon = <UserCheck className="h-3 w-3 mr-1" />;
    }
    
    return (
      <Badge 
        variant="outline" 
        className={`flex items-center ${role === 'owner' ? 'border-black bg-black text-white' : ''}`}
      >
        {icon}
        {roles[role].name}
      </Badge>
    );
  };

  return (
    <AuthGuard allowedRoles={['admin', 'owner']}>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra los usuarios y sus niveles de permiso
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar usuarios..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName} 
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Users className="h-4 w-4" />
                            </div>
                          )}
                          <span>{user.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.emailVerified ? "success" : "destructive"}>
                          {user.emailVerified ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verificado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" />
                              No verificado
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {new Date(user.lastLogin).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedRole(user.role);
                            setDialogOpen(true);
                          }}
                        >
                          Cambiar rol
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Role change dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar rol de usuario</DialogTitle>
              <DialogDescription>
                Cambiar el rol de acceso para {selectedUser?.displayName}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Usuario:
                  </label>
                  <div className="flex items-center gap-2">
                    {selectedUser?.photoURL ? (
                      <img 
                        src={selectedUser.photoURL} 
                        alt={selectedUser.displayName} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{selectedUser?.displayName}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Rol actual:
                  </label>
                  <div>
                    {selectedUser && getRoleBadge(selectedUser.role)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Seleccionar nuevo rol:
                  </label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roles).map(([key, { name }]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRoleChange}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default UserManagement;
