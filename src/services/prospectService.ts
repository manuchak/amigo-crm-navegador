
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
    const { data, error } = await supabase
      .rpc('get_all_prospects')
      .returns<Prospect[]>();
    
    if (error) {
      console.error("Error fetching prospects:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Failed to fetch prospects:", error);
    throw error;
  }
}

export async function getProspectById(leadId: number): Promise<Prospect | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_prospect_by_id', { p_lead_id: leadId })
      .returns<Prospect[]>();
    
    if (error) {
      console.error(`Error fetching prospect with ID ${leadId}:`, error);
      throw error;
    }
    
    // We expect only one result, or null
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Failed to fetch prospect with ID ${leadId}:`, error);
    throw error;
  }
}

export async function getProspectsByStatus(status: string): Promise<Prospect[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_prospects_by_status', { p_status: status })
      .returns<Prospect[]>();
    
    if (error) {
      console.error(`Error fetching prospects with status ${status}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error(`Failed to fetch prospects with status ${status}:`, error);
    throw error;
  }
}
