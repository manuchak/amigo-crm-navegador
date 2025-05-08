import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { UserData, UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { 
  UserTable, 
  EditRoleDialog, 
  RoleChangeConfirmation,
  canEditUser
} from '@/components/user-management';
import UserManagementHeader from './user-management/UserManagementHeader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const UserManagementPanel = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData, refreshUserData } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetry, setAutoRetry] = useState(false);
  
  // Function to fetch users
  const fetchUsers = async (forceRefresh: boolean = false) => {
    // Skip if already loading
    if (loading) {
      console.log('Already loading users, skipping duplicate fetch');
      return users;
    }
    
    // If not forcing refresh and we fetched recently, return cached users
    const CACHE_TTL = 5 * 1000; // 5 seconds
    if (
      !forceRefresh && 
      lastFetchedAt && 
      Date.now() - lastFetchedAt < CACHE_TTL &&
      users.length > 0
    ) {
      console.log('Using cached users list from recent fetch');
      return users;
    }

    console.log('Fetching users from server (force refresh: ' + forceRefresh + ')');
    setLoading(true);
    setError(null);

    try {
      const data = await getAllUsers();
      console.log('Fetched users data:', data);
      
      setUsers(data);
      setLastFetchedAt(Date.now());
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch users');
      console.error('Error fetching users:', error);
      setError(error);
      toast.error('Error al cargar usuarios: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Handle user edit action
  const handleEditClick = (user: UserData) => {
    console.log('Editing user:', user);
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };

  // Handle role change
  const handleRoleChange = (role: string) => {
    console.log('Changing role to:', role);
    setNewRole(role as UserRole); // Cast string to UserRole type
  };

  // Update user role
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
      }, 500);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(`Error al actualizar el rol del usuario: ${error?.message || 'Error desconocido'}`);
    }
  };
  
  // Handle user verification
  const handleVerifyUser = async (user: UserData) => {
    try {
      console.log(`Verifying email for user ${user.uid}`);
      const result = await verifyEmail(user.uid);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error verifying email');
      }
      
      // Update local state to reflect the change immediately
      setUsers(prevUsers => prevUsers.map(u => 
        u.uid === user.uid ? { ...u, emailVerified: true } : u
      ));
      
      toast.success(`Email verificado para ${user.displayName || user.email}`);
      
      // Force refresh to ensure we have the latest data
      setTimeout(() => {
        console.log('Refreshing user list after email verification');
        fetchUsers(true);
      }, 500);
    } catch (error: any) {
      console.error('Error verifying user email:', error);
      toast.error(`Error al verificar el email del usuario: ${error?.message || 'Error desconocido'}`);
    }
  };

  // Function to handle manual refresh
  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    setRetryCount(prev => prev + 1);
    fetchUsers(true);
  };
  
  // Initial data fetch with improved error handling
  useEffect(() => {
    if (users.length === 0 && !loading) {
      console.log('Initial fetch of users in UserManagementPanel');
      fetchUsers(true);
    }
  }, [retryCount]); // Dependency on retryCount allows manual retries
  
  // Format date function for UserTable
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Wrapper function for refreshUserData to handle void return type
  const wrappedRefreshUserData = async (): Promise<void> => {
    try {
      const result = await refreshUserData();
      if (!result.success && result.error) {
        console.error("Error refreshing user data:", result.error);
        toast.error(`Error al actualizar datos de usuario: ${result.error.message || 'Error desconocido'}`);
      }
    } catch (error: any) {
      console.error("Unexpected error refreshing user data:", error);
      toast.error(`Error inesperado al actualizar datos: ${error.message || 'Error desconocido'}`);
    }
  };

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
  }, [error, autoRetry, retryCount]);

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
          <UserTable 
            users={users}
            onEditClick={handleEditClick}
            onVerifyUser={handleVerifyUser}
            canEditUser={(user) => canEditUser(currentUserData, user)}
            formatDate={formatDate}
            currentUser={currentUserData}
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
