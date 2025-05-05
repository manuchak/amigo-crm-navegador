
import React, { useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const UserManagementPanel = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData } = useAuth();
  const { 
    users, 
    loading, 
    selectedUser,
    isEditDialogOpen,
    isConfirmationOpen,
    newRole,
    error,
    setUsers,
    setSelectedUser, 
    setIsEditDialogOpen, 
    setIsConfirmationOpen, 
    setNewRole,
    fetchUsers,
    handleRoleChange,
    handleEditClick,
    lastFetchedAt
  } = useUserManagement({ getAllUsers });
  
  // Only fetch data once on component mount
  useEffect(() => {
    if (!users.length && !loading) {
      console.log('Initial fetch of users in UserManagementPanel');
      fetchUsers(true);
    }
  // The empty dependency array ensures this only runs once on mount
  }, []);
  
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
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(`Error al actualizar el rol del usuario: ${error?.message || 'Error desconocido'}`);
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
    } catch (error: any) {
      console.error('Error verifying user email:', error);
      toast.error(`Error al verificar el email del usuario: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    fetchUsers(true);
  };

  const showDebugInfo = () => {
    if (currentUserData?.role !== 'admin' && currentUserData?.role !== 'owner') return null;
    
    return (
      <div className="text-xs text-muted-foreground mt-4 border-t pt-4">
        <p>Información de depuración:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Usuario actual: {currentUserData?.email || 'No autenticado'} (Rol: {currentUserData?.role || 'ninguno'})</li>
          <li>Total de usuarios cargados: {users.length}</li>
          <li>Última actualización: {lastFetchedAt ? new Date(lastFetchedAt).toLocaleString() : 'Nunca'}</li>
        </ul>
        {currentUserData && (
          <>
            <p className="mt-2 font-medium">Datos del usuario actual:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">
              {JSON.stringify(currentUserData, null, 2)}
            </pre>
          </>
        )}
      </div>
    );
  };

  return (
    <Card className="border shadow-sm">
      <UserManagementHeader loading={loading} onRefresh={handleRefresh} />
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error al cargar usuarios</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button size="sm" onClick={() => fetchUsers(true)}>Reintentar</Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <UserTable 
              users={users}
              onEditClick={handleEditClick}
              onVerifyUser={handleVerifyUser}
              canEditUser={(user) => canEditUser(currentUserData, user)}
              formatDate={(date) => date ? new Date(date).toLocaleDateString() : 'N/A'}
              currentUser={currentUserData}
            />
            
            {showDebugInfo()}
          </>
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
