
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
    
    // Dividir en sublotes más pequeños para procesar archivos muy grandes
    const totalBatches = Math.ceil(totalRows / this.config.batchSize);
    
    await this.progressManager.updateProgress(
      'importing',
      0,
      totalRows,
      `Iniciando importación de ${totalRows} registros en ${totalBatches} lotes`
    );
    
    // Reportar estado inicial de la memoria
    reportMemoryUsage("Inicio procesamiento por lotes");

    try {
      for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
        // Verificar tiempo máximo de procesamiento
        if (Date.now() - startTime > this.config.maxProcessingTime) {
          throw new Error("Tiempo de procesamiento excedido");
        }

        // Verificar uso de memoria y forzar GC si es necesario
        if (isMemoryUsageAboveThreshold(this.config.memoryThreshold)) {
          console.warn(`Uso de memoria alto en lote ${batchNum + 1}, ejecutando GC...`);
          await forceGarbageCollection();
          await new Promise(resolve => setTimeout(resolve, 500)); // Dar tiempo adicional para liberar memoria
        }

        const startIdx = batchNum * this.config.batchSize;
        const endIdx = Math.min((batchNum + 1) * this.config.batchSize, totalRows);
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
          } else if (batchResult.error) {
            errors.push({
              batch: batchNum + 1,
              message: batchResult.error.message || 'Error desconocido en el lote',
              details: batchResult.error.details
            });
            
            // Si hay demasiados errores consecutivos, abortamos
            if (errors.length > 10 && errors.length === batchNum + 1) {
              throw new Error("Demasiados errores consecutivos, abortando proceso");
            }
          }

          // Actualizar progreso cada 2 lotes o si es el último lote
          if (batchNum % 2 === 0 || batchNum === totalBatches - 1) {
            await this.updateImportProgress(startTime, insertedCount, totalRows);
          }
          
          // Breve retraso entre lotes para prevenir sobrecarga y dar tiempo al GC
          if (batchNum < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, this.config.processingDelay));
          }
          
        } catch (batchError) {
          console.error(`Excepción no controlada en lote ${batchNum + 1}:`, batchError);
          errors.push({
            batch: batchNum + 1,
            message: batchError instanceof Error ? batchError.message : 'Error desconocido'
          });
          
          // Realizar una pausa más larga después de errores para permitir recuperación
          await new Promise(resolve => setTimeout(resolve, this.config.processingDelay * 2));
        }
        
        // Liberar referencias para ayudar al GC después de cada lote
        if (batchNum % 5 === 0) {
          await forceGarbageCollection();
        }
      }

      return this.generateResult(insertedCount, totalRows, errors);
    } catch (error) {
      // Error general en el procesamiento por lotes
      console.error("Error en el procesamiento por lotes:", error);
      
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
        const transformedBatch = batchData.map(row => transformRowData(row, headerMapping));
        
        // Insertar datos usando upsert para evitar duplicados
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
          
          // Aplicar backoff exponencial
          console.log(`Reintentando lote ${batchNum + 1} en ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
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
      } catch (error) {
        attempts++;
        console.error(`Excepción en lote ${batchNum + 1} (intento ${attempts}):`, error);
        
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
    
    await this.progressManager.updateProgress(
      'importing',
      insertedCount,
      totalRows,
      `Importando datos (${insertedCount} de ${totalRows}, ${rowsPerSecond.toFixed(1)} filas/s, ~${estimatedTimeRemaining}s restantes, Memoria: ${memoryUsageMB} MB)`
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
