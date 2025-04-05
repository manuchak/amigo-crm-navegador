
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
    // Only accept POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get the request body
    const body = await req.json()
    const { apiKey } = body

    if (!apiKey) {
      throw new Error('API key is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store the API key in the database for persistence
    const { data: secretData, error: secretError } = await supabase
      .from('secrets')
      .upsert(
        { 
          name: 'VAPI_API_KEY', 
          value: apiKey,
          updated_at: new Date().toISOString()
        }, 
        { onConflict: 'name', ignoreDuplicates: false }
      )
    
    if (secretError) {
      console.error('Error storing VAPI API key in database:', secretError)
      throw new Error('Failed to store API key in database')
    }
    
    console.log('VAPI API key stored successfully in database')

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'VAPI API key stored successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in store-vapi-key function:', error)
    
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
