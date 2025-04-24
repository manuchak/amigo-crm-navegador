
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { 
  UserTable, 
  EditRoleDialog, 
  RoleChangeConfirmation,
  canEditUser
} from '@/components/user-management';
import UserManagementHeader from './user-management/UserManagementHeader';
import useUserManagement from './user-management/hooks/useUserManagement';

const UserManagementPanel = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData } = useAuth();
  const { 
    users, 
    loading, 
    selectedUser, 
    isEditDialogOpen, 
    isConfirmationOpen, 
    newRole,
    setUsers,
    setSelectedUser, 
    setIsEditDialogOpen, 
    setIsConfirmationOpen, 
    setNewRole,
    fetchUsers,
    handleRoleChange,
    handleEditClick
  } = useUserManagement({ getAllUsers });
  
  // Initial fetch of users when component mounts
  useEffect(() => {
    if (!users.length && !loading) {
      fetchUsers();
    }
  }, [users.length, loading, fetchUsers]);
  
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      console.log(`Updating role for user ${selectedUser.uid} to ${newRole}`);
      await updateUserRole(selectedUser.uid, newRole);
      
      setIsEditDialogOpen(false);
      setIsConfirmationOpen(true);
      
      // Update local state to show the change immediately
      setUsers(prevUsers => prevUsers.map(user => 
        user.uid === selectedUser.uid ? { ...user, role: newRole } : user
      ));
      
      toast.success(`Rol actualizado a ${newRole} para ${selectedUser.displayName || selectedUser.email}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol del usuario');
    }
  };
  
  const handleVerifyUser = async (user: UserData) => {
    try {
      console.log(`Verifying email for user ${user.uid}`);
      await verifyEmail(user.uid);
      
      // Update local state to reflect the change
      setUsers(prevUsers => prevUsers.map(u => 
        u.uid === user.uid ? { ...u, emailVerified: true } : u
      ));
      
      toast.success(`Email verificado para ${user.displayName || user.email}`);
    } catch (error) {
      console.error('Error verifying user email:', error);
      toast.error('Error al verificar el email del usuario');
    }
  };

  return (
    <Card className="border shadow-sm">
      <UserManagementHeader loading={loading} onRefresh={fetchUsers} />
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <UserTable 
            users={users}
            onEditClick={handleEditClick}
            onVerifyUser={handleVerifyUser}
            canEditUser={(user) => canEditUser(currentUserData, user)}
            formatDate={(date) => new Date(date).toLocaleDateString()}
          />
        )}
      </CardContent>

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
    </Card>
  );
};

export default UserManagementPanel;
