
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

// Convertir de lead de la aplicación a formato Supabase
export const convertToSupabaseLead = (lead: Lead, source: string = 'Form'): Omit<SupabaseLead, 'id' | 'created_at'> => {
  // Extraer email y teléfono del campo contacto
  const contactParts = lead.contacto.split(' | ');
  const email = contactParts[0] || '';
  const telefono = contactParts[1] || '';
  
  return {
    nombre: lead.nombre,
    email,
    telefono,
    empresa: lead.empresa,
    estado: lead.estado,
    fuente: source,
    datos_adicionales: {
      original_id: lead.id,
      fecha_creacion: lead.fechaCreacion
    }
  };
};

// Convertir de formato Supabase a lead de la aplicación
export const convertFromSupabaseLead = (supabaseLead: SupabaseLead): Lead => {
  return {
    id: supabaseLead.datos_adicionales?.original_id || Date.now(),
    nombre: supabaseLead.nombre,
    empresa: supabaseLead.empresa || '',
    contacto: `${supabaseLead.email} | ${supabaseLead.telefono}`,
    estado: supabaseLead.estado,
    fechaCreacion: supabaseLead.datos_adicionales?.fecha_creacion || new Date(supabaseLead.created_at).toISOString().split('T')[0]
  };
};

// Servicio para manejar operaciones con leads
export const leadService = {
  // Obtener todos los leads
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Ensure data has the required fields before converting
    return data.filter((lead: any) => 
      lead.nombre && lead.email && lead.telefono && lead.estado
    ).map(lead => convertFromSupabaseLead(lead as SupabaseLead));
  },
  
  // Crear un nuevo lead
  async createLead(lead: Lead, source: string = 'Form'): Promise<SupabaseLead> {
    const supabaseLead = convertToSupabaseLead(lead, source);
    
    // Log the lead being sent to Supabase for debugging
    console.log('Creating lead in Supabase:', supabaseLead);
    
    const { data, error } = await supabase
      .from('leads')
      .insert([supabaseLead])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
    
    return data as SupabaseLead;
  },
  
  // Actualizar un lead existente
  async updateLeadStatus(leadId: number, newStatus: string): Promise<void> {
    // Primero obtenemos el lead por su ID original en datos_adicionales
    const { data: existingLeads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('datos_adicionales->>original_id', String(leadId));
      
    if (fetchError) {
      console.error('Error fetching lead for update:', fetchError);
      throw fetchError;
    }
    
    if (!existingLeads || existingLeads.length === 0) {
      console.error('Lead not found for update');
      throw new Error('Lead not found');
    }
    
    const existingLead = existingLeads[0];
    
    // Ahora actualizamos el estado
    const { error: updateError } = await supabase
      .from('leads')
      .update({ estado: newStatus })
      .eq('id', existingLead.id);
      
    if (updateError) {
      console.error('Error updating lead status:', updateError);
      throw updateError;
    }
  },
  
  // Eliminar un lead
  async deleteLead(leadId: number): Promise<void> {
    // Primero obtenemos el lead por su ID original en datos_adicionales
    const { data: existingLeads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('datos_adicionales->>original_id', String(leadId));
      
    if (fetchError) {
      console.error('Error fetching lead for delete:', fetchError);
      throw fetchError;
    }
    
    if (!existingLeads || existingLeads.length === 0) {
      console.error('Lead not found for delete');
      throw new Error('Lead not found');
    }
    
    const existingLead = existingLeads[0];
    
    // Ahora eliminamos el lead
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', existingLead.id);
      
    if (deleteError) {
      console.error('Error deleting lead:', deleteError);
      throw deleteError;
    }
  }
};
