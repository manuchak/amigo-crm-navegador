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
    
    // After getting prospects, fetch the latest ended_reason for each one using phone number as link
    const enrichedProspects = await enrichProspectsWithEndedReason(data as Prospect[]);
    
    // Mark prospects with no call logs as "No Llamado"
    const prospectsWithCallStatus = markProspectsWithNoCallStatus(enrichedProspects);
    
    return prospectsWithCallStatus || [];
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
      // Enrich the prospect with ended_reason using phone number as the key
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
    
    // Mark prospects with no call logs as "No Llamado"
    const prospectsWithCallStatus = markProspectsWithNoCallStatus(enrichedProspects);
    
    return prospectsWithCallStatus || [];
  } catch (error) {
    console.error(`Failed to fetch prospects with status ${status}:`, error);
    throw error;
  }
}

/**
 * Normaliza diferentes formatos de ended_reason a un formato estándar
 */
function normalizeEndedReason(reason: string | null): string | null {
  if (!reason) return null;
  
  const lowerReason = reason.toLowerCase();
  
  if (lowerReason.includes('complete')) return 'completed';
  if (lowerReason.includes('no-answer') || lowerReason.includes('no answer')) return 'no-answer';
  if (lowerReason.includes('busy') || lowerReason.includes('ocupado')) return 'busy';
  if (lowerReason.includes('fail')) return 'failed';
  if (lowerReason.includes('assistant-ended-call-with-hangup-task')) return 'contacted';
  
  return reason;
}

