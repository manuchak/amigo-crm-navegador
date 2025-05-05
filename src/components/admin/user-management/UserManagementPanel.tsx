
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertTriangle, Users, Search, Filter } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { UserStatsCards } from './components/UserStatsCards';

const UserManagementPanel = () => {
  const { getAllUsers, updateUserRole, verifyEmail, userData: currentUserData } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  
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
  }, [retryCount, fetchSuccess, fetchUsers]);

  // Filtrar usuarios basado en búsqueda y filtros
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      searchTerm === '' || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && user.emailVerified) ||
      (verificationFilter === 'unverified' && !user.emailVerified);
    
    return matchesSearch && matchesRole && matchesVerification;
  });
  
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
    setSearchTerm('');
    setRoleFilter('all');
    setVerificationFilter('all');
  };

  // Cálculo de estadísticas de usuarios
  const userStats = {
    total: users.length,
    verified: users.filter(user => user.emailVerified).length,
    unverified: users.filter(user => !user.emailVerified).length,
    admins: users.filter(user => user.role === 'admin' || user.role === 'owner').length,
    users: users.filter(user => user.role !== 'admin' && user.role !== 'owner').length
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

        {/* Tarjetas de estadísticas de usuario */}
        <UserStatsCards stats={userStats} />
        
        {/* Controles de filtrado */}
        <div className="flex flex-col md:flex-row gap-4 my-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="owner">Propietario</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="supply_admin">Supervisor</SelectItem>
                  <SelectItem value="supply">Agente</SelectItem>
                  <SelectItem value="unverified">Sin verificar</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado verificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Verificación</SelectLabel>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="verified">Verificados</SelectItem>
                  <SelectItem value="unverified">No verificados</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setVerificationFilter('all');
            }}>
              Limpiar filtros
            </Button>
          </div>
        </div>
        
        {/* Resultados y estado de la búsqueda */}
        {searchTerm || roleFilter !== 'all' || verificationFilter !== 'all' ? (
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-sm font-medium">Resultados:</h3>
            <Badge variant="secondary" className="font-mono">
              {filteredUsers.length} de {users.length}
            </Badge>
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                Búsqueda: {searchTerm}
              </Badge>
            )}
            {roleFilter !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Rol: {roleFilter}
              </Badge>
            )}
            {verificationFilter !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                {verificationFilter === 'verified' ? 'Verificados' : 'No verificados'}
              </Badge>
            )}
          </div>
        ) : null}
        
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
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Vista de tabla</TabsTrigger>
                <TabsTrigger value="cards">Vista de tarjetas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="pt-2">
                <UserTable 
                  users={filteredUsers}
                  onEditClick={handleEditClick}
                  onVerifyUser={handleVerifyUser}
                  canEditUser={(user) => canEditUser(currentUserData, user)}
                  formatDate={(date) => date ? new Date(date).toLocaleDateString() : 'N/A'}
                  currentUser={currentUserData}
                />
              </TabsContent>
              
              <TabsContent value="cards" className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map(user => (
                    <UserCard 
                      key={user.uid} 
                      user={user} 
                      onEditClick={handleEditClick}
                      onVerifyUser={handleVerifyUser}
                      canEdit={canEditUser(currentUserData, user)}
                      isCurrentUser={currentUserData?.uid === user.uid}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
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

// Componente de tarjeta de usuario para la vista alternativa
const UserCard = ({ 
  user, 
  onEditClick, 
  onVerifyUser, 
  canEdit, 
  isCurrentUser 
}: { 
  user: UserData; 
  onEditClick: (user: UserData) => void; 
  onVerifyUser: (user: UserData) => Promise<void>; 
  canEdit: boolean; 
  isCurrentUser: boolean;
}) => {
  const { UserAvatar, RoleBadge, EmailVerificationStatus } = require('@/components/user-management');
  
  return (
    <Card className={`overflow-hidden ${isCurrentUser ? 'border-primary' : ''}`}>
      <div className={`h-2 ${user.role === 'owner' ? 'bg-amber-500' : user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`} />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="lg" />
            <div>
              <h3 className="font-medium">{user.displayName || 'Sin nombre'}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {isCurrentUser && (
            <Badge variant="outline" className="ml-auto">Tú</Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <RoleBadge role={user.role} />
          <EmailVerificationStatus verified={user.emailVerified} />
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Creado: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          <p>Último acceso: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</p>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          {!user.emailVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVerifyUser(user)}
              disabled={!canEdit}
            >
              Verificar email
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => onEditClick(user)}
            disabled={!canEdit}
          >
            Editar rol
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementPanel;
