import { useState, useCallback, useEffect } from 'react';
import { UserData } from '@/types/auth';
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
  const [newRole, setNewRole] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [fetchCount, setFetchCount] = useState<number>(0);

  // Mejorado para ser más resiliente a errores
  const fetchUsers = useCallback(async (forceRefresh = false) => {
    // No fetch if already loading (prevent duplicate calls)
    if (loading && !forceRefresh) {
      console.log('Already loading users, skipping additional fetch');
      return;
    }
    
    // Track fetch count
    setFetchCount(prev => prev + 1);
    
    // Cache TTL in milliseconds (5 minutes)
    const CACHE_TTL = 5 * 60 * 1000;
    const now = Date.now();
    
    // Use cache unless forced refresh or cache expired
    if (
      !forceRefresh && 
      lastFetchedAt && 
      (now - lastFetchedAt < CACHE_TTL) && 
      users.length > 0
    ) {
      console.log('Using cached users list');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users from API...');
      const usersData = await getAllUsers();
      
      if (Array.isArray(usersData)) {
        console.log(`Successfully loaded ${usersData.length} users`);
        setUsers(usersData);
        setLastFetchedAt(now);
      } else {
        throw new Error('Invalid response format from getAllUsers');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      
      // Keep showing old users if available
      if (users.length === 0) {
        toast.error('Error al cargar la lista de usuarios y no hay datos en caché');
      } else {
        toast.warning('Error al actualizar usuarios. Mostrando datos en caché.');
      }
    } finally {
      setLoading(false);
    }
  }, [getAllUsers, loading, lastFetchedAt, users.length]);

  // Auto-refresh on mount and after inactivity 
  useEffect(() => {
    // Initial load if needed
    if (users.length === 0 && !loading && fetchCount === 0) {
      fetchUsers(true);
    }
    
    // Set up timer for periodic refresh
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
    const refreshTimer = setTimeout(() => {
      if (!loading) {
        console.log('Performing background refresh of users list');
        fetchUsers(true);
      }
    }, REFRESH_INTERVAL);
    
    return () => clearTimeout(refreshTimer);
  }, [fetchUsers, users.length, loading, fetchCount]);

  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleRoleChange = (role: string) => {
    setNewRole(role);
  };

  return {
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
    lastFetchedAt,
    fetchCount
  };
};

export default useUserManagement;
