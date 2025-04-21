
import { supabase } from "@/integrations/supabase/client";

export interface Prospect {
  lead_id: number;
  lead_name: string | null;
  lead_phone: string | null;
  lead_email: string | null;
  lead_status: string | null;
  lead_created_at: string | null;
  lead_source: string | null;
  call_count: number | null;
  last_call_date: string | null;
  
  validated_lead_id: number | null;
  custodio_name: string | null;
  car_brand: string | null;
  car_model: string | null;
  car_year: number | null;
  security_exp: string | null;
  sedena_id: string | null;
  phone_number_intl: string | null;
  validation_date: string | null;
  
  call_log_id: string | null;
  vapi_log_id: string | null;
  call_status: string | null;
  call_duration: number | null;
  call_start_time: string | null;
  recording_url: string | null;
  transcript: any | null;
}

export async function getProspects(): Promise<Prospect[]> {
  try {
    // We need to use raw SQL query instead of RPC because of type issues
    const { data, error } = await supabase
      .from('prospects')
      .select('*');
    
    if (error) {
      console.error("Error fetching prospects:", error);
      throw error;
    }
    
    return data as Prospect[] || [];
  } catch (error) {
    console.error("Failed to fetch prospects:", error);
    throw error;
  }
}

export async function getProspectById(leadId: number): Promise<Prospect | null> {
  try {
    // We need to use raw SQL query instead of RPC because of type issues
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('lead_id', leadId)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching prospect with ID ${leadId}:`, error);
      throw error;
    }
    
    return data as Prospect | null;
  } catch (error) {
    console.error(`Failed to fetch prospect with ID ${leadId}:`, error);
    throw error;
  }
}

export async function getProspectsByStatus(status: string): Promise<Prospect[]> {
  try {
    // We need to use raw SQL query instead of RPC because of type issues
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('lead_status', status);
    
    if (error) {
      console.error(`Error fetching prospects with status ${status}:`, error);
      throw error;
    }
    
    return data as Prospect[] || [];
  } catch (error) {
    console.error(`Failed to fetch prospects with status ${status}:`, error);
    throw error;
  }
}
