
/**
 * Functions for finding and matching leads
 */
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { LeadData } from "./types.ts";

/**
 * Find a lead by phone number
 */
export async function findLeadByPhoneNumber(phoneNumber: string | null | undefined, supabase: SupabaseClient): Promise<LeadData | null> {
  if (!phoneNumber) {
    console.log("No phone number provided to findLeadByPhoneNumber");
    return null;
  }
  
  // Format phone number for search (removing non-digits)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const lastTenDigits = formattedPhone.slice(-10);
  console.log(`Searching for lead with phone number: ${lastTenDigits}`);
  
  // Look up lead by phone number
  const { data: foundLead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .or(`telefono.ilike.%${lastTenDigits}`)
    .maybeSingle();

  if (leadError) {
    console.error("Error fetching lead:", leadError);
    return null;
  } 
  
  if (foundLead) {
    console.log("Found matching lead:", JSON.stringify(foundLead, null, 2));
    return foundLead as LeadData;
  }
  
  console.warn("No matching lead found for phone number:", phoneNumber);
  return null;
}
