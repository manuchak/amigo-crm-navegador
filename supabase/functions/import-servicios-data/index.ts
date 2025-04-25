
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
import { corsHeaders } from './lib/corsHeaders.ts'
import { determineHeaderMapping } from './lib/columnMapping.ts'
import { validateFile } from './lib/fileValidator.ts'
import { ProgressManager } from './lib/progressManager.ts'
import { BatchProcessor } from './lib/batchProcessor.ts'

// Configuraciones de procesamiento optimizadas
const BATCH_CONFIG = {
  batchSize: 50,
  processingDelay: 100,
  maxProcessingTime: 25 * 60 * 1000 // 25 minutos en ms
};

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
    
    if (progressId) {
      await progressManager.updateProgress(
        'validating',
        0,
        file.size,
        'Procesando archivo Excel'
      );
    }
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('Iniciando parseo del archivo Excel');
    
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false
    });
    
    if (!workbook?.SheetNames?.length) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'El archivo Excel no contiene hojas válidas'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log('Convirtiendo datos del Excel a JSON');
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      defval: null, 
      raw: false,
      header: 'A'
    });
    
    if (!jsonData?.length) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'El archivo Excel no contiene datos'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Se encontraron ${jsonData.length} filas en el archivo Excel`);
    
    // Determinar el esquema de columnas
    const headerMapping = determineHeaderMapping(jsonData[0]);
    
    // Procesar datos en lotes
    const batchProcessor = new BatchProcessor(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      progressManager,
      BATCH_CONFIG
    );
    
    const result = await batchProcessor.processBatches(jsonData, headerMapping);
    
    return new Response(
      JSON.stringify(result),
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
