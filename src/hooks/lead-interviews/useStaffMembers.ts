
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StaffUser } from './types';
import { useAuth } from '@/context/auth/AuthContext';

export const useStaffMembers = () => {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const { currentUser } = useAuth();
  
  const isSupplyAdmin = currentUser?.role === 'supply_admin';
  const isSupply = currentUser?.role === 'supply' || isSupplyAdmin;

  // Fetch supply staff users
  const fetchStaffUsers = async () => {
    if (!isSupplyAdmin) return;
    
    setLoadingStaff(true);
    try {
      // Get the current access token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      // Make a fetch request to our edge function
      const response = await fetch('https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/get_users_by_role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          role: 'supply'
        })
      });
      
      const supplyUsers = await response.json();
      
      // Also fetch supply admin users
      const adminResponse = await fetch('https://beefjsdgrdeiymzxwxru.supabase.co/functions/v1/get_users_by_role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          role: 'supply_admin'
        })
      });
      
      const adminUsers = await adminResponse.json();
      
      // Combine both user types
      const allStaff = [
        ...(Array.isArray(supplyUsers) ? supplyUsers : []), 
        ...(Array.isArray(adminUsers) ? adminUsers : [])
      ];
      
      setStaffUsers(allStaff as StaffUser[]);
    } catch (error) {
      console.error('Error fetching staff users:', error);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (isSupplyAdmin) {
      fetchStaffUsers();
    }
  }, [isSupplyAdmin]);

  return {
    staffUsers,
    loadingStaff,
    fetchStaffUsers,
    isSupplyAdmin,
    isSupply
  };
};
