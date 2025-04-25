
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-progress-id',
}

// Configure these parameters to balance performance vs resource usage
const MAX_ROWS_PER_BATCH = 10; // Reducido aún más para evitar problemas de memoria
const BATCH_PROCESSING_DELAY = 500; // ms delay between batches to allow GC to work
const MAX_ROWS_TOTAL = 10000; // Safety limit for total rows

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
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
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
    
    // Update progress
    if (progressId) {
      await updateProgress(supabaseClient, progressId, 'validating', 0, file.size, 'Procesando archivo Excel');
    }
    
    // Stream process the Excel file to reduce memory usage
    const arrayBuffer = await file.arrayBuffer();
    
    // Update progress
    if (progressId) {
      await updateProgress(supabaseClient, progressId, 'validating', 0, file.size, 'Analizando estructura del archivo');
    }
    
    let workbook;
    try {
      workbook = XLSX.read(arrayBuffer, { type: 'array' });
    } catch (parseError) {
      console.error("Error parsing Excel file:", parseError);
      
      // Update progress to error
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
    
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      
      // Update progress to error
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
    if (!worksheet) {
      
      // Update progress to error
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'error', 
          0, 
          file.size, 
          'No se encontró la hoja de cálculo en el archivo Excel'
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'No se encontró la hoja de cálculo en el archivo Excel'
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
    
    // Update progress before the CPU-intensive conversion
    if (progressId) {
      await updateProgress(supabaseClient, progressId, 'validating', 0, file.size, 'Convirtiendo datos de Excel a JSON');
    }
    
    // Enable defval option to convert empty cells to null, and raw:false to parse dates correctly
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });

    if (!jsonData || jsonData.length === 0) {
      
      // Update progress to error
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
    
    console.log(`Found ${jsonData.length} rows in the Excel file`);
    
    // Safety check - prevent processing extremely large files
    if (jsonData.length > MAX_ROWS_TOTAL) {
      
      // Update progress to error
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'error', 
          0, 
          jsonData.length, 
          `El archivo contiene demasiados registros (${jsonData.length}). El límite es ${MAX_ROWS_TOTAL} filas.`
        );
      }
      
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

    // Update progress
    if (progressId) {
      await updateProgress(supabaseClient, progressId, 'validating', 0, jsonData.length, 'Validando datos');
    }

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
    const validationChunkSize = 100; // Reducido para mejor manejo de memoria
    const totalValidationChunks = Math.ceil(jsonData.length / validationChunkSize);
    
    for (let chunkIndex = 0; chunkIndex < totalValidationChunks; chunkIndex++) {
      const startIdx = chunkIndex * validationChunkSize;
      const endIdx = Math.min((chunkIndex + 1) * validationChunkSize, jsonData.length);
      const chunk = jsonData.slice(startIdx, endIdx);
      
      console.log(`Validating chunk ${chunkIndex + 1}/${totalValidationChunks}: ${chunk.length} records`);

      // Update progress in database if progress ID is available
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'validating', 
          startIdx, 
          jsonData.length, 
          `Validando datos (${startIdx} de ${jsonData.length})`
        );
      }
      
      // Validate each record in the current chunk
      for (let i = 0; i < chunk.length; i++) {
        try {
          const row = chunk[i];
          const rowIndex = startIdx + i;
          const transformedRow = {};
          
          // Check if row has any data
          if (!row || Object.keys(row).length === 0) {
            // Skip completely empty rows
            continue;
          }
          
          tableColumns.forEach(column => {
            // Skip missing fields
            if (row[column] === undefined || row[column] === null || row[column] === '') {
              return;
            }
            
            try {
              if (numericFields.includes(column)) {
                // Handle numeric fields
                let numValue;
                if (typeof row[column] === 'string') {
                  // Remove any non-numeric characters except decimal point
                  const cleanedValue = row[column].toString().replace(/[^\d.-]/g, '');
                  numValue = parseFloat(cleanedValue);
                } else {
                  numValue = parseFloat(row[column]);
                }
                
                if (isNaN(numValue)) {
                  throw new Error(`El valor '${row[column]}' en la columna '${column}' no es un número válido`);
                }
                transformedRow[column] = numValue;
              } 
              else if (dateFields.includes(column)) {
                // Handle date fields
                let dateValue;
                if (row[column] instanceof Date) {
                  dateValue = row[column];
                } else {
                  // Try parsing as string first
                  dateValue = new Date(row[column]);
                  
                  // If that doesn't work, try Excel date number conversion
                  if (isNaN(dateValue.getTime()) && typeof row[column] === 'number') {
                    dateValue = XLSX.SSF.parse_date_code(row[column]);
                  }
                }
                
                if (isNaN(dateValue.getTime())) {
                  throw new Error(`El valor '${row[column]}' en la columna '${column}' no es una fecha válida`);
                }
                transformedRow[column] = dateValue.toISOString();
              } 
              else if (column === 'armado' && (typeof row[column] === 'string' || typeof row[column] === 'boolean')) {
                // Handle boolean fields
                if (typeof row[column] === 'string') {
                  const lowerValue = row[column].toLowerCase();
                  transformedRow[column] = lowerValue === 'si' || lowerValue === 'sí' || 
                                          lowerValue === 'true' || lowerValue === 'verdadero' || 
                                          lowerValue === '1' || lowerValue === 'y' || 
                                          lowerValue === 'yes';
                } else {
                  transformedRow[column] = !!row[column];
                }
              } 
              else {
                // Handle string and other fields
                transformedRow[column] = row[column];
              }
            } catch (fieldError) {
              throw new Error(`Error en columna '${column}': ${fieldError.message}`);
            }
          });

          // Only add the row if it has at least one non-null field
          if (Object.keys(transformedRow).length > 0) {
            transformedData.push(transformedRow);
          }
        } catch (error) {
          errors.push({
            row: startIdx + i + 2, // +2 para considerar la fila de encabezado y que Excel comienza en 1
            message: error.message
          });
        }
      }
      
      // Force memory cleanup between validation chunks
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Data validated: ${transformedData.length} valid rows, ${errors.length} errors`);

    // If there are validation errors, return them
    if (errors.length > 0) {
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'error', 
          0, 
          jsonData.length, 
          `Se encontraron ${errors.length} errores en los datos`
        );
      }
      
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
    console.log(`Will process data in ${totalBatches} batches of ${MAX_ROWS_PER_BATCH} rows each`);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * MAX_ROWS_PER_BATCH;
      const endIdx = Math.min((batchNum + 1) * MAX_ROWS_PER_BATCH, transformedData.length);
      const batch = transformedData.slice(startIdx, endIdx);
      
      console.log(`Processing batch ${batchNum + 1}/${totalBatches}: ${batch.length} records`);
      
      // Update progress if progress tracking ID is available
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'importing', 
          insertedCount, 
          transformedData.length, 
          `Importando datos (${insertedCount} de ${transformedData.length})`
        );
      }
      
      try {
        // Verificando que el array de datos no esté vacío
        if (batch.length === 0) {
          console.warn(`Batch ${batchNum + 1} is empty, skipping`);
          continue;
        }
        
        // Imprimir para debugging el primer registro del batch
        console.log(`First record in batch ${batchNum + 1}:`, JSON.stringify(batch[0]));
        
        const { data, error: insertError } = await supabaseClient
          .from('servicios_custodia')
          .insert(batch)
          .select('id');
        
        if (insertError) {
          console.error(`Batch ${batchNum + 1} error:`, insertError);
          
          // Update progress to error status
          if (progressId) {
            await updateProgress(
              supabaseClient, 
              progressId, 
              'error', 
              insertedCount, 
              transformedData.length, 
              `Error en el lote ${batchNum + 1}: ${insertError.message}`
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
        console.log(`Progress: ${insertedCount}/${transformedData.length} records inserted, IDs:`, 
          data ? data.map(d => d.id).join(',') : 'No IDs returned');
      } catch (batchError) {
        console.error(`Batch ${batchNum + 1} exception:`, batchError);
        
        // Update progress to error status
        if (progressId) {
          await updateProgress(
            supabaseClient, 
            progressId, 
            'error', 
            insertedCount, 
            transformedData.length, 
            `Error en el lote ${batchNum + 1}: ${batchError.message}`
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
      
      // Add a delay between batches to prevent overwhelming the database
      // and allow garbage collection to occur
      await new Promise(resolve => setTimeout(resolve, BATCH_PROCESSING_DELAY));
    }

    // Update final status if progress tracking is enabled
    if (progressId) {
      await updateProgress(
        supabaseClient, 
        progressId, 
        'completed', 
        transformedData.length, 
        transformedData.length, 
        `Se importaron ${transformedData.length} registros exitosamente`
      );
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
    console.error('Unhandled error:', error);
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

// Helper function to update progress tracking
async function updateProgress(
  supabase,
  progressId: string,
  status: 'validating' | 'importing' | 'completed' | 'error',
  processed: number,
  total: number,
  message: string
) {
  try {
    console.log(`Updating progress: ${progressId} - ${status} - ${processed}/${total} - ${message}`);
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
    console.error("Error updating progress:", error);
    return false;
  }
}
