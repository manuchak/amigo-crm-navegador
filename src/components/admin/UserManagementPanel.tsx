
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetry, setAutoRetry] = useState(false);
  
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
  
  // Automatic retry when error occurs
  useEffect(() => {
    if (error && autoRetry && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto-retry attempt ${retryCount + 1}/3`);
        setRetryCount(prev => prev + 1);
        fetchUsers(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, autoRetry, retryCount, fetchUsers]);
  
  // Initial data fetch with improved error handling
  useEffect(() => {
    const loadInitialData = async () => {
      if (!users.length && !loading) {
        console.log('Initial fetch of users in UserManagementPanel');
        
        try {
          await fetchUsers(true);
        } catch (err) {
          console.error('Failed to load users:', err);
          // Will be handled by the component's error state
        }
      }
    };
    
    loadInitialData();
  }, [retryCount]); // Dependency on retryCount allows manual retries
  
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      console.log(`Updating role for user ${selectedUser.uid} to ${newRole}`);
      const result = await updateUserRole(selectedUser.uid, newRole);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error updating role');
      }
      
      setIsEditDialogOpen(false);
      
      // Update local state to show the change immediately
      setUsers(prevUsers => prevUsers.map(user => 
        user.uid === selectedUser.uid ? { ...user, role: newRole } : user
      ));
      
      // Show confirmation dialog
      setIsConfirmationOpen(true);
      
      toast.success(`Rol actualizado a ${newRole} para ${selectedUser.displayName || selectedUser.email}`);
      
      // Force refresh the user list to ensure we have the latest data
      setTimeout(() => {
        console.log('Refreshing user list after role update');
        fetchUsers(true);
      }, 1000);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(`Error al actualizar el rol del usuario: ${error?.message || 'Error desconocido'}`);
    }
  };
  
  const handleVerifyUser = async (user: UserData) => {
    try {
      console.log(`Verifying email for user ${user.uid}`);
      const result = await verifyEmail(user.uid);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error verifying email');
      }
      
      // Update local state to reflect the change
      setUsers(prevUsers => prevUsers.map(u => 
        u.uid === user.uid ? { ...u, emailVerified: true } : u
      ));
      
      toast.success(`Email verificado para ${user.displayName || user.email}`);
      
      // Force refresh to ensure we have the latest data
      setTimeout(() => {
        console.log('Refreshing user list after email verification');
        fetchUsers(true);
      }, 1000);
    } catch (error: any) {
      console.error('Error verifying user email:', error);
      toast.error(`Error al verificar el email del usuario: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    setRetryCount(prev => prev + 1);
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
          <li>Número de intentos: {retryCount}</li>
          <li>Auto-retry: {autoRetry ? 'Activado' : 'Desactivado'}</li>
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
              <p>{error.toString()}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={() => fetchUsers(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setAutoRetry(!autoRetry)}
                >
                  {autoRetry ? 'Desactivar auto-retry' : 'Activar auto-retry'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
              {retryCount > 0 && <p className="text-xs text-muted-foreground">Intento #{retryCount}</p>}
            </div>
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
