
import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: number;
  nombre: string;
  empresa: string;
  contacto: string;
  estado: string;
  fechaCreacion: string;
  email?: string;
  telefono?: string;
  tieneVehiculo?: string;
  experienciaSeguridad?: string;
  esMilitar?: string;
  callCount?: number;
  lastCallDate?: string;
  valor?: number;
}

// Update the LeadData interface to include the new field
export interface LeadData {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  estado: string;
  fuente: string;
  fecha_creacion: string;
  tienevehiculo?: string | null;
  experienciaseguridad?: string | null;
  esmilitar?: string | null;
  credencialsedena?: string | null;
  esarmado?: string | null;
  modelovehiculo?: string | null;
  anovehiculo?: string | null;
  valor?: number | null;
}

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const { data: leadsData, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    // Transform the data to match the Lead interface
    const leads: Lead[] = leadsData.map(lead => ({
      id: lead.id,
      nombre: lead.nombre || '',
      empresa: lead.empresa || '',
      contacto: `${lead.email || ''} | ${lead.telefono || ''}`,
      estado: lead.estado || 'Nuevo',
      fechaCreacion: new Date(lead.fecha_creacion || lead.created_at).toISOString().split('T')[0],
      email: lead.email,
      telefono: lead.telefono,
      tieneVehiculo: lead.tienevehiculo,
      experienciaSeguridad: lead.experienciaseguridad,
      esMilitar: lead.esmilitar,
      callCount: lead.call_count,
      lastCallDate: lead.last_call_date,
      valor: lead.valor
    }));

    return leads;
  } catch (error) {
    console.error('Error getting leads:', error);
    throw error;
  }
};

export const updateLeadStatus = async (leadId: number, newStatus: string) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update({ estado: newStatus })
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
};

export const createLead = async (leadData: LeadData) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        nombre: leadData.nombre,
        email: leadData.email,
        telefono: leadData.telefono,
        empresa: leadData.empresa,
        estado: leadData.estado,
        fuente: leadData.fuente,
        fecha_creacion: leadData.fecha_creacion,
        tienevehiculo: leadData.tienevehiculo,
        experienciaseguridad: leadData.experienciaseguridad,
        esmilitar: leadData.esmilitar,
        credencialsedena: leadData.credencialsedena,
        esarmado: leadData.esarmado,
        modelovehiculo: leadData.modelovehiculo,
        anovehiculo: leadData.anovehiculo,
        valor: leadData.valor || 0
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
};

// Add the missing createLeadDirectAPI function
export const createLeadDirectAPI = async (leadData: LeadData) => {
  // This function is similar to createLead but can be used directly from the API
  // or webhook handlers without any transformation
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        nombre: leadData.nombre,
        email: leadData.email,
        telefono: leadData.telefono,
        empresa: leadData.empresa,
        estado: leadData.estado,
        fuente: leadData.fuente,
        fecha_creacion: leadData.fecha_creacion,
        tienevehiculo: leadData.tienevehiculo,
        experienciaseguridad: leadData.experienciaseguridad,
        esmilitar: leadData.esmilitar,
        credencialsedena: leadData.credencialsedena,
        esarmado: leadData.esarmado,
        modelovehiculo: leadData.modelovehiculo,
        anovehiculo: leadData.anovehiculo,
        valor: leadData.valor || 0
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating lead from API:', error);
    throw error;
  }
};

export const deleteLead = async (leadId: number) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};

// Add the missing incrementCallCount function
export const incrementCallCount = async (leadId: number) => {
  try {
    // Get the current call count first
    const { data: leadData, error: fetchError } = await supabase
      .from('leads')
      .select('call_count')
      .eq('id', leadId)
      .single();

    if (fetchError) {
      console.error('Error fetching lead call count:', fetchError);
      throw fetchError;
    }

    // Increment the call count
    const currentCallCount = leadData?.call_count || 0;
    const newCallCount = currentCallCount + 1;
    
    // Update the lead with the new call count and last call date
    const { data, error } = await supabase
      .from('leads')
      .update({
        call_count: newCallCount,
        last_call_date: new Date().toISOString()
      })
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('Error updating lead call count:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error incrementing call count:', error);
    throw error;
  }
};
