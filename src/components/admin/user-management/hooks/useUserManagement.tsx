
import { useState, useCallback, useEffect, useRef } from 'react';
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
  const fetchInProgress = useRef<boolean>(false);

  // Mejorado para ser más resiliente a errores
  const fetchUsers = useCallback(async (forceRefresh = false): Promise<UserData[]> => {
    // No fetch if already loading (prevent duplicate calls)
    if (fetchInProgress.current && !forceRefresh) {
      console.log('Already loading users, skipping additional fetch');
      return users;
    }
    
    // Track fetch count and indicate fetch in progress
    setFetchCount(prev => prev + 1);
    fetchInProgress.current = true;
    
    // Start loading state
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users from API...');
      const usersData = await getAllUsers();
      
      if (Array.isArray(usersData)) {
        console.log(`Successfully loaded ${usersData.length} users`);
        
        // Ensure we have data to display
        if (usersData.length === 0) {
          console.warn('API returned 0 users - this might indicate a problem');
        }
        
        setUsers(usersData);
        setLastFetchedAt(Date.now());
        return usersData;
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
      
      return users; // Return existing users as fallback
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [getAllUsers, users]);

  // Auto-refresh on mount and periodically
  useEffect(() => {
    // Initial load if needed
    if (!fetchInProgress.current) {
      console.log('Initial load triggered in useUserManagement hook');
      fetchUsers(true).catch(err => console.error('Failed initial fetch:', err));
    }
    
    // Set up timer for periodic refresh
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const refreshTimer = setTimeout(() => {
      if (!fetchInProgress.current) {
        console.log('Performing background refresh of users list');
        fetchUsers(true).catch(err => console.error('Failed background refresh:', err));
      }
    }, REFRESH_INTERVAL);
    
    return () => clearTimeout(refreshTimer);
  }, [fetchUsers]);

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
