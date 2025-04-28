
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
    
    // Deep clone the data to avoid modifying the original
    const cleanedBatchData = JSON.parse(JSON.stringify(batchData));
    
    // Enhanced pre-processing for interval fields
    this.preprocessIntervalFields(cleanedBatchData);
    
    // Realizamos un proceso de inserción con reintentos y backoff exponencial
    while (retryCount <= maxRetries) {
      try {
        // Intentamos insertar los registros
        const { data, error } = await this.supabase
          .from('servicios_custodia')
          .insert(cleanedBatchData)
          .select();
        
        if (error) {
          console.error(`Error en el intento ${retryCount + 1}:`, error);
          
          // Specific handling for interval syntax errors
          if (this.isIntervalError(error)) {
            console.log("Detected interval syntax error, applying fix");
            
            if (this.fixIntervalErrors(cleanedBatchData, error)) {
              console.log("Applied interval field fixes, retrying immediately");
              continue;
            }
          }
          
          // Handle other specific error types
          if (this.handleSpecificError(cleanedBatchData, error)) {
            console.log("Applied specific error fix, retrying immediately");
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
          insertedCount = data ? data.length : cleanedBatchData.length;
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

  // Check if the error is related to interval syntax
  private isIntervalError(error: any): boolean {
    return (
      (error.code === "22007" || 
       error.message.includes('syntax for type interval')) && 
      error.message.includes('interval')
    );
  }

  // Fix interval errors in the data
  private fixIntervalErrors(data: any[], error: any): boolean {
    let fixApplied = false;
    const intervalFields = ['tiempo_retraso', 'tiempo_punto_origen', 'tiempo_estimado', 'duracion_servicio'];
    
    // Extract problematic value from error message if possible
    let problematicValue = "";
    const valueMatch = error.message.match(/type interval: "(.*)"/);
    if (valueMatch && valueMatch[1]) {
      problematicValue = valueMatch[1];
      console.log(`Problematic interval value identified: "${problematicValue}"`);
    }
    
    // Apply fixes to the data
    for (const record of data) {
      intervalFields.forEach(field => {
        if (field in record) {
          // If we found the exact problematic value, remove just that one
          if (problematicValue && String(record[field]) === problematicValue) {
            console.log(`Removing identified problematic interval field ${field} with value "${problematicValue}"`);
            delete record[field];
            fixApplied = true;
          }
          // For any empty or suspicious values, remove them
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
        }
      });
    }
    
    return fixApplied;
  }

  // Pre-process all interval fields before attempting database insert
  private preprocessIntervalFields(data: any[]): void {
    const intervalFields = ['tiempo_retraso', 'tiempo_punto_origen', 'tiempo_estimado', 'duracion_servicio'];
    
    for (const record of data) {
      intervalFields.forEach(field => {
        if (field in record) {
          // Remove empty values completely
          if (record[field] === '' || record[field] === null || record[field] === undefined) {
            console.log(`Pre-processing: Removing empty interval field ${field}`);
            delete record[field];
            return;
          }
          
          // Handle string values - convert to proper interval format
          if (typeof record[field] === 'string') {
            const cleanValue = record[field].trim().toLowerCase();
            
            // Skip empty, header-like values or obviously invalid formats
            if (cleanValue === '' || 
                cleanValue.includes('tiempo') || 
                cleanValue.includes('duración') ||
                cleanValue === '""' ||
                cleanValue === "''") {
              console.log(`Pre-processing: Removing invalid interval value: "${cleanValue}"`);
              delete record[field];
              return;
            }
            
            // Try to convert to a valid PostgreSQL interval format
            try {
              let formattedInterval: string | null = null;
              
              if (/^\d+$/.test(cleanValue)) {
                // Just a number, interpret as minutes
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
              
              if (formattedInterval) {
                record[field] = formattedInterval;
                console.log(`Pre-processing: Formatted interval: ${cleanValue} -> ${formattedInterval}`);
              } else {
                console.log(`Pre-processing: Could not format interval: ${cleanValue} - removing field`);
                delete record[field];
              }
            } catch (e) {
              console.log(`Pre-processing: Error processing interval ${field}: ${record[field]}. Removing field.`);
              delete record[field];
            }
          }
        }
      });
    }
  }

  // Handle other specific database errors
  private handleSpecificError(data: any[], error: any): boolean {
    let fixApplied = false;
    
    // Handle "Column not found" errors
    if (error.code === "PGRST204" && error.message.includes("Could not find")) {
      const matches = error.message.match(/Could not find the '(.+?)' column/);
      if (matches && matches[1]) {
        const problematicColumn = matches[1];
        console.log(`Removing problematic column: ${problematicColumn}`);
        
        // Remove the column from all records
        data.forEach(record => {
          if (problematicColumn in record) {
            delete record[problematicColumn];
            fixApplied = true;
          }
        });
      }
    }
    
    // Handle numeric format errors
    if ((error.code === "22P02" || error.code === "22003")) {
      // Special handling for cobro_cliente
      if (error.message.includes("cobro_cliente")) {
        console.log("Error específico con cobro_cliente, realizando limpieza especial");
        
        data.forEach(record => {
          if ('cobro_cliente' in record) {
            if (typeof record.cobro_cliente !== 'number' || isNaN(record.cobro_cliente)) {
              delete record.cobro_cliente;
              fixApplied = true;
            } else {
              record.cobro_cliente = Number(Number(record.cobro_cliente).toFixed(2));
              fixApplied = true;
            }
          }
        });
      } else {
        // General numeric format handling
        console.log("Error de conversión de datos, realizando limpieza general de valores");
        
        data.forEach(record => {
          Object.keys(record).forEach(key => {
            if (record[key] === '' || record[key] === undefined || record[key] === 'undefined') {
              delete record[key];
              fixApplied = true;
            }
            
            if (typeof record[key] === 'string' && !isNaN(Number(record[key]))) {
              record[key] = Number(record[key]);
              fixApplied = true;
              
              if (key === 'cobro_cliente' || key === 'costo_custodio' || key === 'casetas') {
                record[key] = Number(record[key].toFixed(2));
              }
            }
          });
        });
      }
    }
    
    // Handle date/time format errors
    if (error.code === "22007") {
      // Special handling for fecha_contratacion
      if (error.message.includes("fecha_contratacion")) {
        console.log("Error específico con fecha_contratacion, realizando limpieza especial");
        
        data.forEach(record => {
          if ('fecha_contratacion' in record) {
            // Try to fix the date format or remove if not fixable
            try {
              if (typeof record.fecha_contratacion === 'string') {
                // Clean the value and try to parse as a date
                const cleanValue = record.fecha_contratacion.replace(/[^0-9\/\-\.]/g, '');
                let dateValue = null;
                
                if (cleanValue.includes('/')) {
                  const parts = cleanValue.split('/');
                  if (parts.length === 3) {
                    let day = parseInt(parts[0], 10);
                    let month = parseInt(parts[1], 10);
                    let year = parseInt(parts[2], 10);
                    
                    // Add century if year is two digits
                    if (year < 100) year += 2000;
                    
                    if (day > 0 && day <= 31 && month > 0 && month <= 12) {
                      dateValue = new Date(year, month - 1, day);
                      record.fecha_contratacion = dateValue.toISOString().split('T')[0];
                      console.log(`Fixed fecha_contratacion: ${cleanValue} -> ${record.fecha_contratacion}`);
                      fixApplied = true;
                    } else {
                      delete record.fecha_contratacion;
                      fixApplied = true;
                    }
                  } else {
                    delete record.fecha_contratacion;
                    fixApplied = true;
                  }
                } else if (cleanValue.includes('-')) {
                  // Try to parse as ISO format
                  const testDate = new Date(cleanValue);
                  if (!isNaN(testDate.getTime())) {
                    record.fecha_contratacion = testDate.toISOString().split('T')[0];
                    fixApplied = true;
                  } else {
                    delete record.fecha_contratacion;
                    fixApplied = true;
                  }
                } else {
                  delete record.fecha_contratacion;
                  fixApplied = true;
                }
              } else {
                delete record.fecha_contratacion;
                fixApplied = true;
              }
            } catch (e) {
              console.log(`Error fixing fecha_contratacion: ${e}`);
              delete record.fecha_contratacion;
              fixApplied = true;
            }
          }
        });
      }
      // General date/time format errors
      else if (error.message.includes("date") || error.message.includes("time")) {
        const matches = error.message.match(/invalid input syntax for type (date|time): "(.+?)"/);
        if (matches && matches[2]) {
          const badValue = matches[2];
          const fieldType = matches[1];
          console.log(`Detected invalid ${fieldType} value: ${badValue}`);
          
          data.forEach(record => {
            Object.keys(record).forEach(key => {
              if (record[key] === badValue) {
                console.log(`Removing invalid ${fieldType} value "${badValue}" from field ${key}`);
                delete record[key];
                fixApplied = true;
              }
              
              // Also check fields with "fecha" or "hora" in their name
              if ((fieldType === 'date' && key.includes('fecha')) || 
                  (fieldType === 'time' && key.includes('hora'))) {
                if (typeof record[key] === 'string' && 
                    (record[key].includes('Fecha') || 
                     record[key].includes('fecha') ||
                     record[key].includes('Hora') ||
                     record[key].includes('hora'))) {
                  delete record[key];
                  fixApplied = true;
                }
              }
            });
          });
        }
      }
    }
    
    return fixApplied;
  }
}
