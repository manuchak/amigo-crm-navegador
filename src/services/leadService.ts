
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
  call_count?: number;
  last_call_date?: string;
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
  callCount?: number;
  lastCallDate?: string;
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
    valor: lead.valor || undefined,
    callCount: lead.call_count,
    lastCallDate: lead.last_call_date ? new Date(lead.last_call_date).toLocaleDateString('es-MX') : undefined
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
    
    return normalizeLeads(data as SupabaseLead[] || []);
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
        valor: leadData.valor || null,
        call_count: 0 // Initialize call count to zero
      } as any])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    // Convert response to Lead format
    const normalizedLead: Lead = {
      id: data?.id || 0,
      nombre: data?.nombre || 'Sin nombre',
      empresa: data?.empresa || 'Desconocida',
      contacto: data?.email && data?.telefono 
        ? `${data.email} | ${data.telefono}` 
        : data?.email || data?.telefono || 'Sin contacto',
      estado: data?.estado || 'Nuevo',
      fechaCreacion: data?.fecha_creacion 
        ? new Date(data.fecha_creacion).toLocaleDateString('es-MX') 
        : 'Fecha desconocida',
      valor: data?.valor || undefined,
      callCount: data?.call_count
    };
    
    return normalizedLead;
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
      .update({ estado } as any)
      .eq('id', id as any);
    
    if (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateLeadStatus:', error);
    throw error;
  }
};

// Add deleteLead function to fix the missing method error
export const deleteLead = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id as any);
    
    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteLead:', error);
    throw error;
  }
};

// Function to increment the call count for a lead
export const incrementCallCount = async (leadId: number): Promise<void> => {
  try {
    // First, let's get the current call count
    const { data: leadData, error: fetchError } = await supabase
      .from('leads')
      .select('call_count')
      .eq('id', leadId as any)
      .single();
    
    if (fetchError) {
      console.error('Error fetching lead call count:', fetchError);
      throw fetchError;
    }
    
    // Calculate the new call count
    const newCallCount = (leadData?.call_count || 0) + 1;
    
    // Update the lead with the new call count and timestamp
    const { error } = await supabase
      .from('leads')
      .update({ 
        call_count: newCallCount,
        last_call_date: new Date().toISOString()
      } as any)
      .eq('id', leadId as any);
    
    if (error) {
      console.error('Error incrementing call count:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in incrementCallCount:', error);
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
