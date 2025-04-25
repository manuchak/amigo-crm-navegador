
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
import { ProgressManager } from './progressManager.ts';
import { BatchProcessor } from './batchProcessor.ts';
import { reportMemoryUsage, forceGarbageCollection } from './memoryMonitor.ts';
import { determineHeaderMapping } from './columnMapping.ts';
import { transformRowData, mapColumnNames } from './dataTransformer.ts';

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
    
    // Reportar progreso inicial
    await progressManager.updateProgress(
      'validating',
      processedBytes,
      totalBytes,
      'Iniciando lectura del archivo con procesamiento en stream'
    );

    // Aproximar el número total de filas basado en el tamaño del archivo
    // Esta es solo una estimación que se refinará más adelante
    let estimatedRowCount = Math.ceil(totalBytes / 200); // Aproximadamente 200 bytes por fila
    await progressManager.updateProgress(
      'validating',
      0,
      estimatedRowCount,
      'Estimando tamaño del archivo'
    );

    try {
      // Verificación preliminar del formato del archivo
      // Cargar solo los primeros bytes para validar que es un archivo Excel válido
      const headerBytes = await file.slice(0, Math.min(8192, file.size)).arrayBuffer();
      
      try {
        // Intentar validar la cabecera del archivo
        const headerView = new Uint8Array(headerBytes);
        
        // Verificar firma de archivo Excel (.xlsx)
        // Los archivos .xlsx son archivos ZIP, que empiezan con PK
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
      
      // Cargar todo el archivo para procesarlo
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
        // Intentar leer el archivo usando opciones más robustas
        workbook = XLSX.read(new Uint8Array(completeBuffer), {
          type: 'array',
          cellDates: true,
          dateNF: 'yyyy-mm-dd',  // Formato de fecha consistente
          WTF: true, // Activa modo más tolerante a errores
          cellNF: false, // No procesar formatos de números para mejorar rendimiento
          cellStyles: false, // No procesar estilos para mejorar rendimiento
          raw: false, // No usar modo raw para garantizar conversión adecuada de fechas
          codepage: 65001 // UTF-8
        });
        
        // Liberar memoria del buffer una vez leído
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
      
      // Seleccionar la primera hoja
      const worksheetName = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[worksheetName];
      
      // Verificar si la hoja está vacía
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
      
      // Extraer encabezados y verificar que sean válidos
      const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
      headerRange.e.r = headerRange.s.r; // Limitar solo a la primera fila
      
      const headerRow: Record<string, any> = {};
      let validHeadersFound = false;
      
      // Extraer encabezados - esto es crucial para el mapeo correcto
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
      
      // Determinar mapeo de columnas usando las funciones de la librería dataTransformer
      // Convertir el objeto headerRow a un array de valores para mapColumnNames
      const headerNames = Object.values(headerRow);
      const headerMapping = mapColumnNames(headerNames);
      
      // Verificar si tenemos un mapeo mínimo necesario
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
      
      // Crear un mapeo inverso de nombres de Excel a columnas de Excel
      const excelNameToColumn: Record<string, string> = {};
      for (const [column, name] of Object.entries(headerRow)) {
        if (typeof name === 'string') {
          excelNameToColumn[name] = column;
        } else {
          excelNameToColumn[String(name)] = column;
        }
      }
      
      // Convertir headerMapping de mapeo por nombre a mapeo por columna
      const columnMapping: Record<string, string> = {};
      for (const [excelName, dbColumn] of Object.entries(headerMapping)) {
        const excelColumn = excelNameToColumn[excelName];
        if (excelColumn) {
          columnMapping[excelColumn] = dbColumn;
        }
      }
      
      // Mostrar el mapeo para debugging
      console.log("Mapeo de columnas resultante:", JSON.stringify(columnMapping));
      
      await progressManager.updateProgress(
        'validating',
        Math.floor(file.size * 0.3),
        file.size,
        'Extrayendo datos'
      );
      
      // Convertir a JSON con opciones específicas para garantizar conversión correcta
      let data;
      try {
        // Usar sheet_to_json para convertir a objetos JavaScript
        data = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // No usar valores crudos para garantizar conversión correcta
          dateNF: 'yyyy-mm-dd', // Formato de fecha consistente
          defval: null, // Valor por defecto para celdas vacías
          blankrows: false, // Ignorar filas vacías
          header: 'A' // Usar letras de columna como nombres
        });
        
        // Verificar que obtuvimos datos
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
        
        // Mostrar ejemplo de la primera fila para debugging
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
      
      // Liberar memoria del workbook y worksheet
      worksheet = null;
      workbook = null;
      await forceGarbageCollection();
      
      await progressManager.updateProgress(
        'validating',
        Math.floor(file.size * 0.4),
        file.size,
        'Iniciando procesamiento de datos'
      );
      
      // Transformar datos antes de insertar (pre-procesamiento)
      const transformedData = [];
      let validRowCount = 0;
      
      for (const row of data) {
        const transformedRow = transformRowData(row, columnMapping);
        // Solo incluir filas que tengan al menos un campo válido
        if (Object.keys(transformedRow).length > 0) {
          transformedData.push(transformedRow);
          validRowCount++;
        }
      }
      
      // Verificar si tenemos datos transformados válidos
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
      
      // Crear el procesador de lotes
      const batchProcessor = new BatchProcessor(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        progressManager,
        config
      );
      
      // Variables para seguimiento del proceso
      let totalRows = transformedData.length;
      let totalProcessed = 0;
      let allResults: any = { success: true, insertedCount: 0, errors: [] };
      
      // Procesar en pequeños lotes para evitar problemas de memoria
      const batchSize = 5; // Reducido a 5 filas por lote
      
      await progressManager.updateProgress(
        'importing',
        0,
        totalRows,
        `Preparando importación de ${totalRows} registros`
      );
      
      for (let i = 0; i < transformedData.length; i += batchSize) {
        const batchData = transformedData.slice(i, i + batchSize);
        
        try {
          // Ya no necesitamos pasar headerMapping porque los datos ya están transformados
          const batchResult = await batchProcessor.processBatch(batchData);
          
          // Acumular resultados
          if (batchResult.insertedCount) allResults.insertedCount += batchResult.insertedCount;
          if (batchResult.errors && batchResult.errors.length) {
            allResults.errors = [...allResults.errors, ...batchResult.errors];
          }
          
          totalProcessed += batchData.length;
          
          // Actualizar progreso
          await progressManager.updateProgress(
            'importing',
            totalProcessed,
            totalRows,
            `Procesadas ${totalProcessed} filas de ${totalRows} detectadas`
          );
          
          // Forzar liberación de memoria entre lotes
          await forceGarbageCollection();
          
          // Pequeña pausa para evitar sobrecargar la BD
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
      
      // Actualizar estado final en la base de datos
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
