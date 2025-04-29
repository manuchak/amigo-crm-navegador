
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./lib/corsHeaders.ts";
import { validateFile } from "./lib/fileValidator.ts";
import { initializeMemoryUsageMonitoring } from "./lib/memoryMonitor.ts";

// Initialize monitoring for potential memory issues
initializeMemoryUsageMonitoring();

serve(async (req) => {
  // Handle CORS preflight requests with a quick response
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get form data from request
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ success: false, message: 'No file uploaded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate file
    const validationResult = validateFile(file);
    if (!validationResult.isValid) {
      return new Response(
        JSON.stringify({ success: false, message: validationResult.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate a unique ID for this import process
    const progressId = crypto.randomUUID();
    
    // Create initial progress record with immediate response
    const { error: progressError } = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/import_progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_KEY")}`,
        'apikey': Deno.env.get("SUPABASE_SERVICE_KEY") || '',
      },
      body: JSON.stringify({
        id: progressId,
        status: 'processing',
        message: 'Iniciando importación',
        processed: 0,
        total: 0,
      }),
    }).then(r => r.json());
    
    if (progressError) {
      console.error('Error creating progress record:', progressError);
    }

    // Send initial response to client with progressId
    // This allows the client to check progress while processing continues
    const initialResponse = {
      success: true,
      message: "Importación iniciada, procesando datos...",
      progressId,
    };
    
    // Use background processing to avoid timeouts
    EdgeRuntime.waitUntil((async () => {
      try {
        // Process the file content
        const fileContent = await file.text();
        
        // Update progress record with total lines
        const lines = fileContent.split('\n');
        const totalLines = lines.length > 0 ? lines.length - 1 : 0; // Subtract header row
        
        await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/import_progress`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_KEY")}`,
            'apikey': Deno.env.get("SUPABASE_SERVICE_KEY") || '',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            id: progressId,
            status: 'processing',
            message: 'Analizando datos',
            total: totalLines,
          }),
        });
        
        // Call the SQL function to import the data
        const { data, error } = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/rpc/import_servicios_custodia_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_KEY")}`,
            'apikey': Deno.env.get("SUPABASE_SERVICE_KEY") || '',
          },
          body: JSON.stringify({ file_content: fileContent }),
        }).then(r => r.json());
        
        if (error) {
          console.error('Error importing data:', error);
          
          // Update progress record with error
          await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/import_progress`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_KEY")}`,
              'apikey': Deno.env.get("SUPABASE_SERVICE_KEY") || '',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              id: progressId,
              status: 'error',
              message: `Error: ${error.message || 'Unknown error'}`,
            }),
          });
        } else {
          // Update progress record with success
          await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/import_progress`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_KEY")}`,
              'apikey': Deno.env.get("SUPABASE_SERVICE_KEY") || '',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              id: progressId,
              status: data.error_count > 0 ? 'completed_with_errors' : 'completed',
              message: `Importación completada: ${data.inserted_count} registros importados, ${data.error_count} errores`,
              processed: totalLines,
            }),
          });
        }
      } catch (bgError) {
        console.error("Background processing error:", bgError);
        
        // Update progress with error
        await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/import_progress`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_KEY")}`,
            'apikey': Deno.env.get("SUPABASE_SERVICE_KEY") || '',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            id: progressId,
            status: 'error',
            message: `Error de procesamiento: ${bgError instanceof Error ? bgError.message : 'Error desconocido'}`,
          }),
        });
      }
    })());
    
    // Return the initial response immediately
    return new Response(
      JSON.stringify(initialResponse),
      { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unhandled error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
