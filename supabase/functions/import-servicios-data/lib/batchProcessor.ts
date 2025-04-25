
import { ProgressManager } from './progressManager.ts';

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
    this.supabase = { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7').createClient(
      supabaseUrl,
      supabaseKey
    );
    this.progressManager = progressManager;
    this.config = config;
  }

  // Procesar lotes de datos (versión simplificada y corregida)
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
      // Log de los datos para debug
      console.log('Primer registro a insertar:', JSON.stringify(data[0]).substring(0, 500));
      
      // Verificar que hay al menos un campo útil en cada registro
      const validRecords = data.filter(record => {
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

      while (!success && retryCount <= this.config.maxRetries) {
        try {
          // Insertar registros en servicios_custodia
          const { data: insertedData, error } = await this.supabase
            .from('servicios_custodia')
            .insert(validRecords)
            .select('id');

          // Si hay error, almacenar para posible reintento
          if (error) {
            console.error(`Error en el intento ${retryCount + 1}:`, error);
            insertError = error;
            
            // Si la columna no existe, continuar sin ese campo
            if (error.message?.includes('no existe la columna')) {
              const columnMatch = error.message.match(/la columna «([^»]+)»/);
              if (columnMatch && columnMatch[1]) {
                const badColumn = columnMatch[1];
                console.log(`Removiendo columna problemática: ${badColumn}`);
                
                // Eliminar la columna problemática de todos los registros
                validRecords.forEach(record => {
                  if (badColumn in record) {
                    delete record[badColumn];
                    console.log(`Eliminada columna ${badColumn} del registro`);
                  }
                });
                
                // Continuar con el siguiente intento (sin incrementar retryCount)
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
            results.insertedCount = validRecords.length;
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
