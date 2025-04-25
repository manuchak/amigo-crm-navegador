
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
import { ProgressManager } from './progressManager.ts';
import { BatchProcessor } from './batchProcessor.ts';
import { reportMemoryUsage, forceGarbageCollection } from './memoryMonitor.ts';
import { determineHeaderMapping } from './columnMapping.ts';

// Función para procesar el archivo Excel de manera extremadamente optimizada
export async function processExcelFileStream(
  file: File, 
  progressManager: ProgressManager, 
  config: any,
  supabaseClient: any
): Promise<any> {
  try {
    // Obtener el tamaño del array buffer para reportes de progreso
    const totalBytes = file.size;
    let processedBytes = 0;
    const chunkSize = 256 * 1024; // Reducido a 256KB para minimizar memoria
    
    // Reportar progreso inicial
    await progressManager.updateProgress(
      'validating',
      processedBytes,
      totalBytes,
      'Iniciando lectura del archivo con procesamiento en stream'
    );

    // Manejar archivos grandes mediante streaming con chunks más pequeños
    const fileStream = file.stream();
    const reader = fileStream.getReader();
    
    let chunks: Uint8Array[] = [];
    let done = false;
    
    // Leer el archivo en chunks más pequeños
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
          `Leyendo archivo en bloques: ${Math.round((processedBytes / totalBytes) * 100)}%`
        );
        
        // Forzar GC cada 2MB leídos para evitar acumulación de memoria
        if (processedBytes % (2 * 1024 * 1024) === 0) {
          await forceGarbageCollection();
        }
      }
    }
    
    try {
      // Dividir el procesamiento en pasos separados para liberar memoria entre operaciones
      // Paso 1: Combinar chunks y crear el array buffer con liberación de memoria agresiva
      await progressManager.updateProgress(
        'validating',
        totalBytes,
        totalBytes,
        'Preparando datos para parseo'
      );
      
      const totalSize = chunks.reduce((size, chunk) => size + chunk.length, 0);
      let chunksAll = new Uint8Array(totalSize);
      
      let position = 0;
      for(let i = 0; i < chunks.length; i++) {
        chunksAll.set(chunks[i], position);
        position += chunks[i].length;
        chunks[i] = new Uint8Array(0); // Liberar memoria de cada chunk después de usarlo
      }
      
      chunks = []; // Liberar el array de chunks
      await forceGarbageCollection(); // Forzar recolección de basura después de liberar arrays
      
      // Reportar progreso de parsing
      await progressManager.updateProgress(
        'validating',
        totalBytes,
        totalBytes,
        'Parseando datos de Excel'
      );
      
      // Paso 2: Cargar el workbook con opciones ultra optimizadas
      let workbook = XLSX.read(chunksAll.buffer, {
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false,
        raw: true,    // Modo raw para evitar post-procesamiento
        dense: true,  // Modo denso para optimizar memoria
        sheetRows: 0, // No limitar filas (0 = sin límite)
        memory: true  // Activar optimizaciones de memoria
      });
      
      // Liberar el buffer una vez que se ha leído
      // @ts-ignore: Intentar liberar memoria explícitamente
      let chunksAllTemp = null;
      chunksAllTemp = chunksAll;
      // @ts-ignore: Forzar liberación
      chunksAll = null;
      await forceGarbageCollection();
      
      if (!workbook?.SheetNames?.length) {
        return {
          success: false,
          message: 'El archivo Excel no contiene hojas válidas'
        };
      }
      
      const worksheetName = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[worksheetName];
      
      // Paso 3: Analizar rango y extraer encabezados
      await progressManager.updateProgress(
        'validating',
        totalBytes,
        totalBytes,
        'Extrayendo encabezados'
      );
      
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1000');
      const totalRows = range.e.r - range.s.r + 1;
      
      // Extraer encabezados primero (fila 0)
      const headerRow: Record<string, any> = {};
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({r: range.s.r, c: C})];
        if (cell && cell.v !== undefined) {
          const header = XLSX.utils.encode_col(C);
          headerRow[header] = cell.v;
        }
      }
      
      // Determinar el mapeo de columnas
      const headerMapping = determineHeaderMapping(headerRow);
      
      // Liberar memoria de workbook
      // @ts-ignore: Mantener solo la primera hoja y liberar el resto
      for (let i = 1; i < workbook.SheetNames.length; i++) {
        delete workbook.Sheets[workbook.SheetNames[i]];
      }
      
      // Crear procesador de lotes con configuración ultra-conservadora
      const batchProcessor = new BatchProcessor(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        progressManager,
        config
      );
      
      await progressManager.updateProgress(
        'importing',
        0,
        totalRows - 1, // -1 para no contar la fila de encabezados
        `Preparando importación de ${totalRows - 1} registros`
      );
      
      reportMemoryUsage("Antes de procesar filas");
      
      // Paso 4: Procesar filas en micro-lotes extremadamente pequeños (50 filas)
      const rowsPerMicroBatch = 50; // Procesar solo 50 filas a la vez en memoria
      const microBatchCount = Math.ceil((totalRows - 1) / rowsPerMicroBatch);
      let processedRowCount = 0;
      let allResults: any = { success: true, insertedCount: 0, errors: [] };
      
      for (let mb = 0; mb < microBatchCount; mb++) {
        // Asegurar que no nos pasamos del límite de tiempo
        if (mb % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50)); // Pausa corta cada 10 lotes
        }
        
        const startRow = range.s.r + 1 + (mb * rowsPerMicroBatch); // +1 para saltar encabezados
        const endRow = Math.min(startRow + rowsPerMicroBatch - 1, range.e.r);
        
        // Extraer solo el micro-lote actual (50 filas a la vez)
        const microBatchData = [];
        for (let R = startRow; R <= endRow; R++) {
          const rowData: Record<string, any> = {};
          let isEmpty = true;
          
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
            const cell = worksheet[cellAddress];
            if (cell && cell.v !== undefined) {
              const header = XLSX.utils.encode_col(C);
              rowData[header] = cell.v;
              isEmpty = false;
            }
          }
          
          if (!isEmpty) {
            microBatchData.push(rowData);
          }
        }
        
        // Procesar este micro-lote y liberar memoria
        if (microBatchData.length > 0) {
          try {
            const microResult = await batchProcessor.processBatches(microBatchData, headerMapping);
            processedRowCount += microBatchData.length;
            
            // Acumular resultados
            if (microResult.insertedCount) allResults.insertedCount += microResult.insertedCount;
            if (microResult.errors && microResult.errors.length) {
              allResults.errors = [...allResults.errors, ...microResult.errors];
            }
          } catch (processingError) {
            console.error(`Error procesando micro-lote ${mb}:`, processingError);
            allResults.errors.push({
              batch: mb, 
              message: `Error en micro-lote: ${processingError.message}`
            });
          }
          
          // Actualizar progreso solo cada 5 micro-lotes para reducir llamadas a la base de datos
          if (mb % 5 === 0 || mb === microBatchCount - 1) {
            await progressManager.updateProgress(
              'importing',
              processedRowCount,
              totalRows - 1,
              `Procesando filas: ${processedRowCount} de ${totalRows - 1} (${Math.round((processedRowCount / (totalRows - 1)) * 100)}%)`
            );
          }
        }
        
        // Forzar liberación de memoria después de cada micro-lote
        // @ts-ignore: Liberar explícitamente el micro-lote
        microBatchData.length = 0;
        if (mb % 5 === 0) { // Llamar al GC cada 5 micro-lotes
          await forceGarbageCollection();
        }
      }
      
      // Paso 5: Limpieza final y reporte
      // Liberar memoria de la worksheet y workbook manualmente
      // @ts-ignore: Forzar liberación de memoria
      let worksheetTemp = worksheet;
      // @ts-ignore: Forzar liberación de memoria
      worksheet = null;
      // @ts-ignore: Forzar liberación de memoria
      let workbookTemp = workbook;
      // @ts-ignore: Forzar liberación de memoria
      workbook = null;
      
      reportMemoryUsage("Después de procesar filas");
      
      // Actualizar estado final en la base de datos
      const finalStatus = allResults.errors?.length > 0 ? 'completed_with_errors' : 'completed';
      const finalMessage = allResults.errors?.length > 0 
        ? `Importación completada con ${allResults.errors.length} errores. Se insertaron ${allResults.insertedCount} registros.`
        : `Se importaron ${allResults.insertedCount} registros exitosamente`;
      
      await progressManager.updateProgress(
        finalStatus as any,
        totalRows - 1,
        totalRows - 1,
        finalMessage
      );
      
      // Establecer el recuento total en el resultado para el frontend
      allResults.totalCount = totalRows - 1;
      allResults.message = finalMessage;
      
      return allResults;
      
    } catch (parseError) {
      // Error específico en el procesamiento del Excel
      console.error('Error crítico en el procesamiento del Excel:', parseError);
      await progressManager.updateProgress(
        'error',
        0,
        totalBytes,
        'Error al procesar el archivo Excel: ' + parseError.message
      );
      
      return {
        success: false,
        message: 'Error al procesar el archivo Excel: ' + parseError.message
      };
    }
  } catch (error) {
    console.error('Error crítico general procesando Excel:', error);
    await progressManager.updateProgress(
      'error',
      0,
      1,
      'Error fatal procesando el archivo: ' + error.message
    );
    
    return {
      success: false,
      message: 'Error general en el procesamiento: ' + error.message
    };
  }
}
