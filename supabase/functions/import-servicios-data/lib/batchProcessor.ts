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
    
    // Enhanced pre-processing to prevent interval syntax errors
    for (const record of batchData) {
      // Process interval fields with special handling
      const intervalFields = ['tiempo_retraso', 'tiempo_punto_origen', 'tiempo_estimado', 'duracion_servicio'];
      
      intervalFields.forEach(field => {
        if (field in record) {
          // CRITICAL FIX: Remove empty string and null values for interval fields completely
          if (record[field] === '' || record[field] === null || record[field] === undefined) {
            console.log(`Removing empty/null interval value for ${field}`);
            delete record[field];
            return;
          }
          
          // If it's a string but not in a valid interval format, try to convert it
          if (typeof record[field] === 'string') {
            const cleanValue = record[field].trim().toLowerCase();
            
            // Skip empty or header-like values
            if (cleanValue === '' || 
                cleanValue.includes('tiempo') || 
                cleanValue.includes('duración') ||
                cleanValue === '""' ||
                cleanValue === "''") {
              console.log(`Removing invalid interval value for ${field}: "${cleanValue}"`);
              delete record[field];
              return;
            }
            
            try {
              // Try to format to a valid PostgreSQL interval syntax
              let formattedInterval: string | null = null;
              
              if (/^\d+$/.test(cleanValue)) {
                // Just a number, interpret as minutes for clear time intervals
                formattedInterval = `${cleanValue} minutes`;
              } else if (cleanValue.includes(':')) {
                // Format HH:MM or HH:MM:SS
                const parts = cleanValue.split(':');
                if (parts.length === 2) {
                  const hours = parseInt(parts[0], 10) || 0;
                  const minutes = parseInt(parts[1], 10) || 0;
                  formattedInterval = `${hours} hours ${minutes} minutes`;
                } else if (parts.length === 3) {
                  const hours = parseInt(parts[0], 10) || 0;
                  const minutes = parseInt(parts[1], 10) || 0;
                  const seconds = parseInt(parts[2], 10) || 0;
                  formattedInterval = `${hours} hours ${minutes} minutes ${seconds} seconds`;
                }
              } else if (cleanValue.includes('h') || cleanValue.includes('m')) {
                // Already a descriptive format like "2h 30m"
                formattedInterval = cleanValue
                  .replace('h', ' hours ')
                  .replace('m', ' minutes ')
                  .trim();
              }
              
              // If we could format it, use the formatted value, otherwise remove the field
              if (formattedInterval) {
                record[field] = formattedInterval;
                console.log(`Formatted interval: ${cleanValue} -> ${formattedInterval}`);
              } else {
                console.log(`Could not format interval: ${cleanValue} - removing field`);
                delete record[field];
              }
            } catch (e) {
              console.log(`Error processing interval ${field}: ${record[field]}. Removing field.`);
              delete record[field];
            }
          }
        }
      });
      
      // Handle interval type fields to prevent syntax errors with empty strings
      const intervalFields = ['tiempo_retraso', 'tiempo_punto_origen', 'tiempo_estimado', 'duracion_servicio'];
      intervalFields.forEach(field => {
        if (field in record) {
          // If the value is empty or null, remove the field entirely
          if (record[field] === '' || record[field] === null) {
            console.log(`Removing empty interval value for ${field}`);
            delete record[field];
            return;
          } 
          
          // If it's a string, try to convert to a valid interval format
          if (typeof record[field] === 'string') {
            const cleanValue = record[field].trim().toLowerCase();
            
            // Skip empty or header-like values
            if (cleanValue === '' || cleanValue.includes('tiempo') || cleanValue.includes('duración')) {
              delete record[field];
              return;
            }
            
            try {
              // Try to format to a valid PostgreSQL interval syntax
              let formattedInterval: string | null = null;
              
              if (/^\d+$/.test(cleanValue)) {
                // Just a number, interpret as minutes
                formattedInterval = `${cleanValue} minutes`;
              } else if (cleanValue.includes(':')) {
                // Format HH:MM or HH:MM:SS
                const parts = cleanValue.split(':');
                if (parts.length === 2) {
                  formattedInterval = `${parts[0]} hours ${parts[1]} minutes`;
                } else if (parts.length === 3) {
                  formattedInterval = `${parts[0]} hours ${parts[1]} minutes ${parts[2]} seconds`;
                }
              } else if (cleanValue.includes('h') || cleanValue.includes('m')) {
                // Already a descriptive format like "2h 30m"
                formattedInterval = cleanValue
                  .replace('h', ' hours ')
                  .replace('m', ' minutes ')
                  .trim();
              }
              
              // If we could format it, use the formatted value, otherwise remove the field
              if (formattedInterval) {
                record[field] = formattedInterval;
                console.log(`Formatted interval: ${cleanValue} -> ${formattedInterval}`);
              } else {
                console.log(`Could not format interval: ${cleanValue}`);
                delete record[field];
              }
            } catch (e) {
              console.log(`Error processing interval ${field}: ${record[field]}. Removing field.`);
              delete record[field];
            }
          }
        }
      });
      
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
          
          // Special handling for interval syntax errors - CRITICAL FIX
          if ((error.code === "22007" || error.message.includes('syntax for type interval')) && error.message.includes('interval')) {
            console.log("Found interval syntax error, applying more aggressive fix");
            
            // Extract problematic value from error message
            let problematicValue = "";
            const valueMatch = error.message.match(/type interval: "(.*)"/);
            if (valueMatch && valueMatch[1]) {
              problematicValue = valueMatch[1];
              console.log(`Problematic interval value: "${problematicValue}"`);
            }
            
            // Remove all interval fields that might be causing issues
            const intervalFields = ['tiempo_retraso', 'tiempo_punto_origen', 'tiempo_estimado', 'duracion_servicio'];
            let fixApplied = false;
            
            for (const record of batchData) {
              intervalFields.forEach(field => {
                if (field in record) {
                  // If we found the exact problematic value, only remove that one
                  if (problematicValue && String(record[field]) === problematicValue) {
                    console.log(`Removing identified problematic interval field ${field} with value "${problematicValue}"`);
                    delete record[field];
                    fixApplied = true;
                  }
                  // For empty strings or any values that look suspicious, remove them
                  else if (
                    record[field] === '' || 
                    record[field] === null || 
                    record[field] === undefined ||
                    (typeof record[field] === 'string' && 
                     (record[field].trim() === '' || 
                      record[field] === '""' || 
                      record[field] === "''" || 
                      record[field].includes('NaN')))
                  ) {
                    console.log(`Removing potentially problematic empty/invalid interval field ${field}: "${record[field]}"`);
                    delete record[field];
                    fixApplied = true;
                  }
                  // If we don't know which value is problematic but this is our second attempt at fixing intervals
                  // remove all interval fields as a last resort
                  else if (retryCount > 0 && !fixApplied && !problematicValue) {
                    console.log(`Removing all interval fields ${field} as last resort`);
                    delete record[field];
                    fixApplied = true;
                  }
                }
              });
            }
            
            // If we applied a fix, try again immediately
            if (fixApplied) {
              console.log("Applied interval field fixes, retrying immediately");
              continue;
            }
          }
          
          // Special handling for cobro_cliente validation errors
          if (error.message && error.message.includes('cobro_cliente')) {
            console.log("Found cobro_cliente error, applying special fix");
            
            // Find and fix all cobro_cliente values
            for (const record of batchData) {
              if ('cobro_cliente' in record) {
                // Remove the field completely to avoid validation errors
                delete record.cobro_cliente;
                console.log("Removed problematic cobro_cliente field from record");
              }
            }
            
            // Try immediately with the fixed data
            continue;
          }
          
          // If the error is related to columns that don't exist, remove them and try again
          if (error.code === "PGRST204" && error.message.includes("Could not find")) {
            // Extract the problematic column name
            const matches = error.message.match(/Could not find the '(.+?)' column/);
            if (matches && matches[1]) {
              const problematicColumn = matches[1];
              console.log(`Removiendo columna problemática: ${problematicColumn}`);
              
              // Remove the column from all records in the batch
              batchData.forEach(record => {
                if (problematicColumn in record) {
                  delete record[problematicColumn];
                }
              });
              
              console.log(`Reintentando con ${batchData.length} registros sin la columna ${problematicColumn}`);
              continue; // Retry immediately with the corrected data
            }
          }
          
          // If the error is related to a numeric format, try to correct it
          if ((error.code === "22P02" || error.code === "22003") && error.message.includes("cobro_cliente")) {
            console.log("Error específico con cobro_cliente, realizando limpieza especial");
            
            // Special cleanup for cobro_cliente
            batchData.forEach(record => {
              if ('cobro_cliente' in record) {
                // If it's not a valid number, remove the field completely
                if (typeof record.cobro_cliente !== 'number' || isNaN(record.cobro_cliente)) {
                  delete record.cobro_cliente;
                } else {
                  // Make sure it's formatted correctly if it is a number
                  record.cobro_cliente = Number(Number(record.cobro_cliente).toFixed(2));
                }
              }
            });
            
            // Try again immediately
            continue;
          }
          
          // For date syntax errors, clean the date fields
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
          
          // If the error is a data type error, try more thorough cleaning
          if (error.code === "22P02" || error.code === "22003") {
            console.log("Error de conversión de datos, realizando limpieza general de valores");
            
            // General data type cleanup
            batchData.forEach(record => {
              Object.keys(record).forEach(key => {
                // If empty or problematic, remove
                if (record[key] === '' || record[key] === undefined || record[key] === 'undefined') {
                  delete record[key];
                }
                
                // If it looks like a number but is a string, convert
                if (typeof record[key] === 'string' && !isNaN(Number(record[key]))) {
                  record[key] = Number(record[key]);
                  
                  // Apply extra formatting for known numeric fields
                  if (key === 'cobro_cliente' || key === 'costo_custodio' || key === 'casetas') {
                    record[key] = Number(record[key].toFixed(2));
                  }
                }
              });
            });
            
            // Try again immediately
            continue;
          }
          
          // Increase retry counter and wait according to backoff strategy
          retryCount++;
          if (retryCount <= maxRetries) {
            const backoffTime = initialBackoff * Math.pow(backoffFactor, retryCount - 1);
            console.log(`Reintentando en ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
          
        } else {
          // Success! Record the number of rows inserted
          insertedCount = data ? data.length : batchData.length;
          console.log(`Insertadas ${insertedCount} filas exitosamente en el intento ${retryCount + 1}`);
          break;
        }
        
        // If we've reached the maximum number of retries, record the error
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
