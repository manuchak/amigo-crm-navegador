
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-progress-id',
}

// Configuraciones de procesamiento
const MAX_ROWS_PER_BATCH = 20; // Ajustado para mejor rendimiento
const BATCH_PROCESSING_DELAY = 500; // ms de retraso entre lotes

Deno.serve(async (req) => {
  // Manejar solicitud preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Iniciando proceso de importación");
    
    const progressId = req.headers.get('X-Progress-ID');
    console.log(`ID de progreso: ${progressId || 'ninguno'}`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No se cargó ningún archivo'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 400 
        }
      );
    }

    console.log(`Procesando archivo: ${file.name}, tamaño: ${file.size} bytes`);
    
    // Actualizar progreso al inicio
    if (progressId) {
      await updateProgress(
        supabaseClient, 
        progressId, 
        'validating', 
        0, 
        file.size, 
        'Procesando archivo Excel'
      );
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Parsear el archivo Excel
    let workbook;
    try {
      workbook = XLSX.read(arrayBuffer, { type: 'array' });
    } catch (parseError) {
      console.error("Error leyendo el archivo Excel:", parseError);
      
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'error', 
          0, 
          file.size, 
          `Error al leer el archivo Excel: ${parseError.message}`
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error al leer el archivo Excel: ${parseError.message}`
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 400 
        }
      );
    }
    
    if (!workbook?.SheetNames?.length) {
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'error', 
          0, 
          file.size, 
          'El archivo Excel no contiene hojas válidas'
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'El archivo Excel no contiene hojas válidas'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 400
        }
      );
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });
    
    if (!jsonData?.length) {
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'error', 
          0, 
          file.size, 
          'El archivo Excel no contiene datos'
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'El archivo Excel no contiene datos'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 400
        }
      );
    }
    
    console.log(`Se encontraron ${jsonData.length} filas en el archivo Excel`);
    
    // Procesamiento por lotes
    let insertedCount = 0;
    const totalBatches = Math.ceil(jsonData.length / MAX_ROWS_PER_BATCH);
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * MAX_ROWS_PER_BATCH;
      const endIdx = Math.min((batchNum + 1) * MAX_ROWS_PER_BATCH, jsonData.length);
      const batch = jsonData.slice(startIdx, endIdx);
      
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'importing', 
          insertedCount, 
          jsonData.length, 
          `Importando datos (${insertedCount} de ${jsonData.length})`
        );
      }
      
      try {
        const { data, error: insertError } = await supabaseClient
          .from('servicios_custodia')
          .insert(batch)
          .select('id');
        
        if (insertError) {
          console.error(`Error en lote ${batchNum + 1}:`, insertError);
          
          if (progressId) {
            await updateProgress(
              supabaseClient, 
              progressId, 
              'error', 
              insertedCount, 
              jsonData.length, 
              `Error en lote ${batchNum + 1}: ${insertError.message}`
            );
          }
          
          return new Response(
            JSON.stringify({ 
              success: false,
              message: 'Error al insertar datos en la base de datos',
              error: insertError.message,
              details: insertError.details,
              batchNumber: batchNum + 1
            }),
            { 
              status: 500, 
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
              } 
            }
          );
        }
        
        insertedCount += batch.length;
        console.log(`Progreso: ${insertedCount}/${jsonData.length} registros insertados`);
      } catch (batchError) {
        console.error(`Excepción en lote ${batchNum + 1}:`, batchError);
        
        if (progressId) {
          await updateProgress(
            supabaseClient, 
            progressId, 
            'error', 
            insertedCount, 
            jsonData.length, 
            `Error en lote ${batchNum + 1}: ${batchError.message}`
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: false,
            message: `Error en el lote ${batchNum + 1}: ${batchError.message}`,
            batchNumber: batchNum + 1
          }),
          { 
            status: 500, 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // Breve retraso entre lotes para prevenir sobrecarga
      await new Promise(resolve => setTimeout(resolve, BATCH_PROCESSING_DELAY));
    }

    // Actualizar estado final
    if (progressId) {
      await updateProgress(
        supabaseClient, 
        progressId, 
        'completed', 
        jsonData.length, 
        jsonData.length, 
        `Se importaron ${jsonData.length} registros exitosamente`
      );
    }

    console.log('Importación completada con éxito');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Se importaron ${jsonData.length} registros exitosamente` 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error no controlado:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Error en el procesamiento: ' + error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});

// Función auxiliar para actualizar el progreso
async function updateProgress(
  supabase,
  progressId: string,
  status: 'validating' | 'importing' | 'completed' | 'error',
  processed: number,
  total: number,
  message: string
) {
  try {
    console.log(`Actualizando progreso: ${progressId} - ${status} - ${processed}/${total} - ${message}`);
    await supabase
      .from('import_progress')
      .upsert({
        id: progressId,
        status,
        processed,
        total,
        message,
        updated_at: new Date().toISOString()
      });
      
    return true;
  } catch (error) {
    console.error("Error actualizando progreso:", error);
    return false;
  }
}
