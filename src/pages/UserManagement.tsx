import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Shield, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { UserData, UserRole } from '@/types/auth';
import { useRolePermissions } from '@/hooks/useRolePermissions';

import UserTable from '@/components/user-management/UserTable';
import UserPermissionConfig from '@/components/user-management/UserPermissionConfig';
import EditRoleDialog from '@/components/user-management/EditRoleDialog';
import RoleChangeConfirmation from '@/components/user-management/RoleChangeConfirmation';
import PendingUsers from '@/components/user-management/PendingUsers';

const UserManagement = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('unverified');
  const [activeTab, setActiveTab] = useState('all-users');
  const [error, setError] = useState<string | null>(null);
  const { hasPermission } = useRolePermissions();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const allUsers = await getAllUsers();
        console.log("Fetched users:", allUsers);
        setUsers(allUsers || []);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setError(error?.message || 'Error al cargar los usuarios');
        toast.error('Error al cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [getAllUsers]);
  
  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };
  
  const handleRoleChange = (value: UserRole) => {
    setNewRole(value);
  };
  
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      const { success, error } = await updateUserRole(selectedUser.uid, newRole);
      
      if (!success) throw error;
      
      setUsers(users.map(user => 
        user.uid === selectedUser.uid ? { ...user, role: newRole } : user
      ));
      
      setIsEditDialogOpen(false);
      setIsConfirmationOpen(true);
      toast.success(`Rol actualizado a ${newRole} para ${selectedUser.displayName || selectedUser.email}`);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol del usuario: ' + (error?.message || ''));
    }
  };
  
  const handleVerifyUser = async (user: UserData) => {
    try {
      const { success, error } = await verifyEmail(user.uid);
      
      if (!success) throw error;
      
      setUsers(users.map(u => 
        u.uid === user.uid ? { ...u, emailVerified: true } : u
      ));
      
      toast.success(`Email verificado para ${user.displayName || user.email}`);
    } catch (error: any) {
      console.error('Error verifying user email:', error);
      toast.error('Error al verificar el email del usuario: ' + (error?.message || ''));
    }
  };

  const handleAssignRole = async (user: UserData, role: UserRole) => {
    try {
      const { success, error } = await updateUserRole(user.uid, role);
      
      if (!success) throw error;
      
      setUsers(users.map(u => 
        u.uid === user.uid ? { ...u, role } : u
      ));
      
      toast.success(`Rol ${role} asignado a ${user.displayName || user.email}`);
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast.error('Error al asignar el rol: ' + (error?.message || ''));
    }
  };

  const [canManageUsers, setCanManageUsers] = useState(false);
  
  useEffect(() => {
    const checkPermissions = async () => {
      const canManage = await hasPermission('page', 'user_management');
      setCanManageUsers(canManage);
    };
    
    checkPermissions();
  }, [hasPermission]);

  const isOwner = currentUserData?.role === 'owner';
  const isAdmin = currentUserData?.role === 'admin' || isOwner;

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

  if (!canManageUsers && !isAdmin && !isOwner) {
    return (
      <div className="container mx-auto py-20 px-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription className="text-red-500">
              No tienes permisos para gestionar usuarios.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-20 px-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingUsers = users.filter(user => 
    user.role === 'unverified' || user.role === 'pending'
  );

  const formatDate = (date: Date | null | undefined): string => {
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

  const canEditUser = (user: UserData): boolean => {
    if (!currentUserData) return false;
    
    if (currentUserData.uid === user.uid) return false;
    
    if (currentUserData.role === 'owner') {
      return user.role !== 'owner';
    }
    
    if (currentUserData.role === 'admin') {
      return !['admin', 'owner'].includes(user.role);
    }
    
    return false;
  };

  return (
    <div className="container mx-auto py-20 px-4">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administre los usuarios y roles en el sistema</CardDescription>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Shield className="h-4 w-4 text-amber-500" />
                <span className="text-amber-700 text-sm font-medium">Modo Propietario</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-users" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 mb-6">
              <TabsTrigger value="all-users">Todos los Usuarios</TabsTrigger>
              {isAdmin && <TabsTrigger value="pending" className="relative">
                Solicitudes
                {pendingUsers.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {pendingUsers.length}
                  </span>
                )}
              </TabsTrigger>}
              {isAdmin && <TabsTrigger value="permissions">Permisos</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="all-users">
              <UserTable 
                users={users}
                onEditClick={handleEditClick}
                onVerifyUser={handleVerifyUser}
                canEditUser={canEditUser}
                formatDate={formatDate}
              />
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="pending">
                <PendingUsers 
                  users={pendingUsers}
                  onAssignRole={handleAssignRole}
                  onVerifyUser={handleVerifyUser}
                  formatDate={formatDate}
                />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="permissions">
                <UserPermissionConfig />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <EditRoleDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedUser={selectedUser}
        newRole={newRole}
        onRoleChange={handleRoleChange}
        onUpdateRole={handleUpdateRole}
        currentUserRole={currentUserData?.role || 'unverified'}
      />

      <RoleChangeConfirmation
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        user={selectedUser}
        newRole={newRole}
      />
    </div>
  );
};

export default UserManagement;
