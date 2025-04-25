
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
    
    // Sanitize numeric fields to ensure they're actually numeric
    for (const record of batchData) {
      // Process numeric fields
      const numericFields = ['km_teorico', 'km_recorridos', 'km_extras', 'costo_custodio', 'casetas', 'cobro_cliente', 'cantidad_transportes'];
      
      for (const field of numericFields) {
        if (record[field] !== undefined && record[field] !== null) {
          // If the field is a string that represents a number, convert it
          if (typeof record[field] === 'string') {
            // Clean the string by removing any non-numeric characters except decimal point
            const cleanStr = record[field]
              .replace(/[$€£¥]/g, '') // Remove currency symbols
              .replace(/\s/g, '') // Remove spaces
              .replace(/,/g, '.') // Replace comma with dot
              .replace(/[^\d.-]/g, ''); // Remove anything that's not a digit, dot or minus
              
            // Try to convert to number
            const numValue = parseFloat(cleanStr);
            
            // If conversion is successful, use the number value
            if (!isNaN(numValue)) {
              record[field] = numValue;
              console.log(`Converted field ${field} from "${record[field]}" to ${numValue}`);
            } else {
              // If conversion failed, remove the field
              console.log(`Could not convert field ${field} value "${record[field]}" to number - removing field`);
              delete record[field];
            }
          } else if (typeof record[field] !== 'number') {
            // If it's not a string nor a number, remove it
            console.log(`Field ${field} is not a number - removing field`);
            delete record[field];
          }
        }
      }
      
      // Lista de columnas problemáticas conocidas para eliminar de forma preventiva
      const knownProblemColumns = [
        'updated_at', 'tipo_de_unidad_adicional', 'tipo_de_unidad', 'tipo_de_servicio',
        'tipo_de_gadget', 'tipo_de_carga_adicional', 'tipo_de_carga', 'tiempo_en_punto_de_origen',
        'tiempo_de_retraso_hhmm', 'telfono_operador_adicional', 'telfono_del_operador',
        'telfono_de_emergencia', 'telfono_armado', 'telfono', 'presentacin',
        'placa_de_la_carga', 'placa_de_carga_adicional', 'nombre_del_operador_transporte',
        'nombre_del_cliente', 'nombre_de_operador_adicional', 'nombre_de_custodio',
        'localforneo', 'km_terico', 'id_del_servicio', 'id_cotizacin', 'hora_de_presentacin',
        'hora_de_inicio_de_custodia', 'hora_de_finalizacin', 'folio_del_cliente',
        'fecha_y_hora_de_cita'
      ];
      
      // Eliminar preventivamente las columnas problemáticas conocidas
      knownProblemColumns.forEach(column => {
        if (column in record) {
          delete record[column];
        }
      });
      
      // Normalizar valores de fecha para evitar problemas de formato
      const dateFields = ['fecha_primer_servicio', 'fecha_contratacion', 'fecha_hora_cita', 'fecha_hora_asignacion'];
      dateFields.forEach(field => {
        if (record[field] !== undefined) {
          // Si es un encabezado o un valor no válido para fecha, eliminar el campo
          if (typeof record[field] === 'string' && 
              (record[field].includes('Fecha') || 
               record[field].includes('fecha') || 
               record[field] === '')) {
            delete record[field];
          } else {
            try {
              // Intentar formatear la fecha correctamente si es una fecha válida
              const dateValue = new Date(record[field]);
              if (!isNaN(dateValue.getTime())) {
                record[field] = dateValue.toISOString();
              } else {
                delete record[field];
              }
            } catch (e) {
              delete record[field];
            }
          }
        }
      });
      
      // Normalizar valores de tiempo
      const timeFields = ['hora_arribo', 'hora_presentacion', 'hora_inicio_custodia', 'hora_finalizacion'];
      timeFields.forEach(field => {
        if (record[field] !== undefined) {
          if (typeof record[field] === 'string' && 
              (record[field].includes('Hora') || 
               record[field].includes('hora') || 
               record[field] === '')) {
            delete record[field];
          }
        }
      });
    }
    
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
          
          // Si el error está relacionado con un formato numérico, intentamos corregirlo
          if ((error.code === "22P02" || error.code === "22003") && error.message.includes("cobro_cliente")) {
            console.log("Error específico con cobro_cliente, realizando limpieza especial");
            
            // Limpieza especial para cobro_cliente
            batchData.forEach(record => {
              if ('cobro_cliente' in record) {
                // Si no es un número, eliminamos el campo
                if (typeof record.cobro_cliente !== 'number') {
                  delete record.cobro_cliente;
                }
              }
            });
            
            // Intentar otra vez inmediatamente
            continue;
          }
          
          // Para errores de sintaxis de fecha, limpiamos los campos de fecha
          if (error.code === "22007" && (error.message.includes("date") || error.message.includes("time"))) {
            const matches = error.message.match(/invalid input syntax for type (date|time): "(.+?)"/);
            if (matches && matches[2]) {
              const badValue = matches[2];
              const fieldType = matches[1];
              console.log(`Detectado valor de ${fieldType} inválido: ${badValue}`);
              
              // Limpiar valores problemáticos en todos los registros
              batchData.forEach(record => {
                Object.keys(record).forEach(key => {
                  if (record[key] === badValue) {
                    console.log(`Eliminado valor de ${fieldType} inválido "${badValue}" del campo ${key}`);
                    delete record[key];
                  }
                  
                  // También verificar si el campo contiene "fecha" o "hora" en su nombre
                  if ((fieldType === 'date' && key.includes('fecha')) || 
                      (fieldType === 'time' && key.includes('hora'))) {
                    if (typeof record[key] === 'string' && 
                        (record[key].includes('Fecha') || 
                         record[key].includes('fecha') ||
                         record[key].includes('Hora') ||
                         record[key].includes('hora'))) {
                      delete record[key];
                    }
                  }
                });
              });
              
              continue; // Reintentar inmediatamente con los datos corregidos
            }
          }
          
          // Si el error es de tipo de datos, intentamos hacer una limpieza más profunda
          if (error.code === "22P02" || error.code === "22003") {
            console.log("Error de conversión de datos, realizando limpieza general de valores");
            
            // Limpieza general de tipos de datos
            batchData.forEach(record => {
              Object.keys(record).forEach(key => {
                // Si es un valor vacío o problemático, eliminar
                if (record[key] === '' || record[key] === undefined || record[key] === 'undefined') {
                  delete record[key];
                }
                
                // Si parece ser un número pero está como string, convertir
                if (typeof record[key] === 'string' && !isNaN(Number(record[key]))) {
                  record[key] = Number(record[key]);
                }
              });
            });
            
            // Intentar otra vez inmediatamente
            continue;
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
