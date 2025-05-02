
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
    
    // Parse request body
    const { phoneNumber, leadName, leadId } = await req.json()
    
    if (!phoneNumber) {
      throw new Error('Phone number is required')
    }
    
    console.log(`Sending webhook request to Make.com for phone number ${phoneNumber}`)
    
    // Instead of calling VAPI directly, we'll send a webhook to Make.com
    const webhookUrl = "https://hook.us2.make.com/nlckmsej5cwmfe93gv4g6xvmavhilujl"
    
    // Prepare the payload for Make.com
    const payload = {
      phone_number: phoneNumber,
      lead_name: leadName || 'Cliente',
      lead_id: leadId || 0,
      timestamp: new Date().toISOString(),
      action: "initiate_vapi_call"
    }
    
    console.log('Make.com webhook payload:', JSON.stringify(payload))

    // Make request to Make.com webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Make.com webhook error (${response.status}): ${errorText}`)
      throw new Error(`Make.com webhook returned ${response.status}: ${errorText}`)
    }

    const data = await response.text()
    console.log(`Make.com webhook called successfully: ${data}`)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Llamada solicitada exitosamente a través de Make.com',
        callId: `make-${Date.now()}`, // Generate a placeholder ID
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
