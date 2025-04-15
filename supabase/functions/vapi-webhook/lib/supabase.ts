
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

/**
 * Creates a Supabase client for database operations
 */
export function createSupabaseClient(url: string, key: string) {
  if (!url || !key) {
    console.error("Missing Supabase configuration");
  }
  return createClient(url, key);
}
