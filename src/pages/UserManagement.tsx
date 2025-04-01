
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserData, UserRole } from '@/types/auth';
import { 
  UserTable, 
  EditRoleDialog, 
  UserManagementHeader,
  formatDate,
  canEditUser
} from '@/components/user-management';

const UserManagement = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('unverified');
  
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
      toast.success(`Rol actualizado para ${selectedUser.displayName}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol del usuario');
    }
  };
  
  const handleVerifyUser = async (user: UserData) => {
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
        <UserManagementHeader />
        <CardContent>
          <UserTable 
            users={users}
            onEditClick={handleEditClick}
            onVerifyUser={handleVerifyUser}
            canEditUser={(user) => canEditUser(currentUserData, user)}
            formatDate={formatDate}
          />
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
    </div>
  );
};

export default UserManagement;
