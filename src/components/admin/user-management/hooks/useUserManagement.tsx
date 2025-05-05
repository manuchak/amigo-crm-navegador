
import { useState, useEffect, useCallback } from 'react';
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

  const fetchUsers = useCallback(async (forceRefresh: boolean = false) => {
    // Skip if already loading
    if (loading) {
      console.log('Already loading users, skipping duplicate fetch');
      return users;
    }
    
    // If not forcing refresh and we fetched recently, return cached users
    const CACHE_TTL = 10 * 1000; // 10 seconds (reduced from 30 to make testing easier)
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
  }, [getAllUsers, lastFetchedAt, loading, users]);

  const handleEditClick = (user: UserData) => {
    console.log('Editing user:', user);
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleRoleChange = (role: UserRole) => {
    console.log('Changing role to:', role);
    setNewRole(role);
  };

  // Load users on component mount
  useEffect(() => {
    if (users.length === 0 && !loading) {
      console.log('Initial user load in useUserManagement hook');
      fetchUsers();
    }
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
