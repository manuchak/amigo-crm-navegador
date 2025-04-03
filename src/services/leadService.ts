
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
    
    // Format phone number - ensure it's a string and has international prefix
    let phoneNumber = leadData.telefono;
    if (typeof phoneNumber === 'string') {
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+${phoneNumber}`;
      }
    } else {
      console.error('Phone number is not a string:', phoneNumber);
      throw new Error('Phone number format is invalid');
    }
    
    // Prepare data for insertion - explicitly map to column names
    const insertData = {
      nombre: leadData.nombre,
      email: leadData.email,
      telefono: phoneNumber,
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
    
    // First, attempt to fetch database schema to verify columns
    const { error: schemaError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
      
    if (schemaError) {
      console.error('Error checking leads table schema:', schemaError);
    }
    
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
