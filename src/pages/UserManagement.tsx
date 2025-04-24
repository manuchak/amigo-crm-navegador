
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
import { Button } from '@/components/ui/button'; // Added Button import
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserData, UserRole } from '@/types/auth';
import { 
  UserTable, 
  EditRoleDialog, 
  UserManagementHeader,
  RoleChangeConfirmation,
  formatDate,
  canEditUser,
  RegistrationRequestsTable,
  UserPermissionConfig
} from '@/components/user-management';

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
      await updateUserRole(selectedUser.uid, newRole);
      
      // Update the user in the local state
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
      await verifyEmail(user.uid);
      
      // Update the user in the local state
      setUsers(users.map(u => 
        u.uid === user.uid ? { ...u, emailVerified: true } : u
      ));
      
      toast.success(`Email verificado para ${user.displayName || user.email}`);
    } catch (error: any) {
      console.error('Error verifying user email:', error);
      toast.error('Error al verificar el email del usuario: ' + (error?.message || ''));
    }
  };

  // Added handleAssignRole function implementation
  const handleAssignRole = async (user: UserData, role: UserRole) => {
    try {
      await updateUserRole(user.uid, role);
      
      // Update the user in the local state
      setUsers(users.map(u => 
        u.uid === user.uid ? { ...u, role } : u
      ));
      
      toast.success(`Rol ${role} asignado a ${user.displayName || user.email}`);
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast.error('Error al asignar el rol: ' + (error?.message || ''));
    }
  };

  // Only owners should see the registration requests tab and permissions config
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
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>Administre los usuarios y roles en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-users" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 mb-6">
              <TabsTrigger value="all-users">Todos los Usuarios</TabsTrigger>
              {isOwner && <TabsTrigger value="registration-requests">Solicitudes</TabsTrigger>}
              {isAdmin && <TabsTrigger value="permissions">Permisos</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="all-users">
              <UserTable 
                users={users}
                onEditClick={handleEditClick}
                onVerifyUser={handleVerifyUser}
                canEditUser={(user) => canEditUser(currentUserData, user)}
                formatDate={formatDate}
              />
            </TabsContent>
            
            {isOwner && (
              <TabsContent value="registration-requests">
                <RegistrationRequestsTable 
                  users={users}
                  onAssignRole={handleAssignRole}
                  onVerifyUser={handleVerifyUser}
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

      {/* Edit Role Dialog */}
      <EditRoleDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        selectedUser={selectedUser}
        newRole={newRole}
        onRoleChange={handleRoleChange}
        onUpdateRole={handleUpdateRole}
        currentUserRole={currentUserData?.role || 'unverified'}
      />

      {/* Confirmation Dialog */}
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
