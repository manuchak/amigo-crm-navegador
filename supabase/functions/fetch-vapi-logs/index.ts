
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from './lib/cors.ts';
import { ApiKeyManager } from './lib/apiKeyManager.ts';
import { DateRangeHelper } from './lib/dateHelper.ts';
import { VapiApiClient } from './lib/vapiApiClient.ts';
import { DatabaseManager } from './lib/database/index.ts';
import { CONFIG } from './lib/config.ts';

/**
 * Creates a Supabase client
 */
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Main handler for edge function
 */
async function handleRequest(req) {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient()
    
    // Get request body for additional parameters
    let requestParams = {}
    if (req.method === 'POST') {
      try {
        requestParams = await req.json()
      } catch (e) {
        console.error('Failed to parse request body:', e)
      }
    }
    
    // Get the VAPI API key
    const apiKey = await ApiKeyManager.getApiKey(supabase)
    
    // Get date range for the query
    const { startDateISO, endDateISO } = DateRangeHelper.getDateRange(requestParams)
    
    // Fetch logs from VAPI API
    const logs = await VapiApiClient.fetchLogs(apiKey, startDateISO, endDateISO)
    
    // Process and store logs in the database
    const { insertedCount, updatedCount, errorCount } = await DatabaseManager.processAndStoreLogs(supabase, logs)

    // Return success with counts
    return new Response(
      JSON.stringify({
        success: true,
        message: `VAPI logs processed: ${insertedCount} inserted, ${updatedCount} updated, ${errorCount} errors`,
        total_logs: logs?.length || 0,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorCount
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Error in fetch-vapi-logs function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: String(error)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
}

// This is the Deno Deploy entry point
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  return handleRequest(req);
});
