
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { updateUserRole as localUpdateUserRole } from '@/utils/auth';
import { UserManagementHookProps } from './types';

export const useRoleManagement = ({ setLoading, refreshUserData }: UserManagementHookProps) => {
  const updateUserRole = async (uid: string, role: UserRole): Promise<{ success: boolean; error?: any }> => {
    setLoading(true);
    try {
      // Try to use the Supabase RPC function first
      try {
        const { error: rpcError } = await supabase.rpc('update_user_role', {
          target_user_id: uid,
          new_role: role
        });
        
        if (rpcError) {
          console.error('Error using RPC for role update:', rpcError);
          // Fall back to local implementation
          localUpdateUserRole(uid, role);
        } else {
          console.log('Role updated successfully via Supabase RPC');
        }
      } catch (rpcErr) {
        console.error('Could not use RPC method, falling back to local implementation:', rpcErr);
        // Update user role in local storage as fallback
        localUpdateUserRole(uid, role);
      }
      
      toast.success('Rol de usuario actualizado con éxito');
      await refreshUserData();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol de usuario: ' + error.message);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { updateUserRole };
};
