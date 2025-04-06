
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
    
    // Get the VAPI API key from the database
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

    // VAPI API settings
    const VAPI_API_URL = 'https://api.vapi.ai/analytics'
    const VAPI_ORG_ID = 'dc74331a-39ef-4370-a0c4-333c1563cdad'
    const VAPI_ASSISTANT_ID = '0b7c2a96-0360-4fef-9956-e847fd696ea2'
    
    // Get request body for any additional parameters
    let requestParams: any = {}
    if (req.method === 'POST') {
      try {
        requestParams = await req.json()
      } catch (e) {
        // If parsing fails, proceed with default parameters
        console.error('Failed to parse request body:', e)
      }
    }
    
    // Get date range from request or use default (last 30 days)
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

    // Build the analytics request payload
    const analyticsPayload = {
      queries: [
        {
          table: "call",
          name: "call_logs",
          filters: {
            assistant_id: [VAPI_ASSISTANT_ID],
            organization_id: [VAPI_ORG_ID],
            start_time: {
              op: ">=",
              value: startDateISO
            },
            end_time: {
              op: "<=",
              value: endDateISO
            }
          },
          operations: [
            {
              operation: "group",
              columns: ["id", "assistant_id", "organization_id", "conversation_id", "phone_number", 
                        "caller_phone_number", "start_time", "end_time", "duration", "status", 
                        "direction", "recording_url", "metadata", "transcript"]
            }
          ]
        }
      ]
    }

    console.log('Making request to VAPI analytics endpoint')

    // Make request to VAPI analytics API
    const response = await fetch(VAPI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`VAPI API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('VAPI analytics response:', JSON.stringify(data).substring(0, 200) + '...')

    // Process and extract logs from the analytics response
    let logs = []
    
    if (data && Array.isArray(data) && data.length > 0) {
      const callLogsResult = data.find(item => item.name === 'call_logs')
      
      if (callLogsResult && callLogsResult.result && Array.isArray(callLogsResult.result)) {
        logs = callLogsResult.result
        console.log(`Retrieved ${logs.length} logs from VAPI API`)
      } else {
        console.log('No logs found in VAPI API response')
        logs = []
      }
    }

    // Process and store logs in the database
    let insertedCount = 0
    let updatedCount = 0
    let errorCount = 0

    if (logs && logs.length > 0) {
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
    }

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
})
