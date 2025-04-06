
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Define CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to create a Supabase client
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  return createClient(supabaseUrl, supabaseKey)
}

// Function to fetch the VAPI API key from the database
async function getVapiApiKey(supabase) {
  console.log('Fetching VAPI API key from database')
  const { data: secretData, error: secretError } = await supabase
    .from('secrets')
    .select('value')
    .eq('name', 'VAPI_API_KEY')
    .maybeSingle()
  
  if (secretError) {
    console.error('Error fetching VAPI API key from database:', secretError)
    throw new Error('Failed to fetch API key from database')
  }
  
  // If API key is not found in database, use the default one
  let VAPI_API_KEY = secretData?.value
  
  if (!VAPI_API_KEY) {
    console.log('VAPI API key not found in database, using default key')
    // Use default API key as fallback
    VAPI_API_KEY = '4e1d9a9c-de28-4e68-926c-3b5ca5a3ecb9'
    
    // Try to store the default key in the database for future use
    try {
      await supabase.from('secrets').insert([
        { name: 'VAPI_API_KEY', value: VAPI_API_KEY }
      ])
      console.log('Default VAPI API key stored in database')
    } catch (storeError) {
      // Continue even if storing fails
      console.error('Failed to store default VAPI API key:', storeError)
    }
  }

  return VAPI_API_KEY
}

// Function to determine date range for fetching logs
function getDateRange(requestParams = {}) {
  const now = new Date()
  const startDate = requestParams.start_date ? 
    new Date(requestParams.start_date) : 
    new Date(now.setDate(now.getDate() - 30))
  const endDate = requestParams.end_date ?
    new Date(requestParams.end_date) :
    new Date()
    
  const startDateISO = startDate.toISOString()
  const endDateISO = endDate.toISOString()

  console.log(`Fetching VAPI logs from ${startDateISO} to ${endDateISO}`)
  
  return { startDateISO, endDateISO }
}

// Function to fetch logs from VAPI API
async function fetchVapiLogs(apiKey, startDate, endDate) {
  // VAPI API settings
  const VAPI_API_URL = 'https://api.vapi.ai/call-logs'
  const VAPI_ASSISTANT_ID = '0b7c2a96-0360-4fef-9956-e847fd696ea2'
  
  // Build the request options
  const requestOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  // We'll use query parameters for the GET request
  const queryParams = new URLSearchParams({
    assistant_id: VAPI_ASSISTANT_ID,
    start_time: startDate,
    end_time: endDate,
  });
  
  const requestUrl = `${VAPI_API_URL}?${queryParams.toString()}`;
  console.log('Making request to VAPI call-logs endpoint:', requestUrl);

  // Make request to VAPI call-logs API
  const response = await fetch(requestUrl, requestOptions);

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`VAPI API error response: ${response.status}`, errorText)
    throw new Error(`VAPI API returned ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  console.log('VAPI call-logs response:', JSON.stringify(data).substring(0, 200) + '...')

  // Extract logs from the response
  let logs = []
  
  if (data && Array.isArray(data.calls)) {
    logs = data.calls
    console.log(`Retrieved ${logs.length} logs from VAPI API`)
  } else {
    console.log('No logs found in VAPI API response or unexpected format')
  }

  return logs
}

// Function to process and store logs in the database
async function processAndStoreLogs(supabase, logs) {
  let insertedCount = 0
  let updatedCount = 0
  let errorCount = 0

  if (!logs || logs.length === 0) {
    return { insertedCount, updatedCount, errorCount }
  }

  for (const log of logs) {
    try {
      // Check if log already exists in the database
      const { data: existingLog, error: checkError } = await supabase
        .from('vapi_call_logs')
        .select('id')
        .eq('log_id', log.id)
        .maybeSingle()

      if (checkError) {
        console.error(`Error checking if log ${log.id} exists:`, checkError)
        errorCount++
        continue
      }

      // Prepare the log data
      const logData = {
        log_id: log.id,
        assistant_id: log.assistant_id,
        organization_id: log.organization_id,
        conversation_id: log.conversation_id,
        phone_number: log.phone_number,
        caller_phone_number: log.caller_phone_number,
        start_time: log.start_time,
        end_time: log.end_time,
        duration: log.duration,
        status: log.status,
        direction: log.direction,
        transcript: log.transcript || null,
        recording_url: log.recording_url,
        metadata: log.metadata || {}
      }

      // Insert or update the log
      if (!existingLog) {
        // Insert new log
        const { error: insertError } = await supabase
          .from('vapi_call_logs')
          .insert([logData])

        if (insertError) {
          console.error(`Error inserting log ${log.id}:`, insertError)
          errorCount++
        } else {
          insertedCount++
        }
      } else {
        // Update existing log
        const { error: updateError } = await supabase
          .from('vapi_call_logs')
          .update(logData)
          .eq('log_id', log.id)

        if (updateError) {
          console.error(`Error updating log ${log.id}:`, updateError)
          errorCount++
        } else {
          updatedCount++
        }
      }
    } catch (err) {
      console.error(`Error processing log ${log.id}:`, err)
      errorCount++
    }
  }

  return { insertedCount, updatedCount, errorCount }
}

// Main handler function for the edge function
async function handleRequest(req) {
  try {
    // Create Supabase client
    const supabase = createSupabaseClient()
    
    // Get the VAPI API key
    const apiKey = await getVapiApiKey(supabase)
    
    // Get request body for additional parameters
    let requestParams = {}
    if (req.method === 'POST') {
      try {
        requestParams = await req.json()
      } catch (e) {
        // If parsing fails, proceed with default parameters
        console.error('Failed to parse request body:', e)
      }
    }
    
    // Get date range for the query
    const { startDateISO, endDateISO } = getDateRange(requestParams)
    
    // Fetch logs from VAPI API
    const logs = await fetchVapiLogs(apiKey, startDateISO, endDateISO)
    
    // Process and store logs in the database
    const { insertedCount, updatedCount, errorCount } = await processAndStoreLogs(supabase, logs)

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

// Main handler for the Deno server
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  return handleRequest(req)
})
