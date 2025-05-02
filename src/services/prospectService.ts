
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
  
  // Add these missing boolean properties from custodio_validations
  has_security_experience: boolean | null;
  has_firearm_license: boolean | null;
  has_military_background: boolean | null;
  
  // Add the ended_reason field to store the latest call ended reason
  ended_reason: string | null;
}

export async function getProspects(): Promise<Prospect[]> {
  try {
    console.log("Fetching all prospects from database");
    // We need to use raw SQL query instead of RPC because of type issues
    const { data, error } = await supabase
      .from('prospects')
      .select('*');
    
    if (error) {
      console.error("Error fetching prospects:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} prospects`);
    
    // After getting prospects, fetch the latest ended_reason for each one
    const enrichedProspects = await enrichProspectsWithEndedReason(data as Prospect[]);
    
    return enrichedProspects || [];
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
    
    if (data) {
      // Enrich the prospect with ended_reason
      const enrichedProspects = await enrichProspectsWithEndedReason([data as Prospect]);
      return enrichedProspects[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch prospect with ID ${leadId}:`, error);
    throw error;
  }
}

export async function getProspectsByStatus(status: string): Promise<Prospect[]> {
  try {
    console.log(`Fetching prospects with status: ${status}`);
    // We need to use raw SQL query instead of RPC because of type issues
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('lead_status', status);
    
    if (error) {
      console.error(`Error fetching prospects with status ${status}:`, error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} prospects with status ${status}`);
    
    // After getting prospects, fetch the latest ended_reason for each one
    const enrichedProspects = await enrichProspectsWithEndedReason(data as Prospect[]);
    
    return enrichedProspects || [];
  } catch (error) {
    console.error(`Failed to fetch prospects with status ${status}:`, error);
    throw error;
  }
}

/**
 * Enriches prospect data with the latest ended_reason from vapi_call_logs
 */
async function enrichProspectsWithEndedReason(prospects: Prospect[]): Promise<Prospect[]> {
  if (!prospects || prospects.length === 0) {
    return [];
  }
  
  console.log(`Enriching ${prospects.length} prospects with ended_reason data`);
  
  // Process in batches to avoid performance issues with large datasets
  const batchSize = 50;
  const enrichedProspects: Prospect[] = [];
  
  for (let i = 0; i < prospects.length; i += batchSize) {
    const batch = prospects.slice(i, i + batchSize);
    // Get all phone numbers from the batch, handling both lead_phone and phone_number_intl
    // Also filter out null values and ensure they're properly formatted
    const phoneNumbers = batch
      .map(p => {
        const phones: string[] = [];
        if (p.lead_phone) phones.push(p.lead_phone);
        if (p.phone_number_intl && p.phone_number_intl !== p.lead_phone) phones.push(p.phone_number_intl);
        return phones;
      })
      .flat()
      .filter(phone => !!phone && phone.trim() !== '');
    
    if (phoneNumbers.length === 0) {
      // No phone numbers to query, add batch as-is
      console.log(`Batch ${i/batchSize + 1}: No valid phone numbers found, skipping call log lookup`);
      enrichedProspects.push(...batch);
      continue;
    }
    
    try {
      console.log(`Batch ${i/batchSize + 1}: Querying call logs for ${phoneNumbers.length} phone numbers`);
      
      // Get all the call logs for each phone number in this batch, ordered by most recent
      const { data: callLogs, error } = await supabase
        .from('vapi_call_logs')
        .select('customer_number, ended_reason, start_time')
        .in('customer_number', phoneNumbers)
        .order('start_time', { ascending: false });
      
      if (error) {
        console.error("Error fetching call logs for ended_reason:", error);
        enrichedProspects.push(...batch);
        continue;
      }
      
      if (!callLogs || callLogs.length === 0) {
        console.log(`No call logs found for current batch of phone numbers. Trying alternative phone fields...`);
        
        // Try with caller_phone_number as a fallback
        const { data: altCallLogs, error: altError } = await supabase
          .from('vapi_call_logs')
          .select('caller_phone_number, ended_reason, start_time')
          .in('caller_phone_number', phoneNumbers)
          .order('start_time', { ascending: false });
        
        if (altError || !altCallLogs || altCallLogs.length === 0) {
          console.log("No alternative call logs found either. Setting ended_reason to null.");
          enrichedProspects.push(...batch);
          continue;
        }
        
        // Create a map of phone numbers to their latest ended_reason using alternative field
        const phoneToEndedReason: Record<string, string> = {};
        
        altCallLogs.forEach(log => {
          if (log.caller_phone_number && !phoneToEndedReason[log.caller_phone_number]) {
            phoneToEndedReason[log.caller_phone_number] = log.ended_reason || null;
            console.log(`Found ended_reason "${log.ended_reason}" for phone ${log.caller_phone_number}`);
          }
        });
        
        // Enrich each prospect with its ended_reason
        batch.forEach(prospect => {
          const phones = [];
          if (prospect.lead_phone) phones.push(prospect.lead_phone);
          if (prospect.phone_number_intl) phones.push(prospect.phone_number_intl);
          
          // Check all phone numbers for this prospect
          for (const phone of phones) {
            if (phone && phoneToEndedReason[phone]) {
              prospect.ended_reason = phoneToEndedReason[phone];
              console.log(`Assigned ended_reason "${prospect.ended_reason}" to prospect ${prospect.lead_id} using phone ${phone}`);
              break;
            }
          }
        });
        
        enrichedProspects.push(...batch);
        continue;
      }
      
      // Create a map of phone numbers to their latest ended_reason
      const phoneToEndedReason: Record<string, string> = {};
      
      callLogs.forEach(log => {
        if (log.customer_number && !phoneToEndedReason[log.customer_number]) {
          phoneToEndedReason[log.customer_number] = log.ended_reason || null;
          console.log(`Found ended_reason "${log.ended_reason}" for phone ${log.customer_number}`);
        }
      });
      
      // Enrich each prospect with its ended_reason
      batch.forEach(prospect => {
        const phones = [];
        if (prospect.lead_phone) phones.push(prospect.lead_phone);
        if (prospect.phone_number_intl) phones.push(prospect.phone_number_intl);
        
        // Log the values for debugging
        if (prospect.call_count > 0) {
          console.log(`Prospect ${prospect.lead_id} (${prospect.lead_name}) has call_count ${prospect.call_count} but ended_reason: ${prospect.ended_reason || 'null'}`);
        }
        
        // Check all phone numbers for this prospect
        for (const phone of phones) {
          if (phone && phoneToEndedReason[phone]) {
            prospect.ended_reason = phoneToEndedReason[phone];
            console.log(`Assigned ended_reason "${prospect.ended_reason}" to prospect ${prospect.lead_id} using phone ${phone}`);
            break;
          }
        }
        
        // If no ended_reason found but call_count > 0, set a default value
        if (!prospect.ended_reason && prospect.call_count > 0) {
          prospect.ended_reason = "Unknown";
          console.log(`Set default "Unknown" ended_reason for prospect ${prospect.lead_id} with call count ${prospect.call_count}`);
        }
      });
      
      enrichedProspects.push(...batch);
    } catch (error) {
      console.error("Error enriching prospects with ended_reason:", error);
      enrichedProspects.push(...batch);
    }
  }
  
  console.log(`Completed enriching prospects with ended_reason data. ${enrichedProspects.filter(p => p.ended_reason).length} prospects have an ended_reason.`);
  return enrichedProspects;
}
