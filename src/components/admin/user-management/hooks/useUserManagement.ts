
import { useState, useCallback, useRef } from 'react';
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
  
  // Control variables to prevent infinite loops and unnecessary fetches
  const isInitialFetchComplete = useRef<boolean>(false);
  const isProcessingFetch = useRef<boolean>(false);
  const fetchErrorCount = useRef<number>(0);
  const MAX_FETCH_ERRORS = 3;

  const fetchUsers = useCallback(async () => {
    // Skip if already fetching
    if (isProcessingFetch.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }
    
    isProcessingFetch.current = true;
    setLoading(true);
    
    try {
      console.log('Fetching users from getAllUsers function...');
      const usersData = await getAllUsers();
      console.log('Users fetched:', usersData?.length || 0);
      
      if (Array.isArray(usersData)) {
        setUsers(usersData);
        // Reset error counter on success
        fetchErrorCount.current = 0;
        isInitialFetchComplete.current = true;
      } else {
        console.warn('getAllUsers returned invalid data format');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Increment error counter
      fetchErrorCount.current += 1;
      
      // Prevent retries after too many errors
      if (fetchErrorCount.current >= MAX_FETCH_ERRORS) {
        console.error('Maximum fetch error count reached, stopping retries');
        toast.error('Error al cargar los usuarios. Por favor, intente más tarde.');
      }
      
      setUsers([]);
    } finally {
      setLoading(false);
      isProcessingFetch.current = false;
    }
  }, [getAllUsers]);

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
    isInitialFetchComplete,
  };
};

export default useUserManagement;
