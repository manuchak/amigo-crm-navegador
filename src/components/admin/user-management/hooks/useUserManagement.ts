
import { useState, useCallback, useRef, useEffect } from 'react';
import { UserData, UserRole } from '@/types/auth';
import { toast } from 'sonner';

interface UseUserManagementProps {
  getAllUsers: () => Promise<UserData[]>;
}

const useUserManagement = ({ getAllUsers }: UseUserManagementProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [newRole, setNewRole] = useState<UserRole>('unverified');
  const initialFetchDone = useRef<boolean>(false);

  const fetchUsers = useCallback(async () => {
    // Evitar fetchs múltiples en un corto período de tiempo
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Fetching users from getAllUsers function...');
      const usersData = await getAllUsers();
      console.log('Users fetched:', usersData);
      setUsers(usersData || []);
      initialFetchDone.current = true;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, loading]);

  // Realizar la carga inicial solo una vez
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchUsers();
    }
  }, [fetchUsers]);

  const handleEditClick = useCallback((user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  }, []);

  const handleRoleChange = useCallback((role: UserRole) => {
    setNewRole(role);
  }, []);

  return {
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
    handleEditClick,
  };
};

export default useUserManagement;
