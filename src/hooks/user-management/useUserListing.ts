
import { useState } from 'react';
import { UserData } from '@/types/auth';
import { getAllUsers as apiGetAllUsers } from '@/utils/auth';
import { UserManagementHookProps } from './types';

export const useUserListing = ({ setLoading }: UserManagementHookProps) => {
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const getAllUsers = async (): Promise<UserData[]> => {
    setLoading('fetching-users');
    try {
      // Try to get users from the API
      const users = apiGetAllUsers();
      setLastFetchTime(new Date());
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    } finally {
      setLoading(null);
    }
  };

  return {
    getAllUsers,
    lastFetchTime
  };
};
