
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
import { corsHeaders } from './lib/corsHeaders.ts'
import { determineHeaderMapping } from './lib/columnMapping.ts'
import { validateFile } from './lib/fileValidator.ts'
import { ProgressManager } from './lib/progressManager.ts'
import { BatchProcessor } from './lib/batchProcessor.ts'
import { initializeMemoryUsageMonitoring } from './lib/memoryMonitor.ts'

// Configuraciones de procesamiento optimizadas para archivos grandes
const BATCH_CONFIG = {
  batchSize: 20,             // Reducido de 50 a 20 para menor consumo de memoria
  processingDelay: 200,      // Aumentado para dar más tiempo al GC
  maxProcessingTime: 25 * 60 * 1000, // 25 minutos en ms
  backoffFactor: 1.5,        // Factor de retroceso exponencial
  maxRetries: 3,             // Número máximo de reintentos por lote
  initialBackoff: 1000,      // Retroceso inicial en ms
  memoryThreshold: 0.85      // Umbral de uso de memoria (85%)
};

// Iniciar monitoreo de memoria temprano
initializeMemoryUsageMonitoring();

Deno.serve(async (req) => {
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
    
    const progressManager = new ProgressManager(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      progressId
    );
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No se cargó ningún archivo'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validar el archivo
    const validation = validateFile(file);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ success: false, message: validation.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Procesando archivo: ${file.name}, tamaño: ${file.size} bytes`);
    
    await progressManager.updateProgress(
      'validating',
      0,
      file.size,
      'Extrayendo datos del archivo Excel'
    );
    
    // Procesar el archivo por partes para reducir el uso de memoria
    const processingResult = await processExcelFile(file, progressManager, BATCH_CONFIG);
    
    return new Response(
      JSON.stringify(processingResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json'}
      }
    );
  }
});

// Función para procesar el archivo Excel de manera optimizada
async function processExcelFile(file: File, progressManager: ProgressManager, config: any): Promise<any> {
  try {
    // Obtener el tamaño del array buffer para reportes de progreso
    const totalBytes = file.size;
    let processedBytes = 0;
    const chunkSize = 1024 * 1024; // 1MB
    
    // Reportar progreso inicial
    await progressManager.updateProgress(
      'validating',
      processedBytes,
      totalBytes,
      'Iniciando lectura del archivo'
    );

    // Manejar archivos grandes mediante streaming
    const fileStream = file.stream();
    const reader = fileStream.getReader();
    
    let chunks: Uint8Array[] = [];
    let done = false;
    
    // Leer el archivo en chunks para evitar problemas de memoria
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      
      if (value) {
        chunks.push(value);
        processedBytes += value.length;
        
        // Actualizar progreso de lectura
        await progressManager.updateProgress(
          'validating',
          processedBytes,
          totalBytes,
          `Leyendo archivo: ${Math.round((processedBytes / totalBytes) * 100)}%`
        );
      }
    }
    
    // Combinar chunks y crear el array buffer
    const chunksAll = new Uint8Array(processedBytes);
    let position = 0;
    for(const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
    
    const arrayBuffer = chunksAll.buffer;
    chunks = []; // Liberar memoria
    
    // Reportar progreso de parsing
    await progressManager.updateProgress(
      'validating',
      totalBytes,
      totalBytes,
      'Parseando datos de Excel'
    );
    
    // Usar opciones de XLSX optimizadas para reducir uso de memoria
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      dense: true // Modo denso para optimizar memoria
    });
    
    if (!workbook?.SheetNames?.length) {
      return {
        success: false,
        message: 'El archivo Excel no contiene hojas válidas'
      };
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Usar rawHeader: true para reducir procesamiento
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false,
      header: 'A',
      blankrows: false // Ignorar filas en blanco para ahorrar memoria
    });
    
    // Liberar memoria del workbook
    workbook.SheetNames = [];
    
    if (!jsonData?.length) {
      return {
        success: false,
        message: 'El archivo Excel no contiene datos'
      };
    }
    
    const totalRows = jsonData.length;
    console.log(`Se encontraron ${totalRows} filas en el archivo Excel`);
    
    // Determinar el esquema de columnas
    const headerMapping = determineHeaderMapping(jsonData[0]);
    
    // Procesar datos en lotes
    const batchProcessor = new BatchProcessor(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      progressManager,
      config
    );
    
    // Procesar los datos en lotes, con manejo de memoria y backoff exponencial
    const result = await batchProcessor.processBatches(jsonData, headerMapping);
    
    return result;
  } catch (error) {
    console.error('Error procesando Excel:', error);
    await progressManager.updateProgress(
      'error',
      0,
      1,
      'Error procesando el archivo: ' + error.message
    );
    throw error;
  }
}
