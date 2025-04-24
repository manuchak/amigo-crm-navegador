
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
  const fetchInProgress = useRef<boolean>(false);
  const hasAttemptedFetch = useRef<boolean>(false);

  const fetchUsers = useCallback(async () => {
    // Prevent concurrent fetches and unnecessary refetching
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping duplicate fetch');
      return;
    }
    
    fetchInProgress.current = true;
    setLoading(true);
    
    try {
      console.log('Fetching users from getAllUsers function...');
      const usersData = await getAllUsers();
      console.log('Users fetched:', usersData?.length || 0);
      
      if (usersData && usersData.length > 0) {
        setUsers(usersData);
        hasAttemptedFetch.current = true;
      } else if (!hasAttemptedFetch.current) {
        // If we got no data and haven't successfully fetched before, try once more
        console.log('No users returned, trying fallback...');
        // Use a timeout to avoid potential race conditions
        setTimeout(async () => {
          try {
            const fallbackData = await getAllUsers();
            setUsers(fallbackData || []);
          } catch (fallbackErr) {
            console.error('Fallback fetch error:', fallbackErr);
            // Show empty state if both attempts fail
            setUsers([]);
          } finally {
            hasAttemptedFetch.current = true;
            setLoading(false);
            fetchInProgress.current = false;
          }
        }, 500);
        return; // Exit early as we're handling loading in the timeout
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar la lista de usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
      hasAttemptedFetch.current = true;
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
  };
};

export default useUserManagement;
