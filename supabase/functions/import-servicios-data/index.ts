
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
import { corsHeaders } from './lib/corsHeaders.ts'
import { determineHeaderMapping } from './lib/columnMapping.ts'
import { validateFile } from './lib/fileValidator.ts'
import { ProgressManager } from './lib/progressManager.ts'
import { BatchProcessor } from './lib/batchProcessor.ts'
import { initializeMemoryUsageMonitoring, reportMemoryUsage } from './lib/memoryMonitor.ts'
import { processExcelFileStream } from './lib/excelFileProcessor.ts'

// Configuraciones de procesamiento extremadamente conservadoras para evitar errores de recursos
const BATCH_CONFIG = {
  batchSize: 10,             // Reducido drásticamente de 20 a 10 para disminuir el consumo de memoria por lote
  processingDelay: 500,      // Aumentado de 200ms a 500ms para dar más tiempo al GC entre lotes
  maxProcessingTime: 20 * 60 * 1000, // 20 minutos en ms (reducido de 25 minutos para mejor detección de timeout)
  backoffFactor: 2,          // Aumentado para retrocesos más agresivos
  maxRetries: 5,             // Aumentado de 3 a 5 para más reintentos
  initialBackoff: 2000,      // Aumentado de 1000ms a 2000ms
  memoryThreshold: 0.70      // Reducido de 0.85 a 0.70 para activar GC más temprano
};

// Iniciar monitoreo de memoria temprano
initializeMemoryUsageMonitoring();

// Establecer un límite bajo para la memoria heap
Deno.env.set("NO_COLOR", "1"); // Desactivar colores en logs para ahorrar memoria
reportMemoryUsage("Inicio del servicio");

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Iniciando proceso de importación con configuración optimizada");
    reportMemoryUsage("Antes de iniciar proceso");
    
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
      'Preparando procesamiento del archivo Excel'
    );
    
    reportMemoryUsage("Antes de procesar Excel");
    
    // Usar el nuevo procesador de Excel basado en streaming
    const processingResult = await processExcelFileStream(
      file, 
      progressManager, 
      BATCH_CONFIG,
      supabaseClient
    );
    
    reportMemoryUsage("Después de procesar Excel");
    
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
  } finally {
    reportMemoryUsage("Finalización del servicio");
  }
});
