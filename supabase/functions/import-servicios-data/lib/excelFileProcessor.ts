import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
import { ProgressManager } from './progressManager.ts';
import { BatchProcessor } from './batchProcessor.ts';
import { reportMemoryUsage, forceGarbageCollection } from './memoryMonitor.ts';
import { determineHeaderMapping } from './columnMapping.ts';
import { transformRowData, mapColumnNames } from './dataTransformer.ts';

export async function processExcelFileStream(
  file: File, 
  progressManager: ProgressManager, 
  config: any,
  supabaseClient: any
): Promise<any> {
  try {
    const totalBytes = file.size;
    let processedBytes = 0;
    
    await progressManager.updateProgress(
      'validating',
      processedBytes,
      totalBytes,
      'Iniciando lectura del archivo con procesamiento en stream'
    );

    let estimatedRowCount = Math.ceil(totalBytes / 200);
    await progressManager.updateProgress(
      'validating',
      0,
      estimatedRowCount,
      'Estimando tamaño del archivo'
    );

    try {
      const headerBytes = await file.slice(0, Math.min(8192, file.size)).arrayBuffer();
      
      try {
        const headerView = new Uint8Array(headerBytes);
        
        if (headerView[0] !== 0x50 || headerView[1] !== 0x4B) {
          await progressManager.updateProgress(
            'error',
            0,
            totalBytes,
            'El archivo no parece ser un Excel válido. Por favor, verifique el formato del archivo.'
          );
          
          return {
            success: false,
            message: 'El archivo no parece ser un Excel válido. Por favor, verifique el formato del archivo.'
          };
        }
      } catch (headerError) {
        console.error('Error verificando cabecera del archivo:', headerError);
      }
      
      await progressManager.updateProgress(
        'validating',
        0,
        estimatedRowCount,
        'Analizando estructura del archivo'
      );
      
      let completeBuffer;
      try {
        completeBuffer = await file.arrayBuffer();
      } catch (bufferError) {
        console.error('Error al leer el archivo completo:', bufferError);
        await progressManager.updateProgress(
          'error',
          0,
          totalBytes,
          'Error al leer el archivo: ' + bufferError.message
        );
        return {
          success: false,
          message: 'Error al leer el archivo: ' + bufferError.message
        };
      }
      
      await progressManager.updateProgress(
        'validating',
        Math.floor(file.size * 0.2),
        file.size,
        'Leyendo archivo completo'
      );
      
      let workbook;
      try {
        workbook = XLSX.read(new Uint8Array(completeBuffer), {
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd',
          WTF: true,
          cellNF: false,
          cellStyles: false,
          raw: false,
          codepage: 65001
        });
        
        completeBuffer = null;
        await forceGarbageCollection();
      } catch (xlsxError) {
        console.error('Error procesando Excel con XLSX:', xlsxError);
        
        await progressManager.updateProgress(
          'error',
          0,
          totalBytes,
          `Error al procesar el archivo Excel: ${xlsxError.message || 'Formato no reconocido'}`
        );
        
        return {
          success: false,
          message: `Error al procesar el archivo Excel: ${xlsxError.message || 'Formato no reconocido'}`,
          details: 'El archivo podría estar corrupto o no ser un formato Excel compatible.'
        };
      }
      
      if (!workbook?.SheetNames?.length) {
        return {
          success: false,
          message: 'El archivo Excel no contiene hojas válidas'
        };
      }
      
      const worksheetName = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[worksheetName];
      
      if (!worksheet || !worksheet['!ref']) {
        await progressManager.updateProgress(
          'error',
          0,
          totalBytes,
          'La hoja Excel está vacía o no tiene datos'
        );
        return {
          success: false,
          message: 'La hoja Excel está vacía o no tiene datos'
        };
      }
      
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      headerRange.e.r = headerRange.s.r;
      
      const headerRow: Record<string, any> = {};
      let validHeadersFound = false;
      
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({r: headerRange.s.r, c: C})];
        if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
          const header = XLSX.utils.encode_col(C);
          headerRow[header] = cell.v;
          validHeadersFound = true;
          console.log(`Encabezado encontrado: ${header} = ${cell.v}`);
        }
      }
      
      if (!validHeadersFound) {
        await progressManager.updateProgress(
          'error',
          0,
          totalBytes,
          'No se encontraron encabezados válidos en la primera fila del Excel'
        );
        return {
          success: false,
          message: 'No se encontraron encabezados válidos en la primera fila del Excel'
        };
      }
      
      const headerNames = Object.values(headerRow);
      const headerMapping = mapColumnNames(headerNames);
      
      if (Object.keys(headerMapping).length === 0) {
        await progressManager.updateProgress(
          'error',
          0,
          totalBytes,
          'No se pudo determinar un mapeo válido para las columnas del Excel'
        );
        return {
          success: false,
          message: 'No se pudo determinar un mapeo válido para las columnas del Excel'
        };
      }
      
      const excelNameToColumn: Record<string, string> = {};
      for (const [column, name] of Object.entries(headerRow)) {
        if (typeof name === 'string') {
          excelNameToColumn[name] = column;
        } else {
          excelNameToColumn[String(name)] = column;
        }
      }
      
      const columnMapping: Record<string, string> = {};
      for (const [excelName, dbColumn] of Object.entries(headerMapping)) {
        const excelColumn = excelNameToColumn[excelName];
        if (excelColumn) {
          columnMapping[excelColumn] = dbColumn;
        }
      }
      
      console.log("Mapeo de columnas resultante:", JSON.stringify(columnMapping));
      
      await progressManager.updateProgress(
        'validating',
        Math.floor(file.size * 0.3),
        file.size,
        'Extrayendo datos'
      );
      
      let data;
      try {
        data = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'yyyy-mm-dd',
          defval: null,
          blankrows: false,
          header: 'A'
        });
        
        if (!data || data.length === 0) {
          await progressManager.updateProgress(
            'error',
            0,
            totalBytes,
            'No se pudieron extraer datos del archivo Excel'
          );
          return {
            success: false,
            message: 'No se pudieron extraer datos del archivo Excel'
          };
        }
        
        console.log(`Se extrajeron ${data.length} filas de datos del Excel`);
        
        console.log('Ejemplo de la primera fila extraída:', JSON.stringify(data[0]).substring(0, 500));
      } catch (jsonError) {
        console.error('Error convirtiendo a JSON:', jsonError);
        await progressManager.updateProgress(
          'error',
          0,
          totalBytes,
          `Error al procesar los datos: ${jsonError.message}`
        );
        return {
          success: false,
          message: `Error al procesar los datos: ${jsonError.message}`
        };
      }
      
      worksheet = null;
      workbook = null;
      await forceGarbageCollection();
      
      await progressManager.updateProgress(
        'validating',
        Math.floor(file.size * 0.4),
        file.size,
        'Iniciando procesamiento de datos'
      );
      
      const transformedData = [];
      let validRowCount = 0;
      
      for (const record of data) {
        const transformedRow = transformRowData(record, columnMapping);
        if (Object.keys(transformedRow).length > 0) {
          transformedData.push(transformedRow);
          validRowCount++;
        }
      }
      
      if (transformedData.length === 0) {
        await progressManager.updateProgress(
          'error',
          0,
          totalBytes,
          'No se pudieron procesar datos válidos del Excel. Revise el formato y los encabezados.'
        );
        return {
          success: false,
          message: 'No se pudieron procesar datos válidos del Excel. Revise el formato y los encabezados.'
        };
      }
      
      const batchProcessor = new BatchProcessor(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        progressManager,
        config
      );
      
      let totalRows = transformedData.length;
      let totalProcessed = 0;
      let allResults: any = { success: true, insertedCount: 0, errors: [] };
      
      const batchSize = 5;
      
      await progressManager.updateProgress(
        'importing',
        0,
        totalRows,
        `Preparando importación de ${totalRows} registros`
      );
      
      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batchData = transformedData.slice(i, i + batchSize);
        
        try {
          const batchResult = await batchProcessor.processBatch(batchData);
          
          if (batchResult.insertedCount) allResults.insertedCount += batchResult.insertedCount;
          if (batchResult.errors && batchResult.errors.length) {
            allResults.errors = [...allResults.errors, ...batchResult.errors];
          }
          
          totalProcessed += batchData.length;
          
          await progressManager.updateProgress(
            'importing',
            totalProcessed,
            totalRows,
            `Procesadas ${totalProcessed} filas de ${totalRows} detectadas`
          );
          
          await forceGarbageCollection();
          
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (batchError) {
          console.error("Error procesando batch:", batchError);
          allResults.errors.push({
            message: `Error en lote ${Math.ceil(i / batchSize)}: ${batchError.message}`,
            batch: Math.ceil(i / batchSize),
            details: batchError.stack || "No hay detalles adicionales"
          });
        }
      }
      
      const finalStatus = allResults.errors?.length > 0 ? 'completed_with_errors' : 'completed';
      const finalMessage = allResults.errors?.length > 0 
        ? `Importación completada con ${allResults.errors.length} errores. Se insertaron ${allResults.insertedCount || 0} registros.`
        : `Se importaron ${allResults.insertedCount || 0} registros exitosamente`;
      
      await progressManager.updateProgress(
        finalStatus as any,
        totalProcessed,
        totalRows,
        finalMessage
      );
      
      allResults.totalCount = totalRows;
      allResults.message = finalMessage;
      
      for (const record of transformedData) {
        const intervalFields = ['tiempo_retraso', 'tiempo_punto_origen', 'tiempo_estimado', 'duracion_servicio'];
        intervalFields.forEach(field => {
          if (field in record) {
            if (record[field] === '' || record[field] === null || record[field] === undefined) {
              console.log(`Removing empty interval field ${field} before batch processing`);
              delete record[field];
              return;
            }
            
            if (typeof record[field] === 'string') {
              const cleanValue = record[field].trim();
              
              if (cleanValue === '' || cleanValue === '""' || cleanValue === "''") {
                console.log(`Removing empty-looking interval field ${field}: "${cleanValue}"`);
                delete record[field];
                return;
              }
              
              if (!/^[0-9:.hm\s]+$/.test(cleanValue) && !cleanValue.match(/\d+\s*(hour|minute|second|day|week|month|year)/i)) {
                console.log(`Removing suspicious interval value for ${field}: "${cleanValue}"`);
                delete record[field];
              }
            }
          }
        });
      }
      
      return allResults;
      
    } catch (parseError) {
      console.error('Error crítico en el procesamiento del Excel:', parseError);
      await progressManager.updateProgress(
        'error',
        0,
        totalBytes,
        'Error al procesar el archivo Excel: ' + parseError.message
      );
      
      return {
        success: false,
        message: 'Error al procesar el archivo Excel: ' + parseError.message,
        error: parseError
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
      message: 'Error general en el procesamiento: ' + error.message,
      error
    };
  }
}
