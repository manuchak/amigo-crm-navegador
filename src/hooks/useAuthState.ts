
import { useState } from 'react';
import { UserData } from '@/types/auth';
import { Session } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  return {
    userData,
    setUserData,
    session,
    setSession,
    loading,
    setLoading
  };
};
