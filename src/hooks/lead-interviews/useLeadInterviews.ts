
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadForInterview, StaffUser, LeadFilter, UseLeadInterviewsReturn } from './types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export const useLeadInterviews = (): UseLeadInterviewsReturn => {
  // States
  const [leads, setLeads] = useState<LeadForInterview[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadFilter>('all');
  const [error, setError] = useState<Error | null>(null);
  const { userData } = useAuth();
  
  // Derived states for different lead categories
  const newLeads = leads.filter(lead => lead.estado === 'nuevo');
  const classifiedLeads = leads.filter(lead => lead.estado === 'clasificado');
  const scheduledLeads = leads.filter(lead => lead.estado === 'agendado');
  const unassignedLeads = leads.filter(lead => !lead.assigned_to);
  const assignedLeads = leads.filter(lead => !!lead.assigned_to);
  const myLeads = leads.filter(lead => lead.assigned_to === userData?.uid);
  
  // Check if current user has supply-related role
  const isSupplyAdmin = userData?.role === 'supply_admin' || userData?.role === 'owner';
  const isSupply = userData?.role === 'supply' || isSupplyAdmin;
  
  // Fetch leads from the database with improved error handling
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching leads data...');
      
      // Get current session - using the proper getSession() method
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError(new Error(`Session error: ${sessionError.message}`));
        setLoading(false);
        return;
      }
      
      if (!sessionData.session) {
        console.error('No active session found');
        setError(new Error('No active session found. Please log in again.'));
        setLoading(false);
        return;
      }
      
      // Fetch leads from Supabase
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select(`
          *,
          profiles!leads_assigned_to_fkey(display_name)
        `);
      
      if (error) {
        console.error('Error fetching leads:', error);
        setError(new Error(`Failed to fetch leads: ${error.message}`));
        setLoading(false);
        return;
      }
      
      // Map data to include assignee name
      const mappedLeads = leadsData.map((lead: any) => ({
        ...lead,
        // Format date for display
        fecha_creacion: lead.created_at ? new Date(lead.created_at).toLocaleDateString('es-MX') : '',
        // Include assignee name if available
        assignee_name: lead.profiles?.display_name || null
      }));
      
      console.log(`Fetched ${mappedLeads.length} leads successfully`);
      setLeads(mappedLeads);
      setError(null);
    } catch (error: any) {
      console.error('Error in fetchLeads:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      toast.error('Error al cargar leads', { 
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update lead status
  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      console.log(`Updating lead ${leadId} to status: ${newStatus}`);
      const { error } = await supabase
        .from('leads')
        .update({ estado: newStatus })
        .eq('id', leadId);
      
      if (error) {
        console.error('Error updating lead status:', error);
        toast.error('Error al actualizar el estado del lead');
        return;
      }
      
      toast.success(`Lead actualizado a "${newStatus}"`);
      
      // Refresh leads after update
      await fetchLeads();
    } catch (error: any) {
      console.error('Error in updateLeadStatus:', error);
      toast.error('Error al actualizar el estado del lead');
    }
  };
  
  // Classify lead as armed or with vehicle
  const classifyLead = async (leadId: number, type: 'armed' | 'vehicle') => {
    try {
      const updateData = type === 'armed' 
        ? { esarmado: 'SI' } 
        : { tienevehiculo: 'SI' };
      
      console.log(`Classifying lead ${leadId} as ${type}`);
      const { error } = await supabase
        .from('leads')
        .update({ ...updateData, estado: 'clasificado' })
        .eq('id', leadId);
      
      if (error) {
        console.error(`Error classifying lead as ${type}:`, error);
        toast.error('Error al clasificar el lead');
        return;
      }
      
      toast.success(`Lead clasificado como ${type === 'armed' ? 'armado' : 'con vehículo'}`);
      
      // Refresh leads after update
      await fetchLeads();
    } catch (error: any) {
      console.error('Error in classifyLead:', error);
      toast.error('Error al clasificar el lead');
    }
  };
  
  // Assign lead to user
  const assignLead = async (leadId: number, userId: string) => {
    try {
      console.log(`Assigning lead ${leadId} to user ${userId}`);
      const { error } = await supabase
        .from('leads')
        .update({ 
          assigned_to: userId,
          assigned_at: new Date().toISOString()
        })
        .eq('id', leadId);
      
      if (error) {
        console.error('Error assigning lead:', error);
        toast.error('Error al asignar el lead');
        return;
      }
      
      toast.success('Lead asignado correctamente');
      
      // Refresh leads after update
      await fetchLeads();
    } catch (error: any) {
      console.error('Error in assignLead:', error);
      toast.error('Error al asignar el lead');
    }
  };
  
  // Unassign lead
  const unassignLead = async (leadId: number) => {
    try {
      console.log(`Unassigning lead ${leadId}`);
      const { error } = await supabase
        .from('leads')
        .update({ 
          assigned_to: null,
          assigned_at: null
        })
        .eq('id', leadId);
      
      if (error) {
        console.error('Error unassigning lead:', error);
        toast.error('Error al desasignar el lead');
        return;
      }
      
      toast.success('Lead desasignado correctamente');
      
      // Refresh leads after update
      await fetchLeads();
    } catch (error: any) {
      console.error('Error in unassignLead:', error);
      toast.error('Error al desasignar el lead');
    }
  };
  
  // Fetch staff users for assignment
  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        setLoadingStaff(true);
        console.log('Fetching staff users...');
        
        // Get supply staff roles
        const { data: userData, error } = await supabase
          .from('profiles')
          .select(`
            id,
            display_name,
            email,
            user_roles!inner (role)
          `)
          .or('role.eq.supply,role.eq.supply_admin', { foreignTable: 'user_roles' });
        
        if (error) {
          console.error('Error fetching staff users:', error);
          toast.error('Error al cargar usuarios de staff');
          setLoadingStaff(false);
          return;
        }
        
        // Map to StaffUser format
        const staffData = userData.map((user: any) => ({
          uid: user.id,
          displayName: user.display_name,
          email: user.email,
          role: user.user_roles?.role || 'supply'
        }));
        
        console.log(`Fetched ${staffData.length} staff users`);
        setStaffUsers(staffData);
      } catch (error: any) {
        console.error('Error in fetchStaffUsers:', error);
        toast.error('Error al cargar usuarios de staff');
      } finally {
        setLoadingStaff(false);
      }
    };
    
    // Only fetch staff if user has appropriate permissions and component is mounted
    if (isSupply) {
      fetchStaffUsers();
    }
  }, [isSupply]);
  
  // Initial load of leads
  useEffect(() => {
    console.log('Initial lead data fetch on component mount');
    fetchLeads();
    
    // Set up interval to refresh leads data periodically (every 2 minutes)
    const refreshInterval = setInterval(() => {
      console.log('Periodic lead data refresh');
      fetchLeads();
    }, 120000); // 2 minutes
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [fetchLeads]);
  
  return {
    leads,
    newLeads,
    classifiedLeads,
    scheduledLeads,
    unassignedLeads,
    assignedLeads,
    myLeads,
    loading,
    filter,
    error,
    setFilter,
    fetchLeads,
    updateLeadStatus,
    classifyLead,
    assignLead,
    unassignLead,
    staffUsers,
    loadingStaff,
    isSupplyAdmin,
    isSupply
  };
};
