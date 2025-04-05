
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
    
    const VAPI_API_KEY = secretData?.value
    
    if (!VAPI_API_KEY) {
      throw new Error('VAPI API key not found in database. Please configure it first.')
    }

    // Parse request body
    const { phoneNumber, leadName, leadId } = await req.json()
    
    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }
    
    // VAPI API settings - using environment variables and constants
    const VAPI_API_URL = 'https://api.vapi.ai/call'
    const VAPI_ASSISTANT_ID = '0b7c2a96-0360-4fef-9956-e847fd696ea2' // Your VAPI assistant ID

    // Prepare VAPI call payload
    const payload = {
      assistant_id: VAPI_ASSISTANT_ID,
      phone_number: phoneNumber,
      metadata: {
        lead_id: leadId,
        lead_name: leadName
      }
    }

    console.log(`Initiating VAPI call to ${phoneNumber} for lead ${leadName}`)

    // Make request to VAPI API
    const response = await fetch(VAPI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`VAPI API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(`VAPI call initiated successfully: ${JSON.stringify(data)}`)

    // Return success response with call ID
    return new Response(
      JSON.stringify({
        success: true,
        message: 'VAPI call initiated successfully',
        callId: data.id || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in initiate-vapi-call function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: String(error),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
