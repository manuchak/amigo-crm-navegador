
// This file provides hooks for role permissions management
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
      
      console.log('Users loaded from profiles:', userData?.length || 0, 'users');
      
      // Fetch user roles from user_roles table
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (userRolesError) {
        console.error('Error fetching user roles:', userRolesError);
      } else {
        console.log('User roles loaded:', userRolesData?.length || 0, 'roles');
      }
      
      // Get current auth user
      const { data: authData } = await supabase.auth.getUser();
      console.log('Current auth user:', authData?.user?.email);
      
      // Map users to include their role
      const enhancedUsers = (userData || []).map(user => {
        // Find role in user_roles table
        const userRole = userRolesData?.find(role => role.user_id === user.id);
        
        return {
          id: user.id,
          uid: user.id,
          email: user.email,
          displayName: user.display_name || user.email?.split('@')[0] || 'Unknown',
          role: userRole?.role || user.role || 'unverified',
          emailVerified: !!user.email_verified,
          createdAt: user.created_at
        };
      });
      
      console.log('Enhanced users data:', enhancedUsers);
      setUsers(enhancedUsers);
      
      // Check if the current user is an owner
      if (authData && authData.user) {
        const { data: ownerCheck } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id)
          .eq('role', 'owner')
          .maybeSingle();
        
        setIsOwner(!!ownerCheck);
        console.log('Current user is owner:', !!ownerCheck);
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
      console.log('Saving permissions to database...');
      
      // Create an array of permission updates
      const permissionUpdates = permissions.flatMap(permission => {
        const rolePermissions = [];
        
        // Extract page permissions
        Object.entries(permission.pages).forEach(([pageId, allowed]) => {
          rolePermissions.push({
            role: permission.role,
            permission_type: 'pages',
            permission_id: pageId,
            allowed: !!allowed
          });
        });
        
        // Extract action permissions
        Object.entries(permission.actions).forEach(([actionId, allowed]) => {
          rolePermissions.push({
            role: permission.role,
            permission_type: 'actions',
            permission_id: actionId,
            allowed: !!allowed
          });
        });
        
        return rolePermissions;
      });
      
      // First, remove existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .in('role', permissions.map(p => p.role));
        
      if (deleteError) {
        console.error('Error removing existing permissions:', deleteError);
        throw new Error('Error clearing existing permissions');
      }
      
      // Then, insert the updated permissions
      if (permissionUpdates.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(permissionUpdates);
          
        if (insertError) {
          console.error('Error inserting permissions:', insertError);
          throw new Error('Error updating permissions');
        }
      }
      
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
