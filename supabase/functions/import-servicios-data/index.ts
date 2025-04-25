
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
  batchSize: 5,              // Reducido aún más a 5 para minimizar consumo de memoria por lote
  processingDelay: 1000,     // Aumentado a 1000ms para dar más tiempo al GC entre lotes
  maxProcessingTime: 10 * 60 * 1000, // 10 minutos en ms (reducido para detectar timeout más rápido)
  backoffFactor: 3,          // Aumentado para retrocesos más agresivos
  maxRetries: 7,             // Aumentado para más reintentos
  initialBackoff: 3000,      // Aumentado para dar más tiempo entre reintentos
  memoryThreshold: 0.65      // Reducido para activar GC más temprano
};

// Iniciar monitoreo de memoria temprano
// No se puede usar Deno.env.set en Edge Functions, eliminando esta línea
reportMemoryUsage("Inicio del servicio");

Deno.serve(async (req) => {
  // Manejo de CORS mejorado
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        ...corsHeaders,
        'Access-Control-Max-Age': '86400', // Caché para preflight requests - 24 horas
      } 
    });
  }

  try {
    console.log("Iniciando proceso de importación con configuración ultra-optimizada");
    reportMemoryUsage("Antes de iniciar proceso");
    
    const progressId = req.headers.get('X-Progress-ID');
    console.log(`ID de progreso: ${progressId || 'ninguno'}`);
    
    // Verificar si es una petición de prueba/heartbeat
    if (req.headers.get('X-Test-Connection') === 'true') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conexión exitosa con la función Edge' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const progressManager = new ProgressManager(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      progressId
    );
    
    // Verificar si tenemos formData
    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error('Error al procesar formData:', formError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error al procesar los datos del formulario' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
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

    // Validar el archivo con un límite más estricto
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
    
    // Usar el procesador de Excel basado en streaming con micro-lotes
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
    console.error('Error crítico no controlado:', error);
    
    // Respuesta mejorada para errores
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Error en el procesamiento de la importación', 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
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
