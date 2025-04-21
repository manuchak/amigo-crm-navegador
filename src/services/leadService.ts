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
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    return leads || [];
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
