
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/context/LeadsContext";

// Tipo para los leads en Supabase
export interface SupabaseLead {
  id: number;
  created_at: string;
  datos_adicionales?: any;
}

// Convertir de lead de la aplicación a formato Supabase
export const convertToSupabaseLead = (lead: Lead, source: string = 'Form'): any => {
  // Extraer email y teléfono del campo contacto
  const contactParts = lead.contacto.split(' | ');
  const email = contactParts[0] || '';
  const telefono = contactParts[1] || '';
  
  // Return the structure that matches our database
  return {
    datos_adicionales: {
      nombre: lead.nombre,
      email,
      telefono,
      empresa: lead.empresa,
      estado: lead.estado,
      fuente: source,
      original_id: lead.id,
      fecha_creacion: lead.fechaCreacion
    }
  };
};

// Convertir de formato Supabase a lead de la aplicación
export const convertFromSupabaseLead = (supabaseLead: SupabaseLead): Lead => {
  const datos = supabaseLead.datos_adicionales || {};
  
  return {
    id: datos.original_id || Date.now(),
    nombre: datos.nombre || '',
    empresa: datos.empresa || '',
    contacto: `${datos.email || ''} | ${datos.telefono || ''}`,
    estado: datos.estado || 'Nuevo',
    fechaCreacion: datos.fecha_creacion || new Date(supabaseLead.created_at).toISOString().split('T')[0]
  };
};

// Servicio para manejar operaciones con leads
export const leadService = {
  // Obtener todos los leads
  async getLeads(): Promise<Lead[]> {
    console.log("Fetching leads from Supabase");
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    console.log("Leads data from Supabase:", data);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convert the data to our app's Lead format
    return data.map(lead => convertFromSupabaseLead(lead as SupabaseLead));
  },
  
  // Crear un nuevo lead
  async createLead(lead: Lead, source: string = 'Form'): Promise<any> {
    // Convert to the format accepted by Supabase
    const supabaseData = convertToSupabaseLead(lead, source);
    
    // Log the lead being sent to Supabase for debugging
    console.log('Creating lead in Supabase:', supabaseData);
    
    const { data, error } = await supabase
      .from('leads')
      .insert([supabaseData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
    
    console.log('Lead created successfully:', data);
    return data;
  },
  
  // Actualizar un lead existente
  async updateLeadStatus(leadId: number, newStatus: string): Promise<void> {
    console.log(`Updating lead ${leadId} status to ${newStatus}`);
    
    // Get the current record first to preserve other datos_adicionales fields
    const { data: currentRecord, error: fetchError } = await supabase
      .from('leads')
      .select('datos_adicionales')
      .eq('datos_adicionales->original_id', String(leadId))
      .single();
      
    if (fetchError) {
      console.error('Error fetching lead for update:', fetchError);
      throw fetchError;
    }
    
    if (!currentRecord) {
      console.error('Lead not found for update');
      throw new Error('Lead not found');
    }
    
    // Update the estado field while preserving other datos_adicionales
    const updatedData = {
      datos_adicionales: {
        ...currentRecord.datos_adicionales,
        estado: newStatus
      }
    };
    
    const { error } = await supabase
      .from('leads')
      .update(updatedData)
      .eq('datos_adicionales->original_id', String(leadId));
      
    if (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  },
  
  // Eliminar un lead
  async deleteLead(leadId: number): Promise<void> {
    console.log(`Deleting lead ${leadId}`);
    
    // Delete based on the original_id stored in datos_adicionales
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('datos_adicionales->original_id', String(leadId));
      
    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }
};
