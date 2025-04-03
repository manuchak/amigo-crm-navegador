
import { supabase } from '@/integrations/supabase/client';

export interface LeadData {
  nombre?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  estado?: string;
  fuente?: string;
  original_id?: number;
  fecha_creacion?: string;
  tienevehiculo?: string;
  experienciaseguridad?: string;
  credencialsedena?: string;
  esmilitar?: string;
  esarmado?: string;
  modelovehiculo?: string;
  anovehiculo?: string;
  valor?: number;
}

export const fetchLeads = async () => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*');
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    console.info('Leads data from Supabase:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchLeads:', error);
    throw error;
  }
};

export const updateLeadStatus = async (id: number, estado: string) => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ estado })
      .eq('id', id);

    if (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateLeadStatus:', error);
    throw error;
  }
};

export const createLead = async (leadData: LeadData) => {
  try {
    console.log('Attempting to create lead with data:', leadData);
    
    // Ensure we have all the required fields
    if (!leadData.nombre || !leadData.email || !leadData.telefono) {
      throw new Error('Missing required fields for lead creation');
    }
    
    // Validate phone number format
    if (leadData.telefono && !leadData.telefono.startsWith('+')) {
      console.log('Adding + prefix to phone number');
      leadData.telefono = `+${leadData.telefono}`;
    }
    
    // Create a clean object with only the fields that exist in the database
    const cleanData = {
      nombre: leadData.nombre,
      email: leadData.email,
      telefono: leadData.telefono,
      empresa: leadData.empresa || 'Custodio',
      estado: leadData.estado || 'Nuevo',
      fuente: leadData.fuente || 'Landing',
      fecha_creacion: leadData.fecha_creacion || new Date().toISOString(),
      tienevehiculo: leadData.tienevehiculo || 'NO',
      experienciaseguridad: leadData.experienciaseguridad || 'NO',
      esmilitar: leadData.esmilitar || 'NO',
      valor: leadData.valor || 0
    };
    
    console.log('Inserting lead with sanitized data:', cleanData);
    
    const { data, error } = await supabase
      .from('leads')
      .insert([cleanData])
      .select();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
    
    console.log('Lead created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createLead:', error);
    throw error;
  }
};

export const deleteLead = async (id: number) => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteLead:', error);
    throw error;
  }
};
