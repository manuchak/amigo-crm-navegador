
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { ProgressManager } from './progressManager.ts';
import { reportMemoryUsage, forceGarbageCollection } from './memoryMonitor.ts';

export class BatchProcessor {
  private supabase;
  private progressManager: ProgressManager;
  private config: any;
  
  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    progressManager: ProgressManager,
    config: any
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.progressManager = progressManager;
    this.config = config;
  }
  
  async processBatch(batchData: any[]): Promise<{ insertedCount: number, errors: any[] }> {
    console.log(`Procesando lote de ${batchData.length} registros`);
    
    if (batchData.length === 0) {
      return { insertedCount: 0, errors: [] };
    }

    let insertedCount = 0;
    const errors = [];
    let retryCount = 0;
    const maxRetries = this.config.maxRetries || 5;
    const backoffFactor = this.config.backoffFactor || 2;
    const initialBackoff = this.config.initialBackoff || 1000;
    
    // Realizamos un proceso de inserción con reintentos y backoff exponencial
    while (retryCount <= maxRetries) {
      try {
        // Intentamos insertar los registros
        const { data, error } = await this.supabase
          .from('servicios_custodia')
          .insert(batchData)
          .select();
        
        if (error) {
          console.error(`Error en el intento ${retryCount + 1}:`, error);
          
          // Si el error está relacionado con columnas que no existen, las eliminamos e intentamos de nuevo
          if (error.code === "PGRST204" && error.message.includes("Could not find")) {
            // Extraer el nombre de la columna problemática
            const matches = error.message.match(/Could not find the '(.+?)' column/);
            if (matches && matches[1]) {
              const problematicColumn = matches[1];
              console.log(`Removiendo columna problemática: ${problematicColumn}`);
              
              // Eliminar la columna de todos los registros del lote
              batchData.forEach(record => {
                if (problematicColumn in record) {
                  delete record[problematicColumn];
                }
              });
              
              console.log(`Reintentando con ${batchData.length} registros sin la columna ${problematicColumn}`);
              continue; // Reintentar inmediatamente con los datos corregidos
            }
          }
          
          // Para errores de sintaxis de fecha, podríamos intentar limpiar los campos de fecha
          if (error.code === "22007" && error.message.includes("invalid input syntax for type date")) {
            const matches = error.message.match(/invalid input syntax for type date: "(.+?)"/);
            if (matches && matches[1]) {
              const badDateValue = matches[1];
              console.log(`Detectado valor de fecha inválido: ${badDateValue}`);
              
              // Limpiar valores de fecha problemáticos en todos los campos de fecha conocidos
              const dateFields = ['fecha_primer_servicio', 'fecha_contratacion', 'fecha_hora_cita', 'fecha_hora_asignacion'];
              batchData.forEach(record => {
                dateFields.forEach(field => {
                  if (record[field] === badDateValue) {
                    delete record[field];
                    console.log(`Eliminado valor de fecha inválido "${badDateValue}" del campo ${field}`);
                  }
                });
              });
            }
          }
          
          // Aumentar el contador de reintentos y esperar según la estrategia de backoff
          retryCount++;
          const backoffTime = initialBackoff * Math.pow(backoffFactor, retryCount - 1);
          console.log(`Reintentando en ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          
        } else {
          // Éxito! Registramos el número de filas insertadas
          insertedCount = data ? data.length : batchData.length;
          console.log(`Insertadas ${insertedCount} filas exitosamente en el intento ${retryCount + 1}`);
          break;
        }
        
        // Si alcanzamos el máximo de reintentos, registramos el error
        if (retryCount >= maxRetries) {
          console.error(`Se alcanzó el máximo de reintentos (${maxRetries}). El último error fue:`, error);
          errors.push({
            message: `Error después de ${maxRetries} intentos: ${error.message}`,
            details: error
          });
        }
      } catch (e) {
        console.error(`Error inesperado en el intento ${retryCount + 1}:`, e);
        errors.push({
          message: `Error inesperado: ${e.message}`,
          details: e
        });
        
        retryCount++;
        if (retryCount <= maxRetries) {
          const backoffTime = initialBackoff * Math.pow(backoffFactor, retryCount - 1);
          console.log(`Reintentando en ${backoffTime}ms después de error inesperado...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
    
    // Liberar memoria después de procesar el lote
    await forceGarbageCollection();
    
    return {
      insertedCount,
      errors
    };
  }
}
