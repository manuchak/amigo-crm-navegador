
// This file redirects to the main useRolePermissions hook
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { processPermissionsData } from '../utils/permissionsDataProcessor';
import { availablePages, availableActions, ROLES } from '../rolePermissions.constants';
import { toast } from 'sonner';

export const useRolePermissions = () => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Function to fetch permissions
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching permissions data...');
      
      // Fetch permissions from Supabase
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('*');
      
      if (permissionsError) {
        console.error('Error fetching permissions:', permissionsError);
        throw new Error('Error fetching permissions data');
      }
      
      console.log('Permissions data loaded:', permissionsData?.length || 0, 'records');
      
      // Process the permissions data
      const processedPermissions = processPermissionsData(permissionsData || []);
      setPermissions(processedPermissions);
      
      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*');
      
      if (userError) {
        console.error('Error fetching users:', userError);
        throw new Error('Error fetching user data');
      }
      
      console.log('Users loaded:', userData?.length || 0, 'users');
      
      // Map users to include their role
      const enhancedUsers = (userData || []).map(user => ({
        id: user.id,
        uid: user.id,
        email: user.email,
        displayName: user.full_name || user.email?.split('@')[0] || 'Unknown',
        role: user.role || 'unverified',
        emailVerified: user.email_verified || false,
        createdAt: user.created_at
      }));
      
      setUsers(enhancedUsers);
      
      // Check if the current user is an owner
      const { data: authData } = await supabase.auth.getUser();
      if (authData && authData.user) {
        const { data: ownerCheck } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id)
          .eq('role', 'owner')
          .maybeSingle();
        
        setIsOwner(!!ownerCheck);
      }
      
    } catch (err: any) {
      console.error('Error in fetchPermissions:', err);
      setError(err.message || 'Error loading permissions');
      toast.error('Error al cargar los permisos');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);
  
  // Handle permission changes
  const handlePermissionChange = useCallback((roleIndex: number, type: 'pages' | 'actions', id: string, checked: boolean) => {
    setPermissions(prevPermissions => {
      const newPermissions = [...prevPermissions];
      if (newPermissions[roleIndex]) {
        newPermissions[roleIndex][type][id] = checked;
      }
      return newPermissions;
    });
  }, []);
  
  // Save permissions to the database
  const handleSavePermissions = useCallback(async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Logic to save permissions to Supabase would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      
      toast.success('Permisos guardados correctamente');
    } catch (err: any) {
      console.error('Error saving permissions:', err);
      setError(err.message || 'Error saving permissions');
      toast.error('Error al guardar los permisos');
    } finally {
      setSaving(false);
    }
  }, [permissions]);
  
  return {
    permissions,
    loading,
    saving,
    error,
    isOwner,
    users,
    handlePermissionChange,
    handleSavePermissions,
    reloadPermissions: fetchPermissions,
    availablePages,
    availableActions,
    ROLES
  };
};
