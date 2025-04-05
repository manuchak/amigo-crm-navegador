
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
    // VAPI API settings
    const VAPI_API_URL = 'https://api.vapi.ai/assistants'
    const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY')

    if (!VAPI_API_KEY) {
      throw new Error('VAPI API key not found in environment variables')
    }

    console.log('Testing VAPI connection with API key')

    // Test VAPI connectivity by fetching assistants list
    const response = await fetch(VAPI_API_URL, {
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
    console.log('VAPI connection successful:', data)

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
