
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { ProgressManager } from './progressManager.ts';
import { transformRowData } from './dataTransformer.ts';

interface BatchProcessorConfig {
  batchSize: number;
  processingDelay: number;
  maxProcessingTime: number;
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
    const totalBatches = Math.ceil(totalRows / this.config.batchSize);
    const errors: Array<{batch?: number; message: string; details?: string}> = [];
    const startTime = Date.now();

    await this.progressManager.updateProgress(
      'importing',
      0,
      totalRows,
      `Iniciando importación de ${totalRows} registros`
    );

    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      // Verificar tiempo máximo de procesamiento
      if (Date.now() - startTime > this.config.maxProcessingTime) {
        throw new Error("Tiempo de procesamiento excedido");
      }

      const startIdx = batchNum * this.config.batchSize;
      const endIdx = Math.min((batchNum + 1) * this.config.batchSize, totalRows);
      const batchData = jsonData.slice(startIdx, endIdx);
      
      try {
        const transformedBatch = batchData.map(row => transformRowData(row, headerMapping));
        const { error: insertError } = await this.supabase
          .from('servicios_custodia')
          .insert(transformedBatch);
        
        if (insertError) {
          console.error(`Error en lote ${batchNum + 1}:`, insertError);
          errors.push({
            batch: batchNum + 1,
            message: insertError.message,
            details: insertError.details
          });
        } else {
          insertedCount += transformedBatch.length;
        }

        // Actualizar progreso cada 5 lotes o si es el último lote
        if (batchNum % 5 === 0 || batchNum === totalBatches - 1) {
          await this.updateImportProgress(startTime, insertedCount, totalRows);
        }

        if (errors.length > 10) {
          throw new Error("Demasiados errores consecutivos");
        }
        
        // Breve retraso entre lotes para prevenir sobrecarga
        if (batchNum < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.processingDelay));
        }
      } catch (batchError) {
        console.error(`Excepción en lote ${batchNum + 1}:`, batchError);
        errors.push({
          batch: batchNum + 1,
          message: batchError instanceof Error ? batchError.message : 'Error desconocido'
        });
      }
    }

    return this.generateResult(insertedCount, totalRows, errors);
  }

  private async updateImportProgress(startTime: number, insertedCount: number, totalRows: number) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const rowsPerSecond = insertedCount / Math.max(1, elapsedSeconds);
    const estimatedTimeRemaining = Math.round((totalRows - insertedCount) / Math.max(1, rowsPerSecond));
    
    await this.progressManager.updateProgress(
      'importing',
      insertedCount,
      totalRows,
      `Importando datos (${insertedCount} de ${totalRows}, ~${estimatedTimeRemaining}s restantes)`
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
