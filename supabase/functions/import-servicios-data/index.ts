
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-progress-id',
}

// Configuraciones de procesamiento optimizadas
const MAX_ROWS_PER_BATCH = 50; // Aumentado para mejor rendimiento
const BATCH_PROCESSING_DELAY = 100; // Reducido para mayor velocidad
const MAX_PROCESSING_TIME = 25 * 60 * 1000; // 25 minutos en ms (límite de tiempo de Edge Functions)

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
    const file = formData.get('file') as File;
    
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
    const startTime = Date.now();
    
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
    
    // Implementar manejo de timeouts
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Tiempo de procesamiento excedido")), MAX_PROCESSING_TIME);
    });

    try {
      const importPromise = processExcelFile(supabaseClient, file, progressId);
      const result = await Promise.race([importPromise, timeoutPromise]);
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (error) {
      console.error('Error durante el procesamiento:', error);
      
      if (progressId) {
        await updateProgress(
          supabaseClient, 
          progressId, 
          'error', 
          0, 
          file.size, 
          `Error en el procesamiento: ${error.message}`
        );
      }
      
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

// Función principal para procesar el archivo Excel
async function processExcelFile(supabase, file, progressId) {
  const arrayBuffer = await file.arrayBuffer();
  
  console.log('Iniciando parseo del archivo Excel');
  // Parsear el archivo Excel con opciones de rendimiento
  const workbook = XLSX.read(arrayBuffer, { 
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false
  });
  
  if (!workbook?.SheetNames?.length) {
    if (progressId) {
      await updateProgress(
        supabase, 
        progressId, 
        'error', 
        0, 
        file.size, 
        'El archivo Excel no contiene hojas válidas'
      );
    }
    
    return { 
      success: false,
      message: 'El archivo Excel no contiene hojas válidas'
    };
  }
  
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  console.log('Convirtiendo datos del Excel a JSON');
  if (progressId) {
    await updateProgress(
      supabase, 
      progressId, 
      'validating', 
      0, 
      file.size, 
      'Extrayendo datos del Excel'
    );
  }
  
  // Usar el método eficiente sheet_to_json con opciones mínimas
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    defval: null, 
    raw: false,
    header: 'A' // Usar encabezados simples para más velocidad
  });
  
  if (!jsonData?.length) {
    if (progressId) {
      await updateProgress(
        supabase, 
        progressId, 
        'error', 
        0, 
        file.size, 
        'El archivo Excel no contiene datos'
      );
    }
    
    return { 
      success: false,
      message: 'El archivo Excel no contiene datos'
    };
  }
  
  console.log(`Se encontraron ${jsonData.length} filas en el archivo Excel`);
  
  // Si hay muchos datos, actualizar primero el progreso para feedback inmediato
  if (jsonData.length > 1000 && progressId) {
    await updateProgress(
      supabase, 
      progressId, 
      'validating', 
      0, 
      jsonData.length, 
      `Preparando importación de ${jsonData.length} registros...`
    );
  }
  
  // Procesar e importar los datos por lotes
  return await processBatchImport(supabase, jsonData, progressId);
}

