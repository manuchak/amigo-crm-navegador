
import { ProgressManager } from './progressManager.ts';
import { BatchProcessor } from './batchProcessor.ts';
import { transformRowData, mapColumnNames } from './dataTransformer.ts';
import { reportMemoryUsage, forceGarbageCollection } from './memoryMonitor.ts';

export async function processCsvFile(
  file: File,
  progressManager: ProgressManager,
  batchConfig: any,
  supabaseClient: any
): Promise<any> {
  try {
    console.log(`Iniciando procesamiento de archivo CSV: ${file.name}`);
    await progressManager.updateProgress(
      'importing',
      0,
      100,
      'Analizando archivo CSV'
    );
    
    // Leer el contenido del archivo CSV
    const csvText = await file.text();
    console.log(`CSV leído, longitud: ${csvText.length} caracteres`);
    
    // Dividir por líneas y eliminar líneas vacías
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
      await progressManager.updateProgress(
        'error',
        0,
        0,
        'El archivo CSV está vacío'
      );
      return { success: false, message: 'El archivo CSV está vacío' };
    }
    
    console.log(`Total de líneas en CSV: ${lines.length}`);
    
    // Extraer encabezados desde la primera línea
    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    console.log(`Encabezados detectados: ${headers.join(', ')}`);
    
    // Mapear columnas a la base de datos
    const columnMapping = mapColumnNames(headers);
    console.log('Mapeo de columnas completado');
    
    // Inicializar el procesador por lotes
    const batchProcessor = new BatchProcessor(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      progressManager,
      batchConfig
    );
    
    // Extraer datos
    const dataRows = lines.slice(1);
    const totalRows = dataRows.length;
    console.log(`Procesando ${totalRows} filas de datos`);
    
    // Registrar el total de filas para el progreso
    await progressManager.updateProgress(
      'importing',
      0,
      totalRows,
      'Procesando datos CSV'
    );
    
    // Convertir líneas CSV a objetos
    let parsedData: Record<string, any>[] = [];
    let processedCount = 0;
    let insertedCount = 0;
    let errors: any[] = [];
    let batchNumber = 1;
    const batchSize = batchConfig.batchSize;
    
    for (let i = 0; i < dataRows.length; i += batchSize) {
      // Procesar un lote a la vez
      const batch = dataRows.slice(i, i + batchSize);
      const batchData: Record<string, any>[] = [];
      
      // Convertir cada línea en un objeto
      for (const line of batch) {
        try {
          // División básica de CSV (esto podría mejorarse para manejar valores con comas dentro de comillas)
          const values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
          
          if (values.length !== headers.length) {
            console.warn(`Fila con número incorrecto de columnas: ${line}`);
            errors.push({
              row: i + processedCount + 1,
              message: `Número incorrecto de columnas. Esperado: ${headers.length}, Actual: ${values.length}`
            });
            continue;
          }
          
          // Crear objeto con los valores
          const rowObject: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowObject[header] = values[index];
          });
          
          // Transformar a formato de base de datos
          const transformedRow = transformRowData(rowObject, columnMapping);
          batchData.push(transformedRow);
        } catch (error) {
          console.error(`Error al procesar línea ${i + processedCount + 1}:`, error);
          errors.push({
            row: i + processedCount + 1,
            message: `Error al procesar: ${error.message}`
          });
        }
      }
      
      processedCount += batch.length;
      
      // Insertar el lote en la base de datos
      if (batchData.length > 0) {
        try {
          console.log(`Procesando lote ${batchNumber} con ${batchData.length} registros`);
          const result = await batchProcessor.processBatch(batchData);
          insertedCount += result.insertedCount;
          
          if (result.errors && result.errors.length > 0) {
            console.warn(`Errores en lote ${batchNumber}:`, result.errors);
            const batchErrors = result.errors.map((err: any) => ({
              ...err,
              batch: batchNumber
            }));
            errors = errors.concat(batchErrors);
          }
        } catch (error) {
          console.error(`Error procesando lote ${batchNumber}:`, error);
          errors.push({
            batch: batchNumber,
            message: `Error en lote: ${error.message}`
          });
        }
      }
      
      // Actualizar el progreso
      await progressManager.updateProgress(
        'importing',
        processedCount,
        totalRows,
        `Procesados ${processedCount} de ${totalRows} registros`
      );
      
      // Liberar memoria entre lotes
      parsedData = [];
      await forceGarbageCollection();
      
      // Incrementar el contador de lotes
      batchNumber++;
      
      // Pequeña pausa entre lotes para liberar recursos
      await new Promise(resolve => setTimeout(resolve, batchConfig.processingDelay));
    }
    
    // Finalizar con estado de éxito o parcial
    const finalStatus = errors.length > 0 ? 'completed_with_errors' : 'completed';
    const finalMessage = errors.length > 0 
      ? `Importación completada con ${errors.length} errores. Se insertaron ${insertedCount} de ${totalRows} registros.`
      : `Importación completada exitosamente. Se insertaron ${insertedCount} registros.`;
    
    await progressManager.updateProgress(
      finalStatus,
      totalRows,
      totalRows,
      finalMessage
    );
    
    return {
      success: true,
      message: finalMessage,
      totalCount: totalRows,
      insertedCount,
      errors: errors.length > 0 ? errors : []
    };
    
  } catch (error) {
    console.error('Error al procesar archivo CSV:', error);
    
    await progressManager.updateProgress(
      'error',
      0,
      0,
      `Error al procesar el archivo CSV: ${error.message}`
    );
    
    return {
      success: false,
      message: `Error al procesar el archivo CSV: ${error.message}`
    };
  }
}
