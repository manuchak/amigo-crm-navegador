
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

    // Aproximar el número total de filas basado en el tamaño del archivo
    // Esta es solo una estimación que se refinará más adelante
    const estimatedRowCount = Math.ceil(totalBytes / 200); // Aproximadamente 200 bytes por fila
    await progressManager.updateProgress(
      'validating',
      0,
      estimatedRowCount,
      'Estimando tamaño del archivo'
    );

    // Nueva implementación: Procesar el archivo en bloques muy pequeños
    let sheetData: any[] = [];
    let workbook = null;
    let headerMapping = {};
    
    try {
      // Nuevo enfoque: Cargar solo los primeros bytes para obtener la estructura
      // y luego procesar los datos en pequeñas secciones

      // Paso 1: Obtener solo los primeros 64KB para detectar la estructura del archivo
      const headerChunk = await file.slice(0, 64 * 1024).arrayBuffer();
      
      await progressManager.updateProgress(
        'validating',
        0,
        estimatedRowCount,
        'Analizando estructura del archivo'
      );
      
      // Cargar solo para detectar estructura
      workbook = XLSX.read(new Uint8Array(headerChunk), {
        type: 'array',
        cellDates: true,
        sheetRows: 10, // Leer solo las primeras 10 filas para detectar encabezados
        bookSheets: true // Solo cargar información de hojas, no datos completos
      });
      
      if (!workbook?.SheetNames?.length) {
        return {
          success: false,
          message: 'El archivo Excel no contiene hojas válidas'
        };
      }
      
      const worksheetName = workbook.SheetNames[0];
      const headerSheet = workbook.Sheets[worksheetName];
      
      // Extraer solo los encabezados
      const headerRange = XLSX.utils.decode_range(headerSheet['!ref'] || 'A1:Z1');
      headerRange.e.r = headerRange.s.r; // Limitar solo a la primera fila
      
      const headerRow: Record<string, any> = {};
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cell = headerSheet[XLSX.utils.encode_cell({r: headerRange.s.r, c: C})];
        if (cell && cell.v !== undefined) {
          const header = XLSX.utils.encode_col(C);
          headerRow[header] = cell.v;
        }
      }
      
      // Determinar mapeo de columnas
      headerMapping = determineHeaderMapping(headerRow);
      
      // Liberar memoria del workbook inicial
      // @ts-ignore: Forzar liberación de recursos
      workbook = null;
      await forceGarbageCollection();
      
      // Paso 2: Procesar el archivo en pequeños fragmentos de filas
      // Dividir en bloques de ~1MB para procesar por lotes

      const batchSize = 1 * 1024 * 1024; // 1 MB por batch
      let offset = 0;
      
      await progressManager.updateProgress(
        'validating',
        0,
        estimatedRowCount,
        'Iniciando lectura por fragmentos'
      );
      
      // Crear el procesador de lotes
      const batchProcessor = new BatchProcessor(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        progressManager,
        config
      );
      
      // Variables para seguimiento del proceso
      let totalRows = 0;
      let totalProcessed = 0;
      let allResults: any = { success: true, insertedCount: 0, errors: [] };
      
      while (offset < file.size) {
        // Calcular tamaño del bloque actual
        const currentBatchSize = Math.min(batchSize, file.size - offset);
        
        // Leer solo un fragmento del archivo
        const batchSlice = file.slice(offset, offset + currentBatchSize);
        const batchBuffer = await batchSlice.arrayBuffer();
        
        await progressManager.updateProgress(
          'validating',
          offset,
          file.size,
          `Leyendo fragmento ${Math.ceil(offset / batchSize) + 1}/${Math.ceil(file.size / batchSize)}`
        );
        
        // Procesar solo este fragmento
        try {
          const batchWorkbook = XLSX.read(new Uint8Array(batchBuffer), {
            type: 'array',
            cellDates: true,
            raw: true
          });
          
          const worksheetName = batchWorkbook.SheetNames[0];
          const worksheet = batchWorkbook.Sheets[worksheetName];
          
          // Convertir solo esta sección a JSON
          const batchData = XLSX.utils.sheet_to_json(worksheet, {header: 'A'});
          
          // Saltar la primera fila (encabezados) solo en el primer batch
          const startIndex = (offset === 0) ? 1 : 0;
          const rowsToProcess = batchData.slice(startIndex);
          
          // Actualizar contador de filas
          const batchRowCount = rowsToProcess.length;
          totalRows += batchRowCount;
          
          // Procesar este lote si hay datos
          if (rowsToProcess.length > 0) {
            try {
              const batchResult = await batchProcessor.processBatches(rowsToProcess, headerMapping);
              
              // Acumular resultados
              if (batchResult.insertedCount) allResults.insertedCount += batchResult.insertedCount;
              if (batchResult.errors && batchResult.errors.length) {
                allResults.errors = [...allResults.errors, ...batchResult.errors];
              }
              
              totalProcessed += rowsToProcess.length;
            } catch (batchError) {
              console.error("Error procesando batch:", batchError);
              allResults.errors.push({
                message: `Error en fragmento: ${batchError.message}`
              });
            }
          }
          
          // Liberar memoria de cada batch
          // @ts-ignore: Forzar liberación de recursos
          batchWorkbook = null;
          // @ts-ignore: Forzar liberación de recursos
          worksheet = null;
          // @ts-ignore: Forzar liberación de recursos
          batchData.length = 0;
          await forceGarbageCollection();
          
        } catch (batchParseError) {
          console.error("Error parseando fragmento:", batchParseError);
          allResults.errors.push({
            message: `Error al analizar fragmento: ${batchParseError.message}`
          });
        }
        
        // Avanzar al siguiente bloque
        offset += currentBatchSize;
        
        // Actualizar progreso
        await progressManager.updateProgress(
          'importing',
          totalProcessed,
          Math.max(totalRows, estimatedRowCount),
          `Procesadas ${totalProcessed} filas de ${totalRows} detectadas`
        );
        
        // Forzar GC después de cada bloque
        await forceGarbageCollection();
      }
      
      // Actualizar estado final en la base de datos
      const finalStatus = allResults.errors?.length > 0 ? 'completed_with_errors' : 'completed';
      const finalMessage = allResults.errors?.length > 0 
        ? `Importación completada con ${allResults.errors.length} errores. Se insertaron ${allResults.insertedCount} registros.`
        : `Se importaron ${allResults.insertedCount} registros exitosamente`;
      
      await progressManager.updateProgress(
        finalStatus as any,
        totalProcessed,
        totalRows,
        finalMessage
      );
      
      // Establecer el recuento total en el resultado para el frontend
      allResults.totalCount = totalRows;
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
