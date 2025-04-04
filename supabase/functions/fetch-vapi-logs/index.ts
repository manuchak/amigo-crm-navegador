
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // VAPI API settings - using environment variables and constants
    const VAPI_API_URL = 'https://api.vapi.ai/logs'
    const VAPI_ORG_ID = 'dc74331a-39ef-4370-a0c4-333c1563cdad'
    const VAPI_ASSISTANT_ID = '0b7c2a96-0360-4fef-9956-e847fd696ea2'
    const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY')

    if (!VAPI_API_KEY) {
      throw new Error('VAPI API key not found in environment variables')
    }

    // Request parameters
    const params = new URLSearchParams({
      organization_id: VAPI_ORG_ID,
      assistant_id: VAPI_ASSISTANT_ID,
      limit: '100', // Fetch up to 100 logs at a time
    })

    // Get request body for any additional parameters
    let additionalParams = {}
    if (req.method === 'POST') {
      try {
        additionalParams = await req.json()
        
        // Add any additional parameters to the URL params
        if (additionalParams.start_date) {
          params.append('start_date', additionalParams.start_date)
        }
        if (additionalParams.end_date) {
          params.append('end_date', additionalParams.end_date)
        }
      } catch (e) {
        // If parsing fails, proceed with default parameters
        console.error('Failed to parse request body:', e)
      }
    }

    console.log(`Fetching VAPI logs with params: ${params.toString()}`)

    // Make request to VAPI API
    const response = await fetch(`${VAPI_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`VAPI API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(`Retrieved ${data.logs?.length || 0} logs from VAPI API`)

    // Process and store logs in the database
    let insertedCount = 0
    let updatedCount = 0
    let errorCount = 0

    if (data.logs && data.logs.length > 0) {
      for (const log of data.logs) {
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
    }

    // Return success with counts
    return new Response(
      JSON.stringify({
        success: true,
        message: `VAPI logs processed: ${insertedCount} inserted, ${updatedCount} updated, ${errorCount} errors`,
        total_logs: data.logs?.length || 0,
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
})
