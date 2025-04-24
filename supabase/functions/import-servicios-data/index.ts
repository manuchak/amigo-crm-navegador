
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
    // Fetch Excel data from the uploaded file
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file || !(file instanceof File)) {
      throw new Error('No se cargó ningún archivo')
    }

    const arrayBuffer = await file.arrayBuffer()
    
    // Parse Excel data
    const workbook = XLSX.read(arrayBuffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (jsonData.length === 0) {
      throw new Error('El archivo Excel no contiene datos')
    }

    console.log(`Parseando ${jsonData.length} filas del archivo Excel`)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate and transform data
    const errors = []
    const transformedData = []
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
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i]
      try {
        // Only validate numeric fields if they have a value
        const numericFields = ['km_teorico', 'cantidad_transportes', 'km_recorridos', 
                             'km_extras', 'costo_custodio', 'casetas', 'cobro_cliente']
        
        for (const field of numericFields) {
          if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
            const numValue = parseFloat(row[field])
            if (isNaN(numValue)) {
              throw new Error(`El valor '${row[field]}' en la columna '${field}' no es un número válido`)
            }
          }
        }

        // Only validate date fields if they have a value
        const dateFields = ['fecha_hora_cita', 'fecha_hora_asignacion', 
                          'fecha_contratacion', 'fecha_primer_servicio']
        
        for (const field of dateFields) {
          if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
            const dateValue = new Date(row[field])
            if (isNaN(dateValue.getTime())) {
              throw new Error(`El valor '${row[field]}' en la columna '${field}' no es una fecha válida`)
            }
          }
        }

        // Transform to match database schema
        const transformedRow = {}
        tableColumns.forEach(column => {
          if (row[column] !== undefined && row[column] !== null && row[column] !== '') {
            // Specific field conversions
            if (numericFields.includes(column)) {
              transformedRow[column] = parseFloat(row[column])
            } else if (dateFields.includes(column)) {
              transformedRow[column] = new Date(row[column])
            } else if (column === 'armado' && typeof row[column] === 'string') {
              transformedRow[column] = row[column].toLowerCase() === 'si' || row[column] === true
            } else {
              transformedRow[column] = row[column]
            }
          }
        })

        transformedData.push(transformedRow)
      } catch (error) {
        errors.push({
          row: i + 1,
          message: error.message,
          data: row
        })
      }
    }

    console.log(`Datos validados: ${transformedData.length} filas válidas, ${errors.length} errores`)

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

    // Insert transformed data
    const { error: insertError } = await supabaseClient
      .from('servicios_custodia')
      .insert(transformedData)

    if (insertError) {
      console.error('Error de inserción en la base de datos:', insertError)
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Error al insertar datos en la base de datos',
          error: insertError.message,
          details: insertError.details
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

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
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error.message,
        stack: error.stack
      }),
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
