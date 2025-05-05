
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
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Control variables to prevent infinite loops and unnecessary fetches
  const isInitialFetchComplete = useRef<boolean>(false);
  const isProcessingFetch = useRef<boolean>(false);
  const fetchErrorCount = useRef<number>(0);
  const MAX_FETCH_ERRORS = 3;
  const lastFetchedAt = useRef<Date | null>(null);

  const fetchUsers = useCallback(async (forceRefresh = false): Promise<UserData[]> => {
    // Skip if already fetching
    if (isProcessingFetch.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping');
      return users; // Return current users as fallback
    }
    
    // Reset error state
    setError(null);
    isProcessingFetch.current = true;
    setLoading(true);
    
    try {
      console.log('Fetching users from getAllUsers function...');
      const usersData = await getAllUsers();
      console.log('Users fetched:', usersData?.length || 0, usersData);
      
      if (Array.isArray(usersData)) {
        if (usersData.length === 0) {
          console.warn('No users returned from getAllUsers function');
        }
        
        setUsers(usersData);
        // Reset error counter on success
        fetchErrorCount.current = 0;
        isInitialFetchComplete.current = true;
        lastFetchedAt.current = new Date();
        return usersData;
      } else {
        console.warn('getAllUsers returned invalid data format');
        setError('La función de obtención de usuarios devolvió un formato inválido');
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(`Error al cargar los usuarios: ${error?.message || 'Error desconocido'}`);
      
      // Increment error counter
      fetchErrorCount.current += 1;
      
      // Prevent retries after too many errors
      if (fetchErrorCount.current >= MAX_FETCH_ERRORS) {
        console.error('Maximum fetch error count reached, stopping retries');
        toast.error('Error al cargar los usuarios. Por favor, intente más tarde.');
      }
      
      return users; // Return current users as fallback
    } finally {
      setLoading(false);
      isProcessingFetch.current = false;
    }
  }, [getAllUsers, users]);

  // Initial fetch of users
  useEffect(() => {
    if (!isInitialFetchComplete.current && !loading) {
      console.log('Initial fetch of users in useUserManagement hook');
      fetchUsers();
    }
  }, [fetchUsers, loading]);

  // Add effect to handle forceRefresh changes
  useEffect(() => {
    if (forceRefresh > 0) {
      console.log('Force refresh triggered in useUserManagement');
      fetchUsers(true);
    }
  }, [forceRefresh, fetchUsers]);

  const handleEditClick = useCallback((user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  }, []);

  const handleRoleChange = useCallback((role: UserRole) => {
    setNewRole(role);
  }, []);

  // Force a refresh of the user list
  const refreshUserList = () => {
    console.log('Forcing refresh of user list');
    setForceRefresh(prev => prev + 1);
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
    isInitialFetchComplete,
    lastFetchedAt: lastFetchedAt.current,
    refreshUserList,
  };
};

export default useUserManagement;
