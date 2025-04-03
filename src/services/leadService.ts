
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Define types for Lead data
export interface LeadData {
  nombre: string;
  email: string;
  telefono: string; // Changed to string to match Supabase schema
  empresa: string;
  estado: string;
  fuente: string;
  fecha_creacion: string;
  tienevehiculo: string;
  experienciaseguridad: string;
  esmilitar: string;
  credencialsedena: string;
  esarmado: string;
  anovehiculo?: string;
  modelovehiculo?: string;
  valor?: number;
}

// Normalized Lead data for frontend display
export interface Lead {
  id: number;
  nombre: string;
  empresa: string;
  contacto: string;
  estado: string;
  fechaCreacion: string;
  valor?: number;
}

// Original Supabase Lead shape
type SupabaseLead = Database['public']['Tables']['leads']['Row'];

// Function to convert Supabase lead to normalized Lead
export const normalizeLeads = (leads: SupabaseLead[]): Lead[] => {
  return leads.map(lead => ({
    id: lead.id,
    nombre: lead.nombre || 'Sin nombre',
    empresa: lead.empresa || 'Desconocida',
    contacto: lead.email && lead.telefono 
      ? `${lead.email} | ${lead.telefono}` 
      : lead.email || lead.telefono || 'Sin contacto',
    estado: lead.estado || 'Nuevo',
    fechaCreacion: lead.fecha_creacion 
      ? new Date(lead.fecha_creacion).toLocaleDateString('es-MX') 
      : 'Fecha desconocida',
    valor: lead.valor || undefined
  }));
};

// Get all leads
export const getLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    return normalizeLeads(data || []);
  } catch (error) {
    console.error('Error in getLeads:', error);
    throw error;
  }
};

// Create a new lead
export const createLead = async (leadData: LeadData): Promise<Lead> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        nombre: leadData.nombre,
        email: leadData.email,
        telefono: leadData.telefono, // Now correctly as string
        empresa: leadData.empresa,
        estado: leadData.estado,
        fuente: leadData.fuente,
        fecha_creacion: leadData.fecha_creacion,
        tienevehiculo: leadData.tienevehiculo,
        experienciaseguridad: leadData.experienciaseguridad,
        esmilitar: leadData.esmilitar,
        credencialsedena: leadData.credencialsedena,
        esarmado: leadData.esarmado,
        anovehiculo: leadData.anovehiculo || null,
        modelovehiculo: leadData.modelovehiculo || null,
        valor: leadData.valor || null
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
    
    // Convert to normalized Lead format
    return {
      id: data.id,
      nombre: data.nombre || 'Sin nombre',
      empresa: data.empresa || 'Desconocida',
      contacto: data.email && data.telefono 
        ? `${data.email} | ${data.telefono}` 
        : data.email || data.telefono || 'Sin contacto',
      estado: data.estado || 'Nuevo',
      fechaCreacion: data.fecha_creacion 
        ? new Date(data.fecha_creacion).toLocaleDateString('es-MX') 
        : 'Fecha desconocida',
      valor: data.valor || undefined
    };
  } catch (error) {
    console.error('Error in createLead:', error);
    throw error;
  }
};

// Update lead status
export const updateLeadStatus = async (id: number, estado: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ estado })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateLeadStatus:', error);
    throw error;
  }
};

// Direct API call to create lead
export const createLeadDirectAPI = async (leadData: LeadData): Promise<any> => {
  try {
    const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/leads`;
    const API_KEY = import.meta.env.VITE_SUPABASE_KEY;
    
    if (!API_URL || !API_KEY) {
      throw new Error('Supabase API configuration missing');
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
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
        anovehiculo: leadData.anovehiculo || null,
        modelovehiculo: leadData.modelovehiculo || null,
        valor: leadData.valor || null
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Direct API error:', errorData);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in direct API call:', error);
    throw error;
  }
};
