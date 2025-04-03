
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
    if (!leadData.nombre || !leadData.email) {
      throw new Error('Missing required fields for lead creation');
    }
    
    // Format phone number if present - ensure it's a string
    let phoneNumber = leadData.telefono || '';
    
    // Only format if it's not empty
    if (phoneNumber) {
      // Remove any non-digit characters except +
      phoneNumber = phoneNumber.toString().replace(/[^\d+]/g, '');
      
      // Ensure it has international prefix
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+52${phoneNumber}`;
      }
    }
    
    // Prepare data for insertion - explicitly map to column names with proper defaults
    const insertData = {
      nombre: leadData.nombre,
      email: leadData.email,
      telefono: phoneNumber || null,
      empresa: leadData.empresa || 'Custodio',
      estado: leadData.estado || 'Nuevo',
      fuente: leadData.fuente || 'Landing',
      fecha_creacion: leadData.fecha_creacion || new Date().toISOString(),
      tienevehiculo: leadData.tienevehiculo || 'NO',
      experienciaseguridad: leadData.experienciaseguridad || 'NO',
      esmilitar: leadData.esmilitar || 'NO',
      credencialsedena: leadData.credencialsedena || 'NO',
      esarmado: leadData.esarmado || 'NO',
      modelovehiculo: leadData.modelovehiculo || null,
      anovehiculo: leadData.anovehiculo || null,
      valor: leadData.valor || 0
    };
    
    console.log('Inserting lead with formatted data:', insertData);
    
    // Insert data with error handling
    const { data, error } = await supabase
      .from('leads')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Error creating lead:', error);
      // Log more detailed error info
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Error message:', error.message);
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
