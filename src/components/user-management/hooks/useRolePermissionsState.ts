
import { useState, useEffect } from 'react';
import { RolePermission } from '../rolePermissions.constants';
import { supabase } from '@/integrations/supabase/client';

export function useRolePermissionsState() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check owner status on component mount
  useEffect(() => {
    const checkOwnerStatus = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        
        const { data, error } = await supabase.rpc('get_user_role', {
          user_uid: userData.user.id
        });
        
        if (!error && data === 'owner') {
          console.log('Owner status check result: ✅ Yes');
          setIsOwner(true);
          return;
        }
        
        console.log('Owner status check result: ❌ No');
        setIsOwner(false);
      } catch (err) {
        console.error('Error checking owner status:', err);
        // Fallback check from localStorage
        if (typeof window !== 'undefined') {
          try {
            const userData = JSON.parse(localStorage.getItem('current_user') || '{}');
            if (userData && userData.role === 'owner') {
              console.log('Owner status from localStorage fallback: ✅ Yes');
              setIsOwner(true);
              return;
            }
          } catch (e) {
            console.error('localStorage parsing error:', e);
          }
        }
        setIsOwner(false);
      }
    };

    checkOwnerStatus();
  }, []);

  return {
    permissions,
    loading,
    saving,
    error,
    isOwner,
    retryCount,
    setPermissions,
    setLoading,
    setSaving,
    setError,
    setIsOwner,
    setRetryCount,
  };
}
