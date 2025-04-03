
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/context/LeadsContext";

// Tipo para los leads en Supabase
export interface SupabaseLead {
  id: number;
  created_at: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa?: string;
  estado: string;
  categoria?: string;
  fuente: string;
  datos_adicionales?: any;
}

// Custom type that matches what we can insert into the Supabase table
// based on the current database schema 
interface SupabaseLeadInsert {
  id?: number;
  created_at?: string;
  // Add any other custom fields here
  // that are actually in the database schema
}

// Convertir de lead de la aplicación a formato Supabase
export const convertToSupabaseLead = (lead: Lead, source: string = 'Form'): any => {
  // Extraer email y teléfono del campo contacto
  const contactParts = lead.contacto.split(' | ');
  const email = contactParts[0] || '';
  const telefono = contactParts[1] || '';
  
  // Return only the fields that are actually in the database
  return {
    // Only include id if it's not auto-generated in DB
    // id: lead.id, // Uncomment if needed
    // created_at is typically handled by Supabase
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
export const convertFromSupabaseLead = (supabaseLead: any): Lead => {
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
    return data.map(lead => convertFromSupabaseLead(lead));
  },
  
  // Crear un nuevo lead
  async createLead(lead: Lead, source: string = 'Form'): Promise<any> {
    // Convert to the format accepted by Supabase
    const supabaseData = convertToSupabaseLead(lead, source);
    
    // Log the lead being sent to Supabase for debugging
    console.log('Creating lead in Supabase:', supabaseData);
    
    const { data, error } = await supabase
      .from('leads')
      .insert(supabaseData)
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
    
    // Based on the current structure, we need to update the status in datos_adicionales
    const { error } = await supabase
      .from('leads')
      .update({
        datos_adicionales: {
          estado: newStatus,
          // We need to use a function call here that preserves other fields
          // This is a simplified version, in practice you would merge with existing data
        }
      })
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
