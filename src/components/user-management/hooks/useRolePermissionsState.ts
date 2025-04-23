
import { useState, useEffect } from 'react';
import { RolePermission } from '../rolePermissions.constants';
import { checkForOwnerRole } from '@/integrations/supabase/client';

export function useRolePermissionsState() {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check owner status on component mount
  useEffect(() => {
    const ownerStatus = checkForOwnerRole();
    console.log('Initial owner status:', ownerStatus ? '✅ Yes' : '❌ No');
    setIsOwner(ownerStatus);
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
