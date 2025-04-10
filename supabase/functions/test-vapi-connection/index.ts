
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
    // Create Supabase client to fetch the API key from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('Fetching VAPI API key from database')
    
    // Get the VAPI API key from the database
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

    // VAPI API settings - Updated to use the correct endpoint
    const VAPI_API_URL = 'https://api.vapi.ai/assistant'

    console.log('Testing VAPI connection with API key from database')

    // Test VAPI connectivity by fetching assistants list
    const response = await fetch(VAPI_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    })

    console.log(`VAPI API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`VAPI API returned ${response.status}:`, errorText)
      throw new Error(`VAPI API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('VAPI connection successful, response:', JSON.stringify(data).substring(0, 200))

    return new Response(
      JSON.stringify({
        success: true,
        message: 'VAPI connection successful',
        assistants_count: data.assistants?.length || 0,
        api_status: response.status
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('VAPI connection test failed:', error)
    
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