/**
 * Enriches prospect data with the latest ended_reason from vapi_call_logs
 * ALWAYS using phone number as the primary linking field between tables
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
    
    // Extract all phone numbers from the prospects in this batch
    // We'll query for ALL phone fields available to ensure maximum linkage
    const phoneNumbers: string[] = [];
    
    batch.forEach(p => {
      // Collect ALL phone fields from each prospect
      if (p.lead_phone && p.lead_phone.trim() !== '') phoneNumbers.push(p.lead_phone.trim());
      if (p.phone_number_intl && p.phone_number_intl.trim() !== '' && 
          p.phone_number_intl !== p.lead_phone) {
        phoneNumbers.push(p.phone_number_intl.trim());
      }
    });
    
    // Filter out any empty or duplicate phone numbers
    const uniquePhoneNumbers = [...new Set(phoneNumbers.filter(phone => !!phone))];
    
    if (uniquePhoneNumbers.length === 0) {
      // No valid phone numbers to query, add batch as-is
      console.log(`Batch ${i/batchSize + 1}: No valid phone numbers found, skipping call log lookup`);
      enrichedProspects.push(...batch);
      continue;
    }
    
    try {
      console.log(`Batch ${i/batchSize + 1}: Querying call logs for ${uniquePhoneNumbers.length} unique phone numbers`);
      
      // First prioritized search: customer_number exact match
      const { data: exactMatches, error: exactError } = await supabase
        .from('vapi_call_logs')
        .select('customer_number, ended_reason, start_time')
        .in('customer_number', uniquePhoneNumbers)
        .order('start_time', { ascending: false });
      
      if (exactError) {
        console.error("Error fetching exact matches for call logs:", exactError);
      }
      
      // Second search: check for partial matches in all phone fields
      const partialSearchPromises = uniquePhoneNumbers.map(async (phone) => {
        // Extract the last 10 digits for more flexible matching
        const lastTenDigits = phone.replace(/\D/g, '').slice(-10);
        if (lastTenDigits.length < 7) return [];
        
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('customer_number, caller_phone_number, phone_number, ended_reason, start_time')
          .or(`customer_number.ilike.%${lastTenDigits}%,caller_phone_number.ilike.%${lastTenDigits}%,phone_number.ilike.%${lastTenDigits}%`)
          .order('start_time', { ascending: false });
          
        if (error) {
          console.error(`Error searching for phone ${phone}:`, error);
          return [];
        }
        
        return data || [];
      });
      
      const partialResults = await Promise.all(partialSearchPromises);
      const partialMatches = partialResults.flat();
      
      // Third search: check metadata fields
      const metadataSearchPromises = uniquePhoneNumbers.map(async (phone) => {
        const lastTenDigits = phone.replace(/\D/g, '').slice(-10);
        if (lastTenDigits.length < 7) return [];
        
        const { data, error } = await supabase
          .from('vapi_call_logs')
          .select('customer_number, ended_reason, start_time')
          .or(`metadata->>'vapi_customer_number'.ilike.%${lastTenDigits}%,metadata->>'number'.ilike.%${lastTenDigits}%,metadata->>'phoneNumber'.ilike.%${lastTenDigits}%,metadata->>'customerNumber'.ilike.%${lastTenDigits}%`)
          .order('start_time', { ascending: false });
          
        if (error) {
          console.error(`Error searching metadata for phone ${phone}:`, error);
          return [];
        }
        
        return data || [];
      });
      
      const metadataResults = await Promise.all(metadataSearchPromises);
      const metadataMatches = metadataResults.flat();
      
      // Combine all results, prioritizing exact matches
      const allCallLogs = [
        ...(exactMatches || []),
        ...partialMatches,
        ...metadataMatches
      ];
      
      // Create a phone-to-ended_reason mapping using the latest call for each phone
      const phoneToEndedReason: Record<string, { reason: string, timestamp: string }> = {};
      
      allCallLogs.forEach(log => {
        // Safely access properties using optional chaining or type checking
        const phoneFields = [
          log.customer_number, 
          // Handle the TypeScript error by checking if properties exist
          'caller_phone_number' in log ? log.caller_phone_number : null,
          'phone_number' in log ? log.phone_number : null
        ];
        
        // Find the first non-null phone field
        const phoneField = phoneFields.find(field => field !== null && field !== undefined);
        
        if (!phoneField || !log.ended_reason) return;
        
        // Normalize the ended_reason value
        const normalizedReason = normalizeEndedReason(log.ended_reason) || log.ended_reason;
        
        // Multiple phones might match, so we need to find the specific one
        uniquePhoneNumbers.forEach(phone => {
          const formattedPhone = phone.replace(/\D/g, '');
          const lastDigits = formattedPhone.slice(-10);
          
          // Check if this log is for this phone number
          if (phoneField.includes(formattedPhone) || phoneField.includes(lastDigits)) {
            // Only update if this call is newer than any existing one for this phone
            const existing = phoneToEndedReason[phone];
            if (!existing || (log.start_time && (!existing.timestamp || log.start_time > existing.timestamp))) {
              phoneToEndedReason[phone] = {
                reason: normalizedReason,
                timestamp: log.start_time
              };
              console.log(`Found newer ended_reason "${normalizedReason}" for phone ${phone} at ${log.start_time}`);
            }
          }
        });
      });
      
      // Enrich each prospect with its ended_reason based on phone number
      batch.forEach(prospect => {
        // Check all possible phone fields for this prospect
        const phonesToCheck = [
          prospect.lead_phone,
          prospect.phone_number_intl
        ].filter(Boolean) as string[];
        
        let foundEndedReason = false;
        
        // Check each phone against our mapping
        for (const phone of phonesToCheck) {
          if (phone && phoneToEndedReason[phone]) {
            prospect.ended_reason = phoneToEndedReason[phone].reason;
            console.log(`Assigned ended_reason "${prospect.ended_reason}" to prospect ${prospect.lead_id} using phone ${phone}`);
            foundEndedReason = true;
            break;
          }
        }
        
        // If no ended_reason found but call_count > 0, set a default value
        if (!foundEndedReason && prospect.call_count && prospect.call_count > 0) {
          prospect.ended_reason = "unknown";
          console.log(`Set default "unknown" ended_reason for prospect ${prospect.lead_id} with call count ${prospect.call_count}`);
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

/**
 * Marks prospects with no call logs as "No Llamado"
 */
function markProspectsWithNoCallStatus(prospects: Prospect[]): Prospect[] {
  return prospects.map(prospect => {
    // If there's no call_count or it's 0, and the status is not already set
    // or if there's no ended_reason and no call_count
    if (
      (!prospect.call_count || prospect.call_count === 0) &&
      prospect.lead_status !== 'No Llamado' &&
      !prospect.ended_reason
    ) {
      console.log(`Marking prospect ${prospect.lead_id} as "No Llamado" because it has no call logs`);
      return {
        ...prospect,
        lead_status: 'No Llamado'
      };
    }
    return prospect;
  });
}
