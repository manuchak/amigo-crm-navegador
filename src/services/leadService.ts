
import { supabase } from '@/integrations/supabase/client';

export interface LeadData {
  nombre?: string;
  email?: string;
  telefono?: string | number;
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
  modelovehiculo?: string | null;
  anovehiculo?: string | null;
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
    
    // Format phone number if present - ensure it's a number for Supabase
    let phoneNumber: number | null = null;
    
    // Only format if it's not empty
    if (leadData.telefono) {
      // Remove any non-digit characters except +
      const cleanedPhone = leadData.telefono.toString().replace(/[^\d+]/g, '');
      
      // Remove the + if present and convert to number
      phoneNumber = Number(cleanedPhone.replace('+', ''));
      
      // Check if valid number
      if (isNaN(phoneNumber)) {
        console.warn('Invalid phone number format, setting to null');
        phoneNumber = null;
      }
    }
    
    // Prepare data for insertion - explicitly match database column types
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

    // For anonymous form submissions, we'll create a fetch request to a serverless function
    if (leadData.fuente === 'Landing') {
      try {
        // Create the lead using a direct REST API request with public access
        const response = await fetch('https://beefjsdgrdeiymzxwxru.supabase.co/rest/v1/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(insertData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Direct API error:', errorData);
          throw new Error(`API error: ${errorData.message || response.statusText}`);
        }

        console.log('Lead created successfully via direct API');
        return { success: true };
      } catch (directApiError) {
        console.error('Error with direct API call:', directApiError);
        throw directApiError;
      }
    } else {
      // For authenticated users, use the Supabase client
      const { data, error } = await supabase
        .from('leads')
        .insert(insertData)
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
    }
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
