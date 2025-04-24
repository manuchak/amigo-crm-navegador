
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure max rows per batch to prevent resource exhaustion
const MAX_ROWS_PER_BATCH = 50;

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Starting import process")
    // Fetch Excel data from the uploaded file
    const formData = await req.formData()
    const file = formData.get('file')
    
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
      )
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`)
    const arrayBuffer = await file.arrayBuffer()
    
    // Parse Excel data with streaming option to reduce memory usage
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

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
      )
    }

    console.log(`Parsing ${jsonData.length} rows from Excel file`)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Split data processing into smaller batches to avoid timeouts
    const errors = [];
    const transformedData = [];
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
    ]
    
    // Define numerical and date fields for validation
    const numericFields = [
      'km_teorico', 'cantidad_transportes', 'km_recorridos', 
      'km_extras', 'costo_custodio', 'casetas', 'cobro_cliente'
    ]
    
    const dateFields = [
      'fecha_hora_cita', 'fecha_hora_asignacion', 
      'fecha_contratacion', 'fecha_primer_servicio'
    ]

    // First pass: validate all data before insertion to avoid partial imports
    console.log("Validating and transforming data")
    for (let i = 0; i < jsonData.length; i++) {
      try {
        const row = jsonData[i]
        const transformedRow = {}
        
        // Only process essential fields to reduce memory usage
        tableColumns.forEach(column => {
          // Skip empty/undefined fields
          if (row[column] === undefined || row[column] === null || row[column] === '') {
            return // Skip this field
          }
          
          // Handle numeric fields
          if (numericFields.includes(column)) {
            const numValue = parseFloat(row[column])
            if (isNaN(numValue)) {
              throw new Error(`El valor '${row[column]}' en la columna '${column}' no es un número válido`)
            }
            transformedRow[column] = numValue
          } 
          // Handle date fields
          else if (dateFields.includes(column)) {
            const dateValue = new Date(row[column])
            if (isNaN(dateValue.getTime())) {
              throw new Error(`El valor '${row[column]}' en la columna '${column}' no es una fecha válida`)
            }
            transformedRow[column] = dateValue
          } 
          // Handle boolean fields (special case for 'armado')
          else if (column === 'armado' && typeof row[column] === 'string') {
            transformedRow[column] = row[column].toLowerCase() === 'si' || row[column] === true
          } 
          // All other fields stored as-is
          else {
            transformedRow[column] = row[column]
          }
        })

        transformedData.push(transformedRow)
      } catch (error) {
        errors.push({
          row: i + 1,
          message: error.message,
          data: JSON.stringify(jsonData[i]).substring(0, 100) + "..."
        })
      }
    }

    console.log(`Data validated: ${transformedData.length} valid rows, ${errors.length} errors`)

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
      )
    }

    // Process in much smaller batches to avoid resource limits
    let insertedCount = 0;
    const totalBatches = Math.ceil(transformedData.length / MAX_ROWS_PER_BATCH);

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * MAX_ROWS_PER_BATCH;
      const endIdx = Math.min((batchNum + 1) * MAX_ROWS_PER_BATCH, transformedData.length);
      const batch = transformedData.slice(startIdx, endIdx);
      
      console.log(`Processing batch ${batchNum + 1}/${totalBatches}: ${batch.length} records`);
      
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
      
      // Add a short delay between batches to prevent overwhelming the database
      if (batchNum < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
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
