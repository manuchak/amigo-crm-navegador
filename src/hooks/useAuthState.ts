
import { useState } from 'react';
import { UserData } from '@/types/auth';

export const useAuthState = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  return {
    userData,
    setUserData,
    loading,
    setLoading
  };
};
