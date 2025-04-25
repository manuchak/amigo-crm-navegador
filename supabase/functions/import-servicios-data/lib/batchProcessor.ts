
import { ProgressManager } from './progressManager.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

export class BatchProcessor {
  private supabase;
  private progressManager: ProgressManager;
  private config: {
    batchSize: number;
    processingDelay: number;
    maxProcessingTime: number;
    backoffFactor: number;
    maxRetries: number;
    initialBackoff: number;
    memoryThreshold: number;
  };

  constructor(
    supabaseUrl: string, 
    supabaseKey: string, 
    progressManager: ProgressManager,
    config: any
  ) {
    this.supabase = createClient(
      supabaseUrl,
      supabaseKey
    );
    this.progressManager = progressManager;
    this.config = config;
  }

  // Procesar lotes de datos (versión mejorada)
  async processBatch(data: Record<string, any>[]): Promise<{
    success: boolean;
    insertedCount: number;
    errors: Array<{
      message: string;
      details?: string;
      row?: number;
      batch?: number;
    }>;
  }> {
    const results = {
      success: true,
      insertedCount: 0,
      errors: [] as Array<{
        message: string;
        details?: string;
        row?: number;
        batch?: number;
      }>
    };

    if (!data || data.length === 0) {
      results.success = false;
      results.errors.push({
        message: "No se proporcionaron datos para procesar"
      });
      return results;
    }

    console.log(`Procesando lote con ${data.length} registros`);

    try {
      // Crear un mapa de columnas conflictivas que necesitan ser corregidas
      const columnMappingFixes: Record<string, string> = {
        'cobro_al_cliente': 'cobro_cliente', // Corregir el nombre de columna problemático
      };
      
      // Lista de columnas a ignorar si dan problemas
      const problematicColumns = [
        'cantidad_de_transportes',
        'tiempo_en_punto_de_origen',
        'tiempo_de_retraso_hhmm',
        'updated_at'
      ];
      
      // Verificar y corregir columnas problemáticas en todos los registros antes de intentar insertar
      const sanitizedData = data.map(record => {
        const correctedRecord = { ...record };
        
        // Revisar y corregir nombres de columna conocidos como problemáticos
        for (const [problematicCol, correctCol] of Object.entries(columnMappingFixes)) {
          if (problematicCol in correctedRecord) {
            // Guardar el valor bajo la columna correcta
            correctedRecord[correctCol] = correctedRecord[problematicCol];
            // Eliminar la columna problemática
            delete correctedRecord[problematicCol];
            console.log(`Corregido nombre de columna: ${problematicCol} -> ${correctCol}`);
          }
        }
        
        // Procesar campo armado para asegurar que sea booleano
        if ('armado' in correctedRecord) {
          const armadoValue = correctedRecord.armado;
          if (typeof armadoValue === 'string') {
            const lowerValue = armadoValue.toLowerCase();
            if (['si', 'sí', 'true', 'yes', 'armado', '1', 'verdadero'].includes(lowerValue)) {
              correctedRecord.armado = true;
            } else if (['no', 'false', 'desarmado', '0', 'falso'].includes(lowerValue)) {
              correctedRecord.armado = false;
            } else {
              // Si no se puede determinar, eliminar el campo para que use el valor predeterminado
              delete correctedRecord.armado;
            }
          }
        }
        
        // Eliminar columnas problemáticas conocidas
        for (const col of problematicColumns) {
          if (col in correctedRecord) {
            delete correctedRecord[col];
          }
        }
        
        return correctedRecord;
      });
      
      // Log de los datos para debug
      console.log('Primer registro a insertar (después de corrección):', JSON.stringify(sanitizedData[0]).substring(0, 500));
      
      // Verificar que hay al menos un campo útil en cada registro
      const validRecords = sanitizedData.filter(record => {
        const fieldCount = Object.keys(record).length;
        return fieldCount > 0;
      });
      
      if (validRecords.length === 0) {
        console.error("No hay registros válidos en el lote");
        results.errors.push({
          message: "No hay registros válidos para insertar"
        });
        return results;
      }

      // Insertar los registros con reintentos exponenciales
      let retryCount = 0;
      let success = false;
      let insertError = null;
      let currentRecords = [...validRecords]; // Comenzar con todos los registros válidos

      while (!success && retryCount <= this.config.maxRetries) {
        try {
          // Insertar registros en servicios_custodia
          const { data: insertedData, error } = await this.supabase
            .from('servicios_custodia')
            .insert(currentRecords)
            .select('id');

          // Si hay error, almacenar para posible reintento
          if (error) {
            console.error(`Error en el intento ${retryCount + 1}:`, error);
            insertError = error;
            
            // Si la columna no existe, identificarla y eliminarla de todos los registros
            if (error.message?.includes('no existe la columna') || 
                error.message?.includes('Could not find') || 
                error.code === 'PGRST204' ||
                error.message?.includes('invalid input syntax for type boolean')) {
              
              let badColumn = null;
              let badValue = null;
              
              // Intentar extraer el nombre de la columna problemática del mensaje de error
              const columnMatchSpanish = error.message.match(/la columna «([^»]+)»/);
              const columnMatchEnglish = error.message.match(/'([^']+)' column/);
              const columnMatchGeneric = error.message.match(/Could not find the '([^']+)' column/);
              const booleanValueMatch = error.message.match(/invalid input syntax for type boolean: "([^"]+)"/);
              
              if (columnMatchSpanish && columnMatchSpanish[1]) {
                badColumn = columnMatchSpanish[1];
              } else if (columnMatchEnglish && columnMatchEnglish[1]) {
                badColumn = columnMatchEnglish[1];
              } else if (columnMatchGeneric && columnMatchGeneric[1]) {
                badColumn = columnMatchGeneric[1];
              } else if (booleanValueMatch && booleanValueMatch[1]) {
                // Es un problema de valor booleano
                badValue = booleanValueMatch[1];
                console.log(`Problema con valor booleano: "${badValue}". Buscando columna con este valor...`);
                
                // Buscar la columna que tiene este valor incorrecto
                for (const record of currentRecords) {
                  for (const [col, val] of Object.entries(record)) {
                    if (val === badValue) {
                      badColumn = col;
                      console.log(`Encontrada columna problemática: ${col} con valor: ${val}`);
                      break;
                    }
                  }
                  if (badColumn) break;
                }
              }
              
              if (badColumn) {
                console.log(`Removiendo columna problemática: ${badColumn}`);
                
                // Eliminar la columna problemática de todos los registros
                currentRecords = currentRecords.map(record => {
                  const newRecord = { ...record };
                  if (badColumn && badColumn in newRecord) {
                    delete newRecord[badColumn];
                  }
                  return newRecord;
                });
                
                // Añadir columna a la lista de problemáticas para futuros registros
                if (!problematicColumns.includes(badColumn)) {
                  problematicColumns.push(badColumn);
                }
                
                // Continuar con el siguiente intento (sin incrementar retryCount)
                console.log(`Reintentando con ${currentRecords.length} registros sin la columna ${badColumn}`);
                continue;
              }
            }
            
            // Incrementar contador de reintentos para errores normales
            retryCount++;
            
            // Esperar con backoff exponencial
            const backoffTime = this.config.initialBackoff * Math.pow(this.config.backoffFactor, retryCount);
            console.log(`Reintentando en ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          } else {
            // Éxito
            success = true;
            results.insertedCount = currentRecords.length;
            console.log(`Se insertaron ${results.insertedCount} registros correctamente`);
          }
        } catch (error) {
          console.error(`Error inesperado en el intento ${retryCount + 1}:`, error);
          insertError = error;
          retryCount++;
          
          // Backoff exponencial
          const backoffTime = this.config.initialBackoff * Math.pow(this.config.backoffFactor, retryCount);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }

      // Si todos los reintentos fallaron
      if (!success) {
        results.success = false;
        results.errors.push({
          message: `Error al insertar datos después de ${retryCount} intentos`,
          details: insertError ? (insertError.message || JSON.stringify(insertError)) : 'Error desconocido'
        });
      }

      return results;
    } catch (error) {
      console.error("Error crítico en procesamiento de lote:", error);
      results.success = false;
      results.errors.push({
        message: "Error crítico en el procesamiento de lote",
        details: error.message || JSON.stringify(error)
      });
      return results;
    }
  }
}
