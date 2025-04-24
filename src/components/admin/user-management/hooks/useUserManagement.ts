
import { useState, useEffect } from 'react';
import { UserData, UserRole } from '@/types/auth';
import { toast } from 'sonner';

interface UseUserManagementProps {
  getAllUsers: () => Promise<UserData[]>;
}

const useUserManagement = ({ getAllUsers }: UseUserManagementProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('unverified');
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };
  
  const handleRoleChange = (value: UserRole) => {
    setNewRole(value);
  };

  return {
    users,
    loading,
    selectedUser,
    isEditDialogOpen,
    isConfirmationOpen,
    newRole,
    setUsers,
    setLoading,
    setSelectedUser,
    setIsEditDialogOpen,
    setIsConfirmationOpen,
    setNewRole,
    fetchUsers,
    handleEditClick,
    handleRoleChange
  };
};

export default useUserManagement;
