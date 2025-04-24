
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure these parameters to balance performance vs resource usage
const MAX_ROWS_PER_BATCH = 25; // Reduced batch size to use less memory per batch
const BATCH_PROCESSING_DELAY = 150; // ms delay between batches to allow GC to work
const MAX_ROWS_TOTAL = 30000; // Safety limit for total rows

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Starting import process");
    
    // Get progress tracking ID from headers if available
    const progressId = req.headers.get('X-Progress-ID');
    console.log(`Progress ID: ${progressId || 'none'}`);
    
    // Fetch Excel data from the uploaded file
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

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Stream process the Excel file to reduce memory usage
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
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
    
    // Safety check - prevent processing extremely large files
    if (jsonData.length > MAX_ROWS_TOTAL) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `El archivo contiene demasiados registros (${jsonData.length}). El límite es ${MAX_ROWS_TOTAL} filas.`
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

    console.log(`Parsing ${jsonData.length} rows from Excel file`);

    // Define table columns and validation fields
    const tableColumns = [
      'proveedor', 'fecha_hora_cita', 'km_teorico', 'cantidad_transportes', 
      'fecha_hora_asignacion', 'armado', 'hora_presentacion', 'tiempo_retraso', 
      'hora_inicio_custodia', 'tiempo_punto_origen', 'hora_arribo', 'hora_finalizacion', 
      'duracion_servicio', 'tiempo_estimado', 'km_recorridos', 'km_extras', 
      'costo_custodio', 'casetas', 'cobro_cliente', 'fecha_contratacion', 
      'fecha_primer_servicio', 'presentacion', 'id_cotizacion', 'creado_via', 
      'creado_por', 'id_servicio', 'gm_transport_id', 'estado', 'nombre_cliente', 
      'folio_cliente', 'comentarios_adicionales', 'local_foraneo', 'ruta', 
      'tipo_servicio', 'origen', 'destino', 'gadget_solicitado', 'gadget', 
      'tipo_gadget', 'nombre_operador_transporte', 'telefono_operador', 
      'placa_carga', 'tipo_unidad', 'tipo_carga', 'nombre_operador_adicional', 
      'telefono_operador_adicional', 'placa_carga_adicional', 'tipo_unidad_adicional', 
      'tipo_carga_adicional', 'id_custodio', 'nombre_custodio', 'telefono', 
      'contacto_emergencia', 'telefono_emergencia', 'auto', 'placa', 
      'nombre_armado', 'telefono_armado'
    ];
    
    const numericFields = [
      'km_teorico', 'cantidad_transportes', 'km_recorridos', 
      'km_extras', 'costo_custodio', 'casetas', 'cobro_cliente'
    ];
    
    const dateFields = [
      'fecha_hora_cita', 'fecha_hora_asignacion', 
      'fecha_contratacion', 'fecha_primer_servicio'
    ];

    // First pass: validate data in smaller chunks to avoid memory issues
    console.log("Starting validation in chunks");
    const errors = [];
    const transformedData = [];
    
    // Process in chunks to avoid memory issues during validation
    const validationChunkSize = 500;
    const totalValidationChunks = Math.ceil(jsonData.length / validationChunkSize);
    
    for (let chunkIndex = 0; chunkIndex < totalValidationChunks; chunkIndex++) {
      const startIdx = chunkIndex * validationChunkSize;
      const endIdx = Math.min((chunkIndex + 1) * validationChunkSize, jsonData.length);
      const chunk = jsonData.slice(startIdx, endIdx);
      
      console.log(`Validating chunk ${chunkIndex + 1}/${totalValidationChunks}: ${chunk.length} records`);

      // Update progress in database if progress ID is available
      if (progressId) {
        try {
          await supabaseClient
            .from('import_progress')
            .upsert({
              id: progressId,
              status: 'validating',
              processed: startIdx,
              total: jsonData.length,
              message: `Validando datos (${startIdx} de ${jsonData.length})`
            });
        } catch (progressError) {
          console.error("Error updating progress:", progressError);
          // Continue processing even if progress update fails
        }
      }
      
      // Validate each record in the current chunk
      for (let i = 0; i < chunk.length; i++) {
        try {
          const row = chunk[i];
          const rowIndex = startIdx + i;
          const transformedRow = {};
          
          tableColumns.forEach(column => {
            if (row[column] === undefined || row[column] === null || row[column] === '') {
              return; // Skip this field
            }
            
            if (numericFields.includes(column)) {
              const numValue = parseFloat(row[column]);
              if (isNaN(numValue)) {
                throw new Error(`El valor '${row[column]}' en la columna '${column}' no es un número válido`);
              }
              transformedRow[column] = numValue;
            } 
            else if (dateFields.includes(column)) {
              const dateValue = new Date(row[column]);
              if (isNaN(dateValue.getTime())) {
                throw new Error(`El valor '${row[column]}' en la columna '${column}' no es una fecha válida`);
              }
              transformedRow[column] = dateValue;
            } 
            else if (column === 'armado' && typeof row[column] === 'string') {
              transformedRow[column] = row[column].toLowerCase() === 'si' || row[column] === true;
            } 
            else {
              transformedRow[column] = row[column];
            }
          });

          transformedData.push(transformedRow);
        } catch (error) {
          errors.push({
            row: startIdx + i + 1, // +1 to account for header row
            message: error.message
          });
        }
      }
      
      // Force GC between validation chunks by creating a small delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`Data validated: ${transformedData.length} valid rows, ${errors.length} errors`);

    // If there are validation errors, return them
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          errors: errors,
          message: `Se encontraron ${errors.length} errores en los datos`
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Process in much smaller batches to avoid resource limits
    let insertedCount = 0;
    const totalBatches = Math.ceil(transformedData.length / MAX_ROWS_PER_BATCH);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * MAX_ROWS_PER_BATCH;
      const endIdx = Math.min((batchNum + 1) * MAX_ROWS_PER_BATCH, transformedData.length);
      const batch = transformedData.slice(startIdx, endIdx);
      
      console.log(`Processing batch ${batchNum + 1}/${totalBatches}: ${batch.length} records`);
      
      // Update progress if progress tracking ID is available
      if (progressId) {
        try {
          await supabaseClient
            .from('import_progress')
            .upsert({
              id: progressId,
              status: 'importing',
              processed: startIdx,
              total: transformedData.length,
              message: `Importando datos (${startIdx} de ${transformedData.length})`
            });
        } catch (progressError) {
          console.error("Error updating progress:", progressError);
          // Continue processing even if progress update fails
        }
      }
      
      try {
        const { error: insertError } = await supabaseClient
          .from('servicios_custodia')
          .insert(batch);

        if (insertError) {
          console.error(`Batch ${batchNum + 1} error:`, insertError);
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
        console.log(`Progress: ${insertedCount}/${transformedData.length} records inserted`);
      } catch (batchError) {
        console.error(`Batch ${batchNum + 1} exception:`, batchError);
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
      
      // Add a delay between batches to prevent overwhelming the database
      // and allow garbage collection to occur
      await new Promise(resolve => setTimeout(resolve, BATCH_PROCESSING_DELAY));
    }

    // Update final status if progress tracking is enabled
    if (progressId) {
      try {
        await supabaseClient
          .from('import_progress')
          .upsert({
            id: progressId,
            status: 'completed',
            processed: transformedData.length,
            total: transformedData.length,
            message: `Se importaron ${transformedData.length} registros exitosamente`
          });
      } catch (progressError) {
        console.error("Error updating final progress:", progressError);
      }
    }

    console.log('Import completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Se importaron ${transformedData.length} registros exitosamente` 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Error en el procesamiento: ' + error.message,
        stack: error.stack
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
