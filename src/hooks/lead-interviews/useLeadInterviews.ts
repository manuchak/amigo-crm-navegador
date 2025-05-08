
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/AuthContext';
import { LeadForInterview, LeadFilter, UseLeadInterviewsReturn } from './types';
import { useStaffMembers } from './useStaffMembers';
import { useLeadFilters } from './useLeadFilters';
import { useLeadActions } from './useLeadActions';

export const useLeadInterviews = (): UseLeadInterviewsReturn => {
  const [leads, setLeads] = useState<LeadForInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // Get staff members data
  const { 
    staffUsers, 
    loadingStaff, 
    isSupplyAdmin, 
    isSupply 
  } = useStaffMembers();

  // Fetch leads data
  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select(`*`);

      // If user is Supply (not admin), only show their assigned leads
      if (currentUser?.role === 'supply') {
        query = query.eq('assigned_to', currentUser.uid);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Get all assigned users separately to avoid join issues
      const leadIds = data.filter(lead => lead.assigned_to).map(lead => lead.id);
      let assigneeNames: Record<string, string> = {};
      
      if (leadIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', data.filter(lead => lead.assigned_to).map(lead => lead.assigned_to));
          
        if (!profilesError && profiles) {
          // Create a map of user id to display name
          assigneeNames = profiles.reduce((acc: Record<string, string>, profile) => {
            acc[profile.id] = profile.display_name;
            return acc;
          }, {});
        }
      }
      
      // Transform data to include assignee name
      const transformedLeads = (data as any[]).map(lead => ({
        ...lead,
        assignee_name: lead.assigned_to ? assigneeNames[lead.assigned_to] || 'Unknown User' : null
      }));
      
      setLeads(transformedLeads as LeadForInterview[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Error al cargar los candidatos');
    } finally {
      setLoading(false);
    }
  };

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, [currentUser?.uid, isSupplyAdmin]);

  // Get filtered leads
  const {
    filter,
    setFilter,
    filteredLeads,
    newLeads,
    classifiedLeads,
    scheduledLeads,
    unassignedLeads,
    assignedLeads,
    myLeads
  } = useLeadFilters(leads);

  // Get lead action methods
  const {
    updateLeadStatus,
    classifyLead,
    assignLead,
    unassignLead
  } = useLeadActions(leads, setLeads, fetchLeads);

  return {
    leads: filteredLeads,
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

export default useLeadInterviews;
