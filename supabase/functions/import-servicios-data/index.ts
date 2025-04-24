
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
      throw new Error('No file uploaded')
    }

    const arrayBuffer = await file.arrayBuffer()
    
    // Parse Excel data
    const workbook = XLSX.read(arrayBuffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Transform data to match table structure
    const transformedData = jsonData.map((row: any) => ({
      proveedor: row.proveedor,
      fecha_hora_cita: row.fecha_hora_cita ? new Date(row.fecha_hora_cita) : null,
      km_teorico: row.km_teorico ? parseFloat(row.km_teorico) : null,
      cantidad_transportes: row.cantidad_transportes ? parseInt(row.cantidad_transportes) : null,
      fecha_hora_asignacion: row.fecha_hora_asignacion ? new Date(row.fecha_hora_asignacion) : null,
      armado: row.armado === 'Si' || row.armado === true,
      hora_presentacion: row.hora_presentacion,
      tiempo_retraso: row.tiempo_retraso,
      hora_inicio_custodia: row.hora_inicio_custodia,
      tiempo_punto_origen: row.tiempo_punto_origen,
      hora_arribo: row.hora_arribo,
      hora_finalizacion: row.hora_finalizacion,
      duracion_servicio: row.duracion_servicio,
      tiempo_estimado: row.tiempo_estimado,
      km_recorridos: row.km_recorridos ? parseFloat(row.km_recorridos) : null,
      km_extras: row.km_extras ? parseFloat(row.km_extras) : null,
      costo_custodio: row.costo_custodio ? parseFloat(row.costo_custodio) : null,
      casetas: row.casetas ? parseFloat(row.casetas) : null,
      cobro_cliente: row.cobro_cliente ? parseFloat(row.cobro_cliente) : null,
      fecha_contratacion: row.fecha_contratacion ? new Date(row.fecha_contratacion) : null,
      fecha_primer_servicio: row.fecha_primer_servicio ? new Date(row.fecha_primer_servicio) : null,
      presentacion: row.presentacion,
      id_cotizacion: row.id_cotizacion,
      creado_via: row.creado_via,
      creado_por: row.creado_por,
      id_servicio: row.id_servicio,
      gm_transport_id: row.gm_transport_id,
      estado: row.estado,
      nombre_cliente: row.nombre_cliente,
      folio_cliente: row.folio_cliente,
      comentarios_adicionales: row.comentarios_adicionales,
      local_foraneo: row.local_foraneo,
      ruta: row.ruta,
      tipo_servicio: row.tipo_servicio,
      origen: row.origen,
      destino: row.destino,
      gadget_solicitado: row.gadget_solicitado,
      gadget: row.gadget,
      tipo_gadget: row.tipo_gadget,
      nombre_operador_transporte: row.nombre_operador_transporte,
      telefono_operador: row.telefono_operador,
      placa_carga: row.placa_carga,
      tipo_unidad: row.tipo_unidad,
      tipo_carga: row.tipo_carga,
      nombre_operador_adicional: row.nombre_operador_adicional,
      telefono_operador_adicional: row.telefono_operador_adicional,
      placa_carga_adicional: row.placa_carga_adicional,
      tipo_unidad_adicional: row.tipo_unidad_adicional,
      tipo_carga_adicional: row.tipo_carga_adicional,
      id_custodio: row.id_custodio,
      nombre_custodio: row.nombre_custodio,
      telefono: row.telefono,
      contacto_emergencia: row.contacto_emergencia,
      telefono_emergencia: row.telefono_emergencia,
      auto: row.auto,
      placa: row.placa,
      nombre_armado: row.nombre_armado,
      telefono_armado: row.telefono_armado
    }))

    // Insert transformed data
    const { error: insertError } = await supabaseClient
      .from('servicios_custodia')
      .insert(transformedData)

    if (insertError) {
      throw insertError
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
