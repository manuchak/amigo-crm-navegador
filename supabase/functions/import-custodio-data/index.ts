
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Fetch Excel data from Google Sheets
    const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRvhX-tD4plowwSiAPKu0rhd5VKgsuwWFNDFrGsG5BkBhcK0N3HEI-5_tOJKPxdfvlSo9FguDgPArjF/pub?output=xlsx');
    const arrayBuffer = await response.arrayBuffer();
    
    // Parse Excel data
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Clear existing data
    const { error: deleteError } = await supabaseClient
      .from('custodio_excel_data')
      .delete()
      .neq('id', 0); // Delete all rows

    if (deleteError) {
      throw deleteError;
    }

    // Insert new data
    const { error: insertError } = await supabaseClient
      .from('custodio_excel_data')
      .insert(
        jsonData.map((row: any) => ({
          fecha_cita: row.FechaCita,
          nombre_custodio: row.NombreCustodio,
          meses_activo: row.MesesActivo,
          trabajos_completados: row.TrabajosCompletados,
          calificacion_promedio: row.CalificacionPromedio,
          confiabilidad: row.Confiabilidad,
          tiempo_respuesta: row.TiempoRespuesta,
          ingresos: row.Ingresos,
          valor_vida_cliente: row.ValorVidaCliente,
          estado: row.Estado || 'active'
        }))
      );

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ message: 'Data imported successfully' }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