// Función para importar por lotes con manejo de recursos mejorado
async function processBatchImport(supabase, jsonData, progressId) {
  try {
    // Determinar el esquema de columnas
    const headerMapping = determineHeaderMapping(jsonData[0]);
    
    // Obtener las columnas existentes en la tabla
    const { data: tableInfo } = await supabase
      .from('servicios_custodia')
      .select('id')
      .limit(1);
    
    console.log('Esquema validado. Comenzando importación por lotes');
    
    // Procesamiento por lotes optimizado
    let insertedCount = 0;
    const totalRows = jsonData.length;
    const totalBatches = Math.ceil(totalRows / MAX_ROWS_PER_BATCH);
    const errors = [];
    const startTime = Date.now();
    
    if (progressId) {
      await updateProgress(
        supabase, 
        progressId, 
        'importing', 
        0, 
        totalRows, 
        `Iniciando importación de ${totalRows} registros`
      );
    }
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * MAX_ROWS_PER_BATCH;
      const endIdx = Math.min((batchNum + 1) * MAX_ROWS_PER_BATCH, totalRows);
      const batchData = jsonData.slice(startIdx, endIdx);
      
      // Transformar datos según el mapeo de columnas
      const transformedBatch = batchData.map(row => transformRowData(row, headerMapping));
      
      try {
        // Intentar insertar el lote
        const { data, error: insertError } = await supabase
          .from('servicios_custodia')
          .insert(transformedBatch);
        
        if (insertError) {
          console.error(`Error en lote ${batchNum + 1}:`, insertError);
          
          // Agregar al registro de errores pero continuar con el siguiente lote
          errors.push({
            batch: batchNum + 1,
            message: insertError.message,
            details: insertError.details
          });
          
          // Si hay demasiados errores consecutivos, abortar
          if (errors.length > 10) {
            if (progressId) {
              await updateProgress(
                supabase, 
                progressId, 
                'error', 
                insertedCount, 
                totalRows, 
                `Importación abortada: demasiados errores consecutivos`
              );
            }
            return { 
              success: false,
              message: 'Importación abortada: demasiados errores consecutivos',
              errors: errors
            };
          }
        } else {
          // Incrementar contador de registros exitosos
          insertedCount += transformedBatch.length;
        }
        
        // Actualizar progreso cada 5 lotes o si es el último lote
        if (batchNum % 5 === 0 || batchNum === totalBatches - 1) {
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const rowsPerSecond = insertedCount / Math.max(1, elapsedSeconds);
          const estimatedTimeRemaining = Math.round((totalRows - insertedCount) / Math.max(1, rowsPerSecond));
          
          if (progressId) {
            await updateProgress(
              supabase, 
              progressId, 
              'importing', 
              insertedCount, 
              totalRows, 
              `Importando datos (${insertedCount} de ${totalRows}, ~${estimatedTimeRemaining}s restantes)`
            );
          }
        }
        
        console.log(`Batch ${batchNum + 1}/${totalBatches}: ${transformedBatch.length} registros procesados`);
      } catch (batchError) {
        console.error(`Excepción en lote ${batchNum + 1}:`, batchError);
        errors.push({
          batch: batchNum + 1,
          message: batchError.message
        });
      }
      
      // Breve retraso entre lotes para prevenir sobrecarga
      if (batchNum < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, BATCH_PROCESSING_DELAY));
      }
    }
    
    // Actualizar estado final
    const status = errors.length > 0 ? 'completed_with_errors' : 'completed';
    const message = errors.length > 0
      ? `Importación completada con ${errors.length} errores. Se insertaron ${insertedCount} de ${totalRows} registros.`
      : `Se importaron ${insertedCount} registros exitosamente`;
    
    if (progressId) {
      await updateProgress(
        supabase, 
        progressId, 
        status, 
        insertedCount, 
        totalRows, 
        message
      );
    }
    
    console.log('Importación completada:', message);
    return { 
      success: true,
      message: message,
      insertedCount,
      totalCount: totalRows,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error no controlado durante la importación por lotes:', error);
    
    if (progressId) {
      await updateProgress(
        supabase, 
        progressId, 
        'error', 
        0, 
        jsonData.length, 
        `Error inesperado: ${error.message}`
      );
    }
    
    return { 
      success: false,
      message: 'Error procesando los datos: ' + error.message
    };
  }
}

