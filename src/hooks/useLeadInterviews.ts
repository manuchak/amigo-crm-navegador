
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

export const useLeadInterviews = () => {
  const [leads, setLeads] = useState<LeadForInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'armed' | 'vehicle'>('all');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setLeads(data as LeadForInterview[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Error al cargar los candidatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

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

  return {
    leads: filteredLeads,
    newLeads,
    classifiedLeads,
    scheduledLeads,
    loading,
    filter,
    setFilter,
    fetchLeads,
    updateLeadStatus,
    classifyLead
  };
};
