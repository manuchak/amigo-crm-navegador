import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, UserCheck, UserX, Users } from 'lucide-react';

const UserManagement = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await getAllUsers();
        console.log("Fetched users:", allUsers);
        setUsers(allUsers || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Error al cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [getAllUsers]);
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };
  
  const formatRole = (role) => {
    const displayRoles = {
      'unverified': 'No verificado',
      'pending': 'Pendiente',
      'atención_afiliado': 'Atención al Afiliado',
      'supply': 'Supply',
      'supply_admin': 'Supply Admin',
      'afiliados': 'Afiliados',
      'admin': 'Administrador',
      'owner': 'Propietario'
    };
    
    return displayRoles[role] || role;
  };
  
  const getRoleBadgeColor = (role) => {
    const colors = {
      'unverified': 'bg-gray-200 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'atención_afiliado': 'bg-blue-100 text-blue-800',
      'supply': 'bg-green-100 text-green-800',
      'supply_admin': 'bg-emerald-100 text-emerald-800',
      'afiliados': 'bg-purple-100 text-purple-800',
      'admin': 'bg-red-100 text-red-800',
      'owner': 'bg-slate-800 text-white'
    };
    
    return colors[role] || 'bg-gray-100 text-gray-800';
  };
  
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };
  
  const handleRoleChange = (value) => {
    setNewRole(value);
  };
  
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      await updateUserRole(selectedUser.uid, newRole);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.uid === selectedUser.uid ? { ...user, role: newRole } : user
      ));
      
      setIsEditDialogOpen(false);
      toast.success(`Rol actualizado para ${selectedUser.displayName}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol del usuario');
    }
  };
  
  const handleVerifyUser = async (user) => {
    try {
      await verifyEmail(user.uid);
      
      // Update the user in the local state
      setUsers(users.map(u => 
        u.uid === user.uid ? { ...u, emailVerified: true } : u
      ));
      
      toast.success(`Email verificado para ${user.displayName}`);
    } catch (error) {
      console.error('Error verifying user email:', error);
      toast.error('Error al verificar el email del usuario');
    }
  };
  
  const canEditUser = (user) => {
    // Cannot edit yourself
    if (currentUserData?.uid === user.uid) return false;
    
    // Owner can edit anyone except other owners
    if (currentUserData?.role === 'owner') {
      return user.role !== 'owner';
    }
    
    // Admin can edit anyone except owners and other admins
    if (currentUserData?.role === 'admin') {
      return !['admin', 'owner'].includes(user.role);
    }
    
    // Others cannot edit
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <Card className="shadow-md">
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
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay usuarios registrados</p>
            </div>
          ) : (
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
                        <div className="flex items-center gap-2">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold">
                                {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                          <span>{user.displayName || 'Usuario sin nombre'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)}`}>
                          {formatRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.emailVerified ? (
                          <div className="flex items-center">
                            <UserCheck className="h-5 w-5 text-green-500 mr-1" />
                            <span>Sí</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <UserX className="h-5 w-5 text-red-500 mr-1" />
                            <span>No</span>
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
                              onClick={() => handleVerifyUser(user)}
                              disabled={!canEditUser(user)}
                            >
                              Verificar Email
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(user)}
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
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Cambia el nivel de permiso para {selectedUser?.displayName || 'este usuario'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="col-span-1 text-right">
                Rol:
              </label>
              <div className="col-span-3">
                <Select
                  value={newRole}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unverified">No verificado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="atención_afiliado">Atención al Afiliado</SelectItem>
                    <SelectItem value="supply">Supply</SelectItem>
                    <SelectItem value="supply_admin">Supply Admin</SelectItem>
                    <SelectItem value="afiliados">Afiliados</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    {currentUserData?.role === 'owner' && (
                      <SelectItem value="owner">Propietario</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRole} disabled={!newRole || newRole === selectedUser?.role}>
              Actualizar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