// Determinar mapeo de cabeceras según el primer registro
function determineHeaderMapping(firstRow) {
  const mapping = {};
  const columnNames = Object.keys(firstRow);
  
  // Mapeo de nombres de columnas Excel a nombres de columnas en DB
  const possibleMappings = {
    // Mapeos por nombre de columna más probable
    'ID_SERVICIO': 'id_servicio',
    'FOLIO': 'id_servicio',
    'ID': 'id_servicio',
    'NOMBRE_CLIENTE': 'nombre_cliente',
    'CLIENTE': 'nombre_cliente',
    'FOLIO_CLIENTE': 'folio_cliente',
    'ESTADO': 'estado',
    'STATUS': 'estado',
    'ESTATUS': 'estado',
    'FECHA_HORA_CITA': 'fecha_hora_cita',
    'FECHA_CITA': 'fecha_hora_cita',
    'ORIGEN': 'origen',
    'DESTINO': 'destino',
    'NOMBRE_CUSTODIO': 'nombre_custodio',
    'CUSTODIO': 'nombre_custodio',
    'TIPO_SERVICIO': 'tipo_servicio',
    'SERVICIO': 'tipo_servicio',
    'KM_TEORICO': 'km_teorico',
    'KM': 'km_teorico',
    'KM_RECORRIDOS': 'km_recorridos',
    // Añadir otros mapeos según sea necesario
  };
  
  // Iterar sobre las columnas del primer registro
  for (const column of columnNames) {
    // Intentar encontrar un mapeo
    const columnUpper = column.toUpperCase();
    for (const [excelName, dbColumn] of Object.entries(possibleMappings)) {
      if (columnUpper === excelName || columnUpper.includes(excelName)) {
        mapping[column] = dbColumn;
        break;
      }
    }
    
    // Si no hay mapeo, usar el nombre original (convertido a snake_case)
    if (!mapping[column]) {
      mapping[column] = column.toLowerCase().replace(/\s+/g, '_');
    }
  }
  
  return mapping;
}

// Transformar datos de fila según el mapeo
function transformRowData(row, headerMapping) {
  const transformedRow = {};
  
  // Aplicar el mapeo de columnas
  for (const [excelColumn, value] of Object.entries(row)) {
    const dbColumn = headerMapping[excelColumn] || excelColumn.toLowerCase().replace(/\s+/g, '_');
    
    // Transformar valores según el tipo de dato esperado
    if (dbColumn.includes('fecha') || dbColumn.includes('date') || dbColumn.includes('time')) {
      // Intentar convertir a formato de fecha ISO
      try {
        // Si ya es un objeto Date (XLSX puede convertirlo)
        if (value instanceof Date) {
          transformedRow[dbColumn] = value.toISOString();
        } 
        // Si es texto, intentar parsear
        else if (typeof value === 'string') {
          const parsedDate = new Date(value);
          if (!isNaN(parsedDate.getTime())) {
            transformedRow[dbColumn] = parsedDate.toISOString();
          } else {
            transformedRow[dbColumn] = value;
          }
        }
        else {
          transformedRow[dbColumn] = value;
        }
      } catch {
        transformedRow[dbColumn] = value;
      }
    } 
    // Valores numéricos
    else if (dbColumn.includes('km') || dbColumn.includes('costo') || dbColumn.includes('cobro')) {
      if (typeof value === 'string') {
        // Eliminar caracteres no numéricos excepto punto decimal
        const numericValue = value.replace(/[^\d.-]/g, '');
        transformedRow[dbColumn] = numericValue ? parseFloat(numericValue) : null;
      } else {
        transformedRow[dbColumn] = value;
      }
    } 
    // Valores booleanos
    else if (dbColumn.includes('armado')) {
      if (typeof value === 'string') {
        const upperValue = value.toUpperCase();
        transformedRow[dbColumn] = upperValue === 'SI' || upperValue === 'YES' || upperValue === 'TRUE' || upperValue === '1';
      } else {
        transformedRow[dbColumn] = !!value;
      }
    }
    // Para el resto, dejar el valor tal cual
    else {
      transformedRow[dbColumn] = value;
    }
  }
  
  return transformedRow;
}

// Función auxiliar para actualizar el progreso
async function updateProgress(
  supabase,
  progressId: string,
  status: 'validating' | 'importing' | 'completed' | 'completed_with_errors' | 'error',
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
