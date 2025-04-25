
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { ProgressManager } from './progressManager.ts';
import { transformRowData } from './dataTransformer.ts';
import { isMemoryUsageAboveThreshold, reportMemoryUsage, forceGarbageCollection } from './memoryMonitor.ts';

interface BatchProcessorConfig {
  batchSize: number;
  processingDelay: number;
  maxProcessingTime: number;
  backoffFactor: number;
  maxRetries: number;
  initialBackoff: number;
  memoryThreshold: number;
}

interface BatchProcessorResult {
  success: boolean;
  message: string;
  insertedCount: number;
  totalCount: number;
  errors?: Array<{
    batch?: number;
    message: string;
    details?: string;
  }>;
}

export class BatchProcessor {
  private supabase;
  private progressManager;
  private config: BatchProcessorConfig;

  constructor(
    supabaseUrl: string, 
    supabaseKey: string,
    progressManager: ProgressManager,
    config: BatchProcessorConfig
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.progressManager = progressManager;
    this.config = config;
  }

  async processBatches(jsonData: any[], headerMapping: Record<string, string>): Promise<BatchProcessorResult> {
    let insertedCount = 0;
    const totalRows = jsonData.length;
    const errors: Array<{batch?: number; message: string; details?: string}> = [];
    const startTime = Date.now();
    
    // Asegurarse que no estamos intentando procesar un conjunto vacío
    if (totalRows === 0) {
      return {
        success: true,
        message: "No se encontraron datos para procesar",
        insertedCount: 0,
        totalCount: 0
      };
    }
    
    // Reducir aún más el tamaño del lote si hay demasiados registros
    let effectiveBatchSize = this.config.batchSize;
    if (totalRows > 1000) {
      // Tamaño de lote adaptativo - más pequeño para conjuntos grandes
      effectiveBatchSize = Math.min(
        this.config.batchSize,
        Math.max(5, Math.floor(500 / Math.log10(totalRows)))
      );
      console.log(`Ajustando tamaño de lote a ${effectiveBatchSize} para optimizar procesamiento de ${totalRows} filas`);
    }
    
    // Dividir en sublotes más pequeños para procesar archivos muy grandes
    const totalBatches = Math.ceil(totalRows / effectiveBatchSize);
    
    await this.progressManager.updateProgress(
      'importing',
      0,
      totalRows,
      `Iniciando importación de ${totalRows} registros en ${totalBatches} lotes pequeños`
    );
    
    // Reportar estado inicial de la memoria
    reportMemoryUsage("Inicio procesamiento por lotes");

    try {
      // Mantener registro de batches consecutivos fallidos para abortar si es necesario
      let consecutiveFailures = 0;
      
      for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
        // Verificar tiempo máximo de procesamiento
        if (Date.now() - startTime > this.config.maxProcessingTime) {
          throw new Error(`Tiempo máximo de procesamiento excedido (${Math.round(this.config.maxProcessingTime/60000)} minutos)`);
        }

        // Verificar uso de memoria y forzar GC si es necesario
        if (isMemoryUsageAboveThreshold(this.config.memoryThreshold)) {
          console.warn(`Uso de memoria alto en lote ${batchNum + 1}, ejecutando GC...`);
          await forceGarbageCollection();
          await new Promise(resolve => setTimeout(resolve, 500)); // Dar tiempo adicional para liberar memoria
        }

        const startIdx = batchNum * effectiveBatchSize;
        const endIdx = Math.min((batchNum + 1) * effectiveBatchSize, totalRows);
        const batchData = jsonData.slice(startIdx, endIdx);
        
        try {
          // Intentar procesar este lote con reintentos y backoff exponencial
          const batchResult = await this.processBatchWithRetries(
            batchData, 
            headerMapping, 
            batchNum
          );
          
          if (batchResult.success) {
            insertedCount += batchResult.insertedCount;
            consecutiveFailures = 0; // Resetear contador de fallos
          } else if (batchResult.error) {
            consecutiveFailures++;
            errors.push({
              batch: batchNum + 1,
              message: batchResult.error.message || 'Error desconocido en el lote',
              details: batchResult.error.details
            });
            
            console.warn(`Error en lote ${batchNum + 1}: ${batchResult.error.message}. Fallos consecutivos: ${consecutiveFailures}`);
            
            // Si hay demasiados fallos consecutivos, hacer una pausa más larga o abortar
            if (consecutiveFailures >= 3) {
              console.warn(`${consecutiveFailures} fallos consecutivos detectados, haciendo pausa extendida...`);
              await forceGarbageCollection();
              await new Promise(r => setTimeout(r, consecutiveFailures * 2000)); // Pausa más larga
              
              if (consecutiveFailures >= 5) {
                throw new Error("Demasiados errores consecutivos, abortando proceso");
              }
            }
          }

          // Actualizar progreso cada batch para mejor visibilidad
          await this.updateImportProgress(startTime, insertedCount, totalRows);
          
          // Breve retraso entre lotes para prevenir sobrecarga y dar tiempo al GC
          // Retraso adaptativo basado en el número de registros procesados
          const adaptiveDelay = Math.min(2000, this.config.processingDelay * (1 + Math.log10(batchNum + 1) / 10));
          if (batchNum < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
          }
          
        } catch (batchError) {
          console.error(`Excepción no controlada en lote ${batchNum + 1}:`, batchError);
          consecutiveFailures++;
          
          errors.push({
            batch: batchNum + 1,
            message: batchError instanceof Error ? batchError.message : 'Error desconocido'
          });
          
          // Si hay un problema grave, hacer pausa más larga
          if (consecutiveFailures >= 3) {
            console.warn(`${consecutiveFailures} fallos consecutivos detectados, haciendo pausa extendida para recuperación...`);
            await forceGarbageCollection();
            await new Promise(r => setTimeout(r, 5000)); // Pausa de 5 segundos
          } else {
            // Realizar una pausa más larga después de errores para permitir recuperación
            await new Promise(resolve => setTimeout(resolve, this.config.processingDelay * 3));
          }
          
          // Abortar si hay demasiados fallos consecutivos
          if (consecutiveFailures >= 5) {
            throw new Error("Demasiados errores consecutivos, abortando proceso");
          }
        }
        
        // Liberar referencias explícitamente para ayudar al GC después de cada lote
        // @ts-ignore: Intentar liberar memoria explícitamente
        batchData.length = 0;
        
        // Forzar GC cada cierto número de lotes procesados
        if (batchNum % 3 === 0 && batchNum > 0) {
          await forceGarbageCollection();
        }
      }

      return this.generateResult(insertedCount, totalRows, errors);
    } catch (error) {
      // Error general en el procesamiento por lotes
      console.error("Error crítico en el procesamiento por lotes:", error);
      
      // Actualizar estado de progreso a error
      await this.progressManager.updateProgress(
        'error',
        insertedCount,
        totalRows,
        `Error: ${error.message}`
      );
      
      return {
        success: false,
        message: `Error en la importación: ${error.message}`,
        insertedCount,
        totalCount: totalRows,
        errors: [...errors, { message: error.message }]
      };
    } finally {
      // Reportar estado final de la memoria
      reportMemoryUsage("Finalización procesamiento por lotes");
    }
  }

  private async processBatchWithRetries(batchData: any[], headerMapping: Record<string, string>, batchNum: number): Promise<{ 
    success: boolean; 
    insertedCount: number; 
    error?: { message: string; details?: string } 
  }> {
    let attempts = 0;
    let backoffTime = this.config.initialBackoff;
    
    while (attempts < this.config.maxRetries) {
      try {
        // Transformar en micro-batches para reducir presión de memoria
        const transformedBatch = [];
        const maxMicroBatchSize = 5; // Procesar de 5 en 5 para reducir memoria
        
        for (let i = 0; i < batchData.length; i += maxMicroBatchSize) {
          const microBatch = batchData.slice(i, i + maxMicroBatchSize);
          const transformedMicroBatch = microBatch.map(row => transformRowData(row, headerMapping));
          
          transformedBatch.push(...transformedMicroBatch);
          
          // Mini pausa cada micro-batch para dar tiempo al GC si es necesario
          if (i + maxMicroBatchSize < batchData.length && i > 0 && i % 20 === 0) {
            await new Promise(r => setTimeout(r, 100));
          }
        }
        
        // Insertar datos usando upsert evitando duplicados, con mecanismo de reintentos
        try {
          const { error: insertError } = await this.supabase
            .from('servicios_custodia')
            .insert(transformedBatch);
          
          if (insertError) {
            attempts++;
            console.error(`Error en lote ${batchNum + 1} (intento ${attempts}):`, insertError);
            
            // Si alcanzamos el máximo de reintentos, reportamos el error
            if (attempts >= this.config.maxRetries) {
              return {
                success: false,
                insertedCount: 0,
                error: {
                  message: insertError.message,
                  details: insertError.details
                }
              };
            }
            
            // Aplicar backoff exponencial con jitter para evitar thundering herd
            const jitter = Math.random() * 500;
            const waitTime = backoffTime + jitter;
            console.log(`Reintentando lote ${batchNum + 1} en ${Math.round(waitTime)}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            backoffTime = Math.floor(backoffTime * this.config.backoffFactor);
            
            // Forzar GC entre intentos
            await forceGarbageCollection();
          } else {
            // Éxito en la inserción
            return {
              success: true,
              insertedCount: transformedBatch.length
            };
          }
        } catch (dbError) {
          // Error específico de base de datos
          attempts++;
          console.error(`Error de base de datos en lote ${batchNum + 1} (intento ${attempts}):`, dbError);
          
          if (attempts >= this.config.maxRetries) {
            return {
              success: false,
              insertedCount: 0,
              error: {
                message: dbError instanceof Error ? dbError.message : 'Error de base de datos',
                details: 'Error de conexión o timeout en la base de datos'
              }
            };
          }
          
          // Backoff exponencial más agresivo para errores de DB
          const waitTime = backoffTime * 1.5;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          backoffTime = Math.floor(backoffTime * this.config.backoffFactor * 1.2);
        }
      } catch (error) {
        attempts++;
        console.error(`Excepción en procesamiento de lote ${batchNum + 1} (intento ${attempts}):`, error);
        
        // Si alcanzamos el máximo de reintentos, reportamos el error
        if (attempts >= this.config.maxRetries) {
          return {
            success: false,
            insertedCount: 0,
            error: {
              message: error instanceof Error ? error.message : 'Error desconocido'
            }
          };
        }
        
        // Aplicar backoff exponencial
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        backoffTime = Math.floor(backoffTime * this.config.backoffFactor);
      }
    }
    
    // Este código no debería ejecutarse nunca, pero lo dejamos por seguridad
    return {
      success: false,
      insertedCount: 0,
      error: {
        message: `No se pudo procesar el lote ${batchNum + 1} después de ${this.config.maxRetries} intentos`
      }
    };
  }

  private async updateImportProgress(startTime: number, insertedCount: number, totalRows: number) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const rowsPerSecond = insertedCount / Math.max(1, elapsedSeconds);
    const estimatedTimeRemaining = Math.round((totalRows - insertedCount) / Math.max(1, rowsPerSecond));
    
    const memoryInfo = reportMemoryUsage("Progreso de importación");
    const memoryUsageMB = memoryInfo ? Math.round(memoryInfo.heapUsed / (1024 * 1024)) : 'N/A';
    const memoryPercent = memoryInfo ? 
      Math.round((memoryInfo.heapUsed / memoryInfo.heapTotal) * 100) : 'N/A';
    
    await this.progressManager.updateProgress(
      'importing',
      insertedCount,
      totalRows,
      `Importando datos (${insertedCount} de ${totalRows}, ${rowsPerSecond.toFixed(1)} filas/s, ~${estimatedTimeRemaining}s restantes, Mem: ${memoryUsageMB}MB/${memoryPercent}%)`
    );
  }

  private generateResult(insertedCount: number, totalRows: number, errors: any[]): BatchProcessorResult {
    const success = errors.length === 0;
    const status = errors.length > 0 ? 'completed_with_errors' : 'completed';
    const message = errors.length > 0
      ? `Importación completada con ${errors.length} errores. Se insertaron ${insertedCount} de ${totalRows} registros.`
      : `Se importaron ${insertedCount} registros exitosamente`;

    this.progressManager.updateProgress(status, insertedCount, totalRows, message);

    return {
      success,
      message,
      insertedCount,
      totalCount: totalRows,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}
