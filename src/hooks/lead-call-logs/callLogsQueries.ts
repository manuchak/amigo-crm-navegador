
import { SupabaseClient } from '@supabase/supabase-js';
import { VapiCallLog } from '@/components/leads/types';

/**
 * Builds a query to search for call logs by phone number in main fields
 */
export async function queryCallLogsByPhoneNumber(
  supabase: SupabaseClient,
  formattedNumber: string,
  lastTenDigits: string
): Promise<{ data: VapiCallLog[] | null; error: any }> {
  console.log('Searching for calls with phone digits:', lastTenDigits);
  
  return supabase
    .from('vapi_call_logs')
    .select('*')
    .or(`customer_number.ilike.%${formattedNumber}%,customer_number.ilike.%${lastTenDigits}%,caller_phone_number.ilike.%${formattedNumber}%,caller_phone_number.ilike.%${lastTenDigits}%,phone_number.ilike.%${formattedNumber}%,phone_number.ilike.%${lastTenDigits}%`)
    .order('start_time', { ascending: false });
}

/**
 * Builds a query to search for call logs in metadata fields
 */
export async function queryCallLogsByMetadata(
  supabase: SupabaseClient,
  lastTenDigits: string
): Promise<{ data: VapiCallLog[] | null; error: any }> {
  console.log('Searching in metadata fields for:', lastTenDigits);
  
  return supabase
    .from('vapi_call_logs')
    .select('*')
    .or(`metadata->>'vapi_customer_number'.ilike.%${lastTenDigits}%,metadata->>'number'.ilike.%${lastTenDigits}%,metadata->>'phoneNumber'.ilike.%${lastTenDigits}%,metadata->>'customerNumber'.ilike.%${lastTenDigits}%`)
    .order('start_time', { ascending: false });
}

/**
 * Builds a more lenient query using just the last 7 digits of a phone number
 */
export async function queryCallLogsByLenientMatch(
  supabase: SupabaseClient,
  lastSevenDigits: string
): Promise<{ data: VapiCallLog[] | null; error: any }> {
  console.log('Using lenient search with last 7 digits:', lastSevenDigits);
  
  return supabase
    .from('vapi_call_logs')
    .select('*')
    .or(`customer_number.ilike.%${lastSevenDigits}%,caller_phone_number.ilike.%${lastSevenDigits}%,phone_number.ilike.%${lastSevenDigits}%`)
    .order('start_time', { ascending: false });
}
