
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { 
  UserTable, 
  EditRoleDialog, 
  RoleChangeConfirmation,
  formatDate,
  canEditUser
} from '@/components/user-management';

const UserManagementPanel = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newRole, setNewRole] = useState(selectedUser?.role || 'unverified');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
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
  
  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };
  
  const handleRoleChange = (value: any) => {
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

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b bg-muted/40">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>Administra los usuarios y sus permisos</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Recargar
            </Button>
          </div>
        </div>
      </CardHeader>
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
            formatDate={formatDate}
          />
        )}
      </CardContent>

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
    </Card>
  );
};

export default UserManagementPanel;
