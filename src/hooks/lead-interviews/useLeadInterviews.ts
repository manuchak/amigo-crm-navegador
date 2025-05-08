import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadForInterview, StaffUser, LeadFilter, UseLeadInterviewsReturn } from './types';
import { useAuth } from '@/context/AuthContext';

export const useLeadInterviews = (): UseLeadInterviewsReturn => {
  // States
  const [leads, setLeads] = useState<LeadForInterview[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadFilter>('all');
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
  
  // Fetch leads from the database
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current session - using the proper getSession() method
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setLoading(false);
        return;
      }
      
      const session = sessionData.session;
      
      if (!session) {
        console.error('No active session found');
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
        return;
      }
      
      // Map data to include assignee name
      const mappedLeads = leadsData.map((lead: any) => ({
        ...lead,
        // Format date for display
        fecha_creacion: new Date(lead.created_at).toLocaleDateString('es-MX'),
        // Include assignee name if available
        assignee_name: lead.profiles?.display_name || null
      }));
      
      setLeads(mappedLeads);
    } catch (error) {
      console.error('Error in fetchLeads:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update lead status
  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ estado: newStatus })
        .eq('id', leadId);
      
      if (error) {
        console.error('Error updating lead status:', error);
        return;
      }
      
      // Refresh leads after update
      await fetchLeads();
    } catch (error) {
      console.error('Error in updateLeadStatus:', error);
    }
  };
  
  // Classify lead as armed or with vehicle
  const classifyLead = async (leadId: number, type: 'armed' | 'vehicle') => {
    try {
      const updateData = type === 'armed' 
        ? { esarmado: 'SI' } 
        : { tienevehiculo: 'SI' };
      
      const { error } = await supabase
        .from('leads')
        .update({ ...updateData, estado: 'clasificado' })
        .eq('id', leadId);
      
      if (error) {
        console.error(`Error classifying lead as ${type}:`, error);
        return;
      }
      
      // Refresh leads after update
      await fetchLeads();
    } catch (error) {
      console.error('Error in classifyLead:', error);
    }
  };
  
  // Assign lead to user
  const assignLead = async (leadId: number, userId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          assigned_to: userId,
          assigned_at: new Date().toISOString()
        })
        .eq('id', leadId);
      
      if (error) {
        console.error('Error assigning lead:', error);
        return;
      }
      
      // Refresh leads after update
      await fetchLeads();
    } catch (error) {
      console.error('Error in assignLead:', error);
    }
  };
  
  // Unassign lead
  const unassignLead = async (leadId: number) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          assigned_to: null,
          assigned_at: null
        })
        .eq('id', leadId);
      
      if (error) {
        console.error('Error unassigning lead:', error);
        return;
      }
      
      // Refresh leads after update
      await fetchLeads();
    } catch (error) {
      console.error('Error in unassignLead:', error);
    }
  };
  
  // Fetch staff users for assignment
  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        setLoadingStaff(true);
        
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
          return;
        }
        
        // Map to StaffUser format
        const staffData = userData.map((user: any) => ({
          uid: user.id,
          displayName: user.display_name,
          email: user.email,
          role: user.user_roles?.role || 'supply'
        }));
        
        setStaffUsers(staffData);
      } catch (error) {
        console.error('Error in fetchStaffUsers:', error);
      } finally {
        setLoadingStaff(false);
      }
    };
    
    // Only fetch staff if user has appropriate permissions
    if (isSupply) {
      fetchStaffUsers();
    }
  }, [isSupply]);
  
  // Initial load of leads
  useEffect(() => {
    fetchLeads();
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
