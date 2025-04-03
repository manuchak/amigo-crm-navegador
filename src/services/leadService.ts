
import { supabase } from '@/integrations/supabase/client';

export interface LeadData {
  nombre?: string;
  email?: string;
  telefono?: number | null; // Changed to match expected database type
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
    
    // Prepare data for insertion - explicitly match database column types
    const insertData = {
      nombre: leadData.nombre,
      email: leadData.email,
      telefono: leadData.telefono, // Already formatted as number in useLeadForm
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
      // For authenticated users in the admin panel, let's try the direct REST API method first
      try {
        // Create the lead using a direct REST API request with public access (works even when authenticated)
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
          throw new Error(`API error: ${response.statusText}`);
        }

        console.log('Lead created successfully via direct API (admin panel)');
        return { success: true };
      } catch (directApiError) {
        console.error('Direct API failed, falling back to supabase client:', directApiError);
        
        // Fall back to supabase client if direct API fails
        const { data, error } = await supabase
          .from('leads')
          .insert(insertData)
          .select();

        if (error) {
          console.error('Error creating lead with supabase client:', error);
          throw error;
        }
        
        console.log('Lead created successfully with supabase client:', data);
        return data;
      }
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
