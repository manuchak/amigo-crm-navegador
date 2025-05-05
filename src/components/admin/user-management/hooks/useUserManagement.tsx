
import { useState, useEffect } from 'react';
import { UserData, UserRole } from '@/types/auth';
import { toast } from 'sonner';

interface UseUserManagementProps {
  getAllUsers: () => Promise<UserData[]>;
}

const useUserManagement = ({ getAllUsers }: UseUserManagementProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  const fetchUsers = async (forceRefresh: boolean = false) => {
    // Skip if already loading or recently fetched and not forced
    const CACHE_TTL = 30 * 1000; // 30 seconds
    if (
      loading || 
      (!forceRefresh && lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL)
    ) {
      return users;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getAllUsers();
      setUsers(data);
      setLastFetchedAt(Date.now());
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch users');
      setError(error);
      toast.error('Error al cargar usuarios: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setNewRole(role);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    selectedUser,
    isEditDialogOpen,
    isConfirmationOpen,
    newRole,
    fetchUsers,
    setUsers,
    setSelectedUser,
    setIsEditDialogOpen,
    setIsConfirmationOpen,
    setNewRole,
    handleEditClick,
    handleRoleChange,
    lastFetchedAt
  };
};

export default useUserManagement;
