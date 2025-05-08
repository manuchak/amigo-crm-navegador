import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';

interface LeadForInterview {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  empresa: string;
  estado: string;
  experienciaseguridad: string | null;
  tienevehiculo: string | null;
  esarmado: string | null;
  credencialsedena: string | null;
  call_count: number;
  last_call_date: string | null;
  created_at: string;
  fecha_creacion: string;
  modelovehiculo: string | null;
  anovehiculo: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  assignee_name?: string;
}

interface StaffUser {
  uid: string;
  displayName: string;
  email: string;
  role: string;
}

export const useLeadInterviews = () => {
  const [leads, setLeads] = useState<LeadForInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'armed' | 'vehicle' | 'unassigned' | 'assigned' | 'mine'>('all');
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const { currentUser } = useAuth();
  const isSupplyAdmin = currentUser?.role === 'supply_admin';
  const isSupply = currentUser?.role === 'supply' || isSupplyAdmin;

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
      toast.error('Error al cargar usuarios de staff');
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    if (isSupplyAdmin) {
      fetchStaffUsers();
    }
  }, [currentUser?.uid, isSupplyAdmin]);

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ estado: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, estado: newStatus } : lead
      ));
      
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const assignLead = async (leadId: number, userId: string) => {
    if (!currentUser) return;
    
    try {
      // Update the lead with assigned_to and assigned_at
      const { error: leadError } = await supabase
        .from('leads')
        .update({ 
          assigned_to: userId, 
          assigned_at: new Date().toISOString() 
        })
        .eq('id', leadId);

      if (leadError) throw leadError;
      
      // Create a record in lead_assignments table
      const { error: assignmentError } = await supabase
        .from('lead_assignments')
        .insert({
          lead_id: leadId,
          assigned_to: userId,
          assigned_by: currentUser.uid,
          status: 'pending'
        });

      if (assignmentError) throw assignmentError;
      
      // Find the staff user name for UI update
      const staffUser = staffUsers.find(user => user.uid === userId);
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { 
          ...lead, 
          assigned_to: userId, 
          assigned_at: new Date().toISOString(),
          assignee_name: staffUser?.displayName || 'Unknown'
        } : lead
      ));
      
      toast.success('Asignado correctamente');
      
      // Refresh data to ensure consistency
      fetchLeads();
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast.error('Error al asignar el candidato');
    }
  };

  const unassignLead = async (leadId: number) => {
    if (!currentUser) return;
    
    try {
      // Remove assignment from lead
      const { error: leadError } = await supabase
        .from('leads')
        .update({ 
          assigned_to: null, 
          assigned_at: null 
        })
        .eq('id', leadId);

      if (leadError) throw leadError;
      
      // Set assignment status to 'cancelled'
      const { error: assignmentError } = await supabase
        .from('lead_assignments')
        .update({ status: 'cancelled' })
        .eq('lead_id', leadId)
        .eq('status', 'pending');

      if (assignmentError) throw assignmentError;
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { 
          ...lead, 
          assigned_to: null, 
          assigned_at: null,
          assignee_name: null
        } : lead
      ));
      
      toast.success('Asignación removida');
      
      // Refresh data
      fetchLeads();
    } catch (error) {
      console.error('Error unassigning lead:', error);
      toast.error('Error al remover la asignación');
    }
  };

  const classifyLead = async (leadId: number, type: 'armed' | 'vehicle') => {
    try {
      const updates: any = {
        estado: 'Clasificado',
      };
      
      if (type === 'armed') {
        updates.esarmado = 'SI';
        updates.empresa = 'Custodio (armado)';
      } else if (type === 'vehicle') {
        updates.tienevehiculo = 'SI';
        updates.empresa = 'Custodio (con vehículo)';
      }
      
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, ...updates } : lead
      ));
      
      toast.success(`Candidato clasificado como Custodio ${type === 'armed' ? 'Armado' : 'con Vehículo'}`);
    } catch (error) {
      console.error('Error classifying lead:', error);
      toast.error('Error al clasificar el candidato');
    }
  };

  // Filter leads based on the selected filter
  const filteredLeads = leads.filter(lead => {
    if (filter === 'all') return true;
    if (filter === 'armed') return lead.empresa?.includes('armado') || lead.esarmado === 'SI';
    if (filter === 'vehicle') return lead.empresa?.includes('vehículo') || lead.tienevehiculo === 'SI';
    if (filter === 'unassigned') return lead.assigned_to === null;
    if (filter === 'assigned') return lead.assigned_to !== null;
    if (filter === 'mine') return lead.assigned_to === currentUser?.uid;
    return true;
  });

  // Get new/unclassified leads
  const newLeads = leads.filter(lead => 
    lead.estado === 'Nuevo' || 
    (!lead.empresa?.includes('armado') && !lead.empresa?.includes('vehículo'))
  );

  // Get classified leads
  const classifiedLeads = leads.filter(lead => 
    lead.estado === 'Clasificado' || 
    lead.empresa?.includes('armado') || 
    lead.empresa?.includes('vehículo')
  );

  // Get scheduled leads
  const scheduledLeads = leads.filter(lead => 
    lead.estado === 'Agendado' || lead.estado === 'Contactado'
  );

  // Get unassigned leads
  const unassignedLeads = leads.filter(lead => lead.assigned_to === null);

  // Get assigned leads
  const assignedLeads = leads.filter(lead => lead.assigned_to !== null);

  // Get leads assigned to current user
  const myLeads = leads.filter(lead => lead.assigned_to === currentUser?.uid);

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
