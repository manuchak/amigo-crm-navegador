
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserData } from '@/types/auth';
import { toast } from 'sonner';
import { 
  UserTable, 
  EditRoleDialog, 
  RoleChangeConfirmation,
  canEditUser
} from '@/components/user-management';
import UserManagementHeader from './UserManagementHeader';
import useUserManagement from './hooks/useUserManagement';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const UserManagementPanel = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  
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
  
  // More aggressive fetch on mount to ensure data loads
  useEffect(() => {
    const initialLoad = async () => {
      console.log('Initial user data fetch attempt in UserManagementPanel');
      if (!fetchSuccess) {
        try {
          const fetchedUsers = await fetchUsers(true);
          // Fixed: Check if fetchedUsers is defined and has items
          if (fetchedUsers && Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
            console.log(`Successfully loaded ${fetchedUsers.length} users`);
            setFetchSuccess(true);
          } else {
            console.log('No users loaded in initial fetch');
          }
        } catch (err) {
          console.error('Error in initial fetch:', err);
        }
      }
    };
    
    initialLoad();
  }, [retryCount, fetchSuccess]);
  
  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      console.log(`Updating role for user ${selectedUser.uid} to ${newRole}`);
      const result = await updateUserRole(selectedUser.uid, newRole);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error updating role');
      }
      
      setIsEditDialogOpen(false);
      setIsConfirmationOpen(true);
      
      // Update local state to show the change immediately
      setUsers(prevUsers => prevUsers.map(user => 
        user.uid === selectedUser.uid ? { ...user, role: newRole } : user
      ));
      
      toast.success(`Rol actualizado a ${newRole} para ${selectedUser.displayName || selectedUser.email}`);
      
      // Force refresh the user list to ensure we have the latest data
      setTimeout(() => fetchUsers(true), 1000);
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
      setTimeout(() => fetchUsers(true), 1000);
    } catch (error: any) {
      console.error('Error verifying user email:', error);
      toast.error(`Error al verificar el email del usuario: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered with forced reload');
    setRetryCount(prev => prev + 1);
    setFetchSuccess(false);
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
          <li>Estado de carga: {loading ? 'Cargando' : 'Completado'}</li>
          <li>Fuente de datos: {fetchSuccess ? 'API' : 'Caché/Fallback'}</li>
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
            <AlertTriangle className="h-4 w-4 mr-2" />
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
                  onClick={() => {
                    setRetryCount(prev => prev + 1);
                    setFetchSuccess(false);
                  }}
                >
                  Forzar recarga completa
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {users.length === 0 && !loading && !error && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>No se encontraron usuarios</AlertTitle>
            <AlertDescription>
              <p>No se encontraron usuarios en el sistema. Intente actualizar los datos.</p>
              <Button size="sm" className="mt-2" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar ahora
              </Button>
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
