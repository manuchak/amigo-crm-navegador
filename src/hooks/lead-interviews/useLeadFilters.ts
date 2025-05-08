
import { useState, useMemo } from 'react';
import { LeadForInterview, LeadFilter } from './types';
import { useAuth } from '@/context/auth/AuthContext';

export const useLeadFilters = (leads: LeadForInterview[]) => {
  const [filter, setFilter] = useState<LeadFilter>('all');
  const { currentUser } = useAuth();

  // Filter leads based on the selected filter
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filter === 'all') return true;
      if (filter === 'armed') return lead.empresa?.includes('armado') || lead.esarmado === 'SI';
      if (filter === 'vehicle') return lead.empresa?.includes('vehículo') || lead.tienevehiculo === 'SI';
      if (filter === 'unassigned') return lead.assigned_to === null;
      if (filter === 'assigned') return lead.assigned_to !== null;
      if (filter === 'mine') return lead.assigned_to === currentUser?.uid;
      return true;
    });
  }, [leads, filter, currentUser?.uid]);

  // Get categorized leads for different views
  const newLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.estado === 'Nuevo' || 
      (!lead.empresa?.includes('armado') && !lead.empresa?.includes('vehículo'))
    );
  }, [leads]);

  const classifiedLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.estado === 'Clasificado' || 
      lead.empresa?.includes('armado') || 
      lead.empresa?.includes('vehículo')
    );
  }, [leads]);

  const scheduledLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.estado === 'Agendado' || lead.estado === 'Contactado'
    );
  }, [leads]);

  const unassignedLeads = useMemo(() => {
    return leads.filter(lead => lead.assigned_to === null);
  }, [leads]);

  const assignedLeads = useMemo(() => {
    return leads.filter(lead => lead.assigned_to !== null);
  }, [leads]);

  const myLeads = useMemo(() => {
    return leads.filter(lead => lead.assigned_to === currentUser?.uid);
  }, [leads, currentUser?.uid]);

  return {
    filter,
    setFilter,
    filteredLeads,
    newLeads,
    classifiedLeads,
    scheduledLeads,
    unassignedLeads,
    assignedLeads,
    myLeads
  };
};
