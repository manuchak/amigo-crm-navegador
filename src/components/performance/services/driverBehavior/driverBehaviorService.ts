import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { ProgressCallback, ImportResponse } from "../import/types";
import { handleImportError } from "../import/utils/errorHandler";
import { handleImportResponse } from "../import/utils/responseHandler";
import { 
  DriverBehaviorScore, 
  ScoreCalculationResult, 
  DriverBehaviorData,
  DriverBehaviorFilters,
  RiskAssessment,
  CO2Calculation
} from "../../types/driver-behavior.types";
import { calculateDriverBehaviorScore } from "../../utils/scoreCalculator";

export async function fetchDriverBehaviorData(
  dateRange: DateRange, 
  filters?: DriverBehaviorFilters
): Promise<DriverBehaviorData | null> {
  if (!dateRange.from || !dateRange.to) {
    return null;
  }

  try {
    let query = supabase
      .from('driver_behavior_scores')
      .select('*')
      .gte('start_date', dateRange.from.toISOString())
      .lte('end_date', dateRange.to.toISOString());
    
    if (filters) {
      if (filters.driverName) {
        query = query.ilike('driver_name', `%${filters.driverName}%`);
      }
      
      if (filters.driverGroup) {
        query = query.ilike('driver_group', `%${filters.driverGroup}%`);
      }
      
      if (filters.client) {
        query = query.ilike('client', `%${filters.client}%`);
      }
      
      if (filters.minScore !== undefined) {
        query = query.gte('score', filters.minScore);
      }
      
      if (filters.maxScore !== undefined) {
        query = query.lte('score', filters.maxScore);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching driver behavior data:', error);
      throw error;
    }

    return processDriverBehaviorData(data);
  } catch (error) {
    console.error('Error fetching driver behavior data:', error);
    return {
      metrics: [],
      driverScores: [],
      averageScore: 0,
      totalPenaltyPoints: 0,
      totalTrips: 0,
    };
  }
}

function processDriverBehaviorData(data: DriverBehaviorScore[] | null): DriverBehaviorData {
  if (!data || data.length === 0) {
    return {
      metrics: [],
      driverScores: [],
      averageScore: 0,
      totalPenaltyPoints: 0,
      totalTrips: 0,
    };
  }

  const totalDrivers = new Set(data.map(item => item.driver_name)).size;
  const totalTrips = data.reduce((sum, item) => sum + item.trips_count, 0);
  const totalPenaltyPoints = data.reduce((sum, item) => sum + item.penalty_points, 0);
  
  const averageScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
  
  let totalDrivingTime = 0;
  data.forEach(item => {
    if (item.duration_interval) {
      const hours = item.duration_interval.match(/(\d+)\s+hour/i);
      const minutes = item.duration_interval.match(/(\d+)\s+min/i);
      
      if (hours) {
        totalDrivingTime += parseInt(hours[1]) * 60;
      }
      
      if (minutes) {
        totalDrivingTime += parseInt(minutes[1]);
      }
    }
  });
  
  const totalDistance = data.reduce((sum, item) => sum + (item.distance || 0), 0);
  
  const scoreDistribution = {
    excellent: data.filter(item => item.score >= 90).length,
    good: data.filter(item => item.score >= 80 && item.score < 90).length,
    fair: data.filter(item => item.score >= 70 && item.score < 80).length,
    poor: data.filter(item => item.score >= 60 && item.score < 70).length,
    critical: data.filter(item => item.score < 60).length,
  };

  const riskAssessment = calculateRiskAssessment(data, averageScore);

  const co2Data = calculateCO2Emissions(totalDistance, data, averageScore);

  const driverPerformance = {
    topDrivers: [...data].sort((a, b) => b.score - a.score).slice(0, 3),
    needsImprovement: [...data].sort((a, b) => a.score - b.score).slice(0, 3),
    ecoDrivers: [...data]
      .filter(driver => driver.distance && driver.distance > 0)
      .sort((a, b) => {
        const penaltyA = a.penalty_points / (a.distance || 1);
        const penaltyB = b.penalty_points / (b.distance || 1);
        return penaltyA - penaltyB;
      }).slice(0, 3)
  };

  return {
    metrics: [
      { label: "Conductores", value: totalDrivers },
      { label: "Viajes", value: totalTrips },
      { label: "Puntos de Penalización", value: totalPenaltyPoints },
      { label: "Promedio de Score", value: averageScore.toFixed(2) },
      { label: "Tiempo Total de Conducción", value: formatDrivingTime(totalDrivingTime) },
      { label: "Distancia Total", value: `${totalDistance.toFixed(2)} km` },
      { label: "Emisiones de CO2", value: `${co2Data.baseEmissions.toFixed(2)} kg` },
      { label: "CO2 Desperdiciado", value: `${co2Data.wastage.toFixed(2)} kg` },
    ],
    driverScores: data,
    scoreDistribution,
    averageScore,
    totalPenaltyPoints,
    totalTrips,
    totalDrivingTime,
    totalDistance,
    co2Emissions: co2Data.baseEmissions,
    riskAssessment,
    driverPerformance
  };
}

function formatDrivingTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function calculateRiskAssessment(data: DriverBehaviorScore[], averageScore: number): RiskAssessment {
  const criticalPercentage = data.filter(d => d.score < 60).length / data.length;
  const riskScore = (100 - averageScore) * 0.7 + (criticalPercentage * 100) * 0.3;
  
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  let description: string;
  let recommendations: string[];
  
  if (riskScore < 20) {
    riskLevel = 'low';
    description = 'El comportamiento general de conducción es excelente con riesgo mínimo de accidentes.';
    recommendations = [
      'Mantener el programa actual de incentivos para conductores',
      'Compartir prácticas exitosas con nuevos conductores',
      'Considerar reducir la frecuencia de monitoreo'
    ];
  } else if (riskScore < 40) {
    riskLevel = 'moderate';
    description = 'Comportamiento de conducción generalmente bueno con oportunidades de mejora puntuales.';
    recommendations = [
      'Reforzar capacitación en maniobras específicas',
      'Implementar recordatorios periódicos de mejores prácticas',
      'Revisar rutas con mayor incidencia de eventos'
    ];
  } else if (riskScore < 60) {
    riskLevel = 'high';
    description = 'Comportamiento de conducción con importantes áreas de mejora y riesgo considerable.';
    recommendations = [
      'Incrementar frecuencia de capacitaciones',
      'Implementar sistema de alertas tempranas',
      'Asignar mentores a conductores con bajo rendimiento',
      'Revisar incentivos basados en comportamiento'
    ];
  } else {
    riskLevel = 'critical';
    description = 'Comportamiento de conducción de alto riesgo que requiere intervención inmediata.';
    recommendations = [
      'Capacitación obligatoria inmediata',
      'Sesiones individuales de coaching',
      'Revisión completa del programa de seguridad',
      'Posible reasignación de conductores de alto riesgo',
      'Auditoría de flota y equipamiento'
    ];
  }
  
  return {
    level: riskLevel,
    score: riskScore,
    description,
    recommendations
  };
}

function calculateCO2Emissions(
  totalDistance: number,
  data: DriverBehaviorScore[],
  averageScore: number
): CO2Calculation {
  const emissionFactorPerKm = 0.2;
  const baseEmissions = totalDistance * emissionFactorPerKm;
  
  const worstPossibleWastagePercentage = 0.3;
  const scoreBasedEfficiency = averageScore / 100;
  const wastagePercentage = worstPossibleWastagePercentage * (1 - scoreBasedEfficiency);
  
  const wastage = baseEmissions * wastagePercentage;
  const potentialSavings = wastage;
  const percentageIncrease = wastagePercentage * 100;
  
  return {
    baseEmissions,
    wastage,
    potentialSavings,
    percentageIncrease
  };
}

export async function importDriverBehaviorData(
  file: File,
  onProgress?: ProgressCallback
): Promise<ImportResponse> {
  try {
    if (onProgress) {
      onProgress("Procesando archivo de comportamiento de conducción", 0, 0);
    }
    
    console.log("Iniciando importación de datos de comportamiento de conducción");
    console.log(`Nombre del archivo: ${file.name}, Tamaño: ${file.size} bytes, Tipo: ${file.type}`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'driver-behavior');

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Error de sesión:", sessionError);
      return { success: false, message: "Error al obtener la sesión: " + sessionError.message };
    }
    
    if (!sessionData.session) {
      console.error("No hay sesión activa");
      return { success: false, message: "No hay sesión activa" };
    }
    
    if (onProgress) {
      onProgress("Validando estructura del archivo", 10, 100);
    }
    
    // Leer el archivo como texto
    const csvText = await file.text();
    console.log("Contenido CSV leído, primeros 500 caracteres:", csvText.substring(0, 500));
    
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    console.log(`Total de líneas en el CSV: ${lines.length}`);
    
    if (lines.length <= 1) {
      console.error("El archivo está vacío o no contiene datos válidos");
      toast.error("Error en el archivo", {
        description: "El archivo está vacío o no contiene datos válidos"
      });
      return { success: false, message: "El archivo está vacío o no contiene datos válidos" };
    }
    
    // Detectar y procesar cabeceras
    const headers = lines[0].split(',').map(h => h.trim());
    console.log("Cabeceras detectadas:", headers);
    
    // Mapeo de cabeceras del CSV al formato esperado por la base de datos
    const headerMapping: { [key: string]: string } = {
      // Mapeo para las cabeceras en español que vienen en el CSV del usuario
      'Agrupación': 'driver_group',
      'Valoración': 'score',
      'Multa': 'penalty_points',
      'Cantidad': 'trips_count',
      'Duración': 'duration_text',
      'Kilometraje': 'distance_text',
      'Comienzo': 'start_date',
      'Fin': 'end_date',
      'Cliente': 'client',
      
      // Mapear también nombres alternativos que podrían aparecer
      'nombre_conductor': 'driver_name',
      'grupo_conductor': 'driver_group',
      'cliente': 'client',
      'puntuacion': 'score',
      'puntos_penalizacion': 'penalty_points',
      'viajes': 'trips_count',
      'fecha_inicio': 'start_date',
      'fecha_fin': 'end_date',
      'distancia': 'distance_text',
      'tiempo_conduccion': 'duration_text',
    };
    
    if (onProgress) {
      onProgress("Procesando registros", 30, 100);
    }
    
    // Verificar que el CSV tenga las columnas necesarias
    // Mapeamos las cabeceras que encontramos a los nombres de campo que necesitamos
    const mappedHeaders: string[] = headers.map(header => headerMapping[header] || header);
    console.log("Cabeceras mapeadas:", mappedHeaders);
    
    // Verificar campos obligatorios - necesitamos driver_name, driver_group y score como mínimo
    // Si en mappedHeaders no tenemos alguno de estos campos, tendremos que derivarlos de otras columnas
    const hasDriverName = mappedHeaders.includes('driver_name');
    const hasDriverGroup = mappedHeaders.includes('driver_group');
    const hasScore = mappedHeaders.includes('score');
    
    console.log(`Verificación campos obligatorios - driver_name: ${hasDriverName}, driver_group: ${hasDriverGroup}, score: ${hasScore}`);
    
    // Si no tenemos driver_name, usaremos el valor de Agrupación como nombre y grupo
    const needsDriverNameDerived = !hasDriverName;
    
    // Procesar las filas
    const rows = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      try {
        // Usar una función más robusta para procesar líneas CSV con posibles comillas
        const values = processCSVLine(lines[i]);
        
        if (values.length < headers.length) {
          console.warn(`La fila ${i} tiene ${values.length} columnas vs ${headers.length} esperadas. Ajustando...`);
          // Extender el array si faltan valores
          while (values.length < headers.length) {
            values.push('');
          }
        }
        
        // Crear objeto con los valores mapeados
        const row: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          const mappedField = headerMapping[header] || header;
          if (mappedField) {
            row[mappedField] = values[index] || '';
          }
        });
        
        // Si necesitamos derivar el nombre del conductor
        if (needsDriverNameDerived) {
          // Usar la primera columna (Agrupación) como nombre del conductor
          if (row['driver_group']) {
            row['driver_name'] = row['driver_group'];
          } else if (values[0]) {
            row['driver_name'] = values[0];
            row['driver_group'] = values[0];
          } else {
            throw new Error("No se puede derivar el nombre del conductor desde los datos");
          }
        }
        
        // Si no tenemos el cliente, usar un valor por defecto
        if (!row['client'] && values.length >= 9) {
          row['client'] = values[8]; // La columna Cliente es la novena
        } else if (!row['client']) {
          row['client'] = 'Cliente No Especificado';
        }
        
        rows.push(row);
      } catch (err) {
        console.error(`Error procesando línea ${i}:`, err, "Contenido de la línea:", lines[i]);
        errors.push({
          row: i,
          message: `Error procesando línea: ${(err as Error).message}`,
          content: lines[i].substring(0, 100) + '...'
        });
      }
    }
    
    console.log(`Procesadas ${rows.length} filas válidas, ${errors.length} errores`);
    if (rows.length === 0) {
      toast.error("Error en los datos", {
        description: "No se encontraron registros válidos para importar"
      });
      return { 
        success: false, 
        message: "No se encontraron registros válidos en el archivo",
        errors
      };
    }
    
    if (onProgress) {
      onProgress(`Procesando ${rows.length} registros`, 50, 100);
    }
    
    // Mostrar ejemplo de datos para diagnosticar problemas
    console.log("Ejemplo de fila procesada:", rows[0]);
    
    // Mapear los datos al formato requerido por la tabla driver_behavior_scores
    const driverBehaviorRecords = rows.map((row, index) => {
      try {
        // Construir el objeto para la inserción
        const driverName = row['driver_name'] || row['Agrupación'] || `Conductor ${index + 1}`;
        const driverGroup = row['driver_group'] || row['Agrupación'] || 'Grupo por defecto';
        const client = row['client'] || 'Cliente por defecto';
        
        // Parsear valores numéricos
        const score = parseNumericValue(row['score'] || row['Valoración'], 0);
        const penaltyPoints = parseNumericValue(row['penalty_points'] || row['Multa'], 0);
        const tripsCount = parseNumericValue(row['trips_count'] || row['Cantidad'], 0);
        
        // Parsear y procesar textos de distancia
        let distance: number | null = null;
        let distanceText: string | null = null;
        
        if (row['distance_text'] || row['Kilometraje']) {
          const distanceStr = row['distance_text'] || row['Kilometraje'] || '';
          const distanceMatch = distanceStr.match(/(\d+(?:\.\d+)?)\s*(?:km|kilómetros|kilometros)?/i);
          
          if (distanceMatch) {
            distance = parseFloat(distanceMatch[1].replace(',', '.'));
            distanceText = `${distance} km`;
          }
        }
        
        // Procesar fechas
        const startDateRaw = row['start_date'] || row['Comienzo'] || '';
        const endDateRaw = row['end_date'] || row['Fin'] || '';
        
        const startDate = parseFlexibleDateTime(startDateRaw, new Date(new Date().setMonth(new Date().getMonth() - 1)));
        const endDate = parseFlexibleDateTime(endDateRaw, new Date());
        
        // Si alguna fecha está mal, usar fechas por defecto
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`Fechas inválidas en fila ${index + 1}. Usando fechas por defecto.`);
        }
        
        // Formatear texto de duración
        let durationText = row['duration_text'] || row['Duración'] || null;
        
        // Validar datos obligatorios antes de crear el registro
        if (!driverName || !driverGroup || score === undefined) {
          throw new Error(`Faltan campos obligatorios: ${!driverName ? 'nombre_conductor' : ''} ${!driverGroup ? 'grupo_conductor' : ''} ${score === undefined ? 'puntuacion' : ''}`);
        }
        
        return {
          driver_name: driverName.substring(0, 255),
          driver_group: driverGroup.substring(0, 255),
          client: client.substring(0, 255),
          score: score,
          penalty_points: Math.round(penaltyPoints),
          trips_count: Math.round(tripsCount),
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          distance: distance,
          distance_text: distanceText,
          duration_text: durationText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } catch (err) {
        console.error(`Error procesando fila ${index + 1}:`, err, "Datos:", JSON.stringify(row));
        errors.push({
          row: index + 2,
          message: `Error procesando fila: ${(err as Error).message}`
        });
        return null;
      }
    }).filter(record => record !== null) as any[];
    
    console.log(`Registros preparados para inserción: ${driverBehaviorRecords.length}`);
    console.log("Ejemplo de registro procesado:", driverBehaviorRecords[0]);
    
    if (driverBehaviorRecords.length === 0) {
      toast.error("Error en los datos", {
        description: "No hay datos válidos para importar después del procesamiento"
      });
      return { 
        success: false, 
        message: "No hay datos válidos para importar después del procesamiento",
        errors
      };
    }
    
    if (onProgress) {
      onProgress("Guardando registros en la base de datos", 75, 100);
    }
    
    // Insertar los registros en lotes pequeños para evitar errores de tamaño
    const batchSize = 5;
    let insertedCount = 0;
    let failedCount = 0;
    
    console.log(`Iniciando inserción de ${driverBehaviorRecords.length} registros en lotes de ${batchSize}`);
    
    for (let i = 0; i < driverBehaviorRecords.length; i += batchSize) {
      const batch = driverBehaviorRecords.slice(i, i + batchSize);
      console.log(`Insertando lote ${Math.floor(i / batchSize) + 1} con ${batch.length} registros`);
      console.log("Primer registro del lote:", batch[0]);
      
      try {
        const { data, error } = await supabase
          .from('driver_behavior_scores')
          .insert(batch)
          .select();
          
        if (error) {
          console.error("Error al insertar lote de registros:", error);
          errors.push({
            message: `Error al insertar lote ${Math.floor(i / batchSize) + 1}: ${error.message}`,
            details: error
          });
          failedCount += batch.length;
        } else {
          insertedCount += data?.length || 0;
          console.log(`Insertados ${data?.length || 0} registros correctamente. Total: ${insertedCount}`);
        }
      } catch (error) {
        console.error("Error no controlado al insertar registros:", error);
        errors.push({
          message: `Error no controlado en lote ${Math.floor(i / batchSize) + 1}: ${(error as Error).message}`,
        });
        failedCount += batch.length;
      }
      
      if (onProgress) {
        const progress = Math.min(75 + 20 * ((i + batch.length) / driverBehaviorRecords.length), 95);
        onProgress(`Insertados ${insertedCount} de ${driverBehaviorRecords.length} registros`, Math.floor(progress), 100);
      }
      
      // Pequeña pausa entre lotes para no sobrecargar la base de datos
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (onProgress) {
      onProgress("Finalizando importación", 95, 100);
    }

    console.log(`Resultados finales: ${insertedCount} insertados, ${failedCount} fallidos, ${errors.length} errores`);

    const success = insertedCount > 0;
    const message = success
      ? `Se importaron ${insertedCount} registros de comportamiento de conducción correctamente`
      : "No se pudo importar ningún registro. Por favor revise el formato del archivo.";
      
    if (errors.length > 0 && success) {
      toast.warning("Importación completada con advertencias", {
        description: `Se importaron ${insertedCount} registros, pero ocurrieron ${errors.length} errores.`
      });
    } else if (success) {
      toast.success("Importación exitosa", {
        description: message
      });
    } else {
      toast.error("Error en la importación", {
        description: "No se pudo procesar el archivo. Verifique el formato."
      });
    }

    return {
      success,
      message,
      insertedCount,
      totalCount: rows.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error("Error general procesando archivo:", error);
    toast.error("Error en la importación", {
      description: "Ocurrió un error al procesar el archivo. Por favor inténtelo de nuevo."
    });
    return { 
      success: false, 
      message: `Error al procesar el archivo: ${(error as Error).message}` 
    };
  }
}

// Función mejorada para procesar líneas CSV considerando campos entre comillas
function processCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if ((char === '"' || char === '"' || char === '"') && (i === 0 || line[i-1] !== '\\')) {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // No olvidar añadir el último valor
  values.push(currentValue.trim());
  
  // Limpiar valores de comillas
  return values.map(v => v.replace(/^[""]|[""]$/g, '').trim());
}

// Función mejorada para parsear valores numéricos
function parseNumericValue(value: any, defaultValue: number = 0): number {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  // Si ya es un número, devolverlo
  if (typeof value === 'number') {
    return value;
  }
  
  // Si es string, convertir
  if (typeof value === 'string') {
    // Reemplazar comas por puntos para manejar formato europeo
    const normalizedValue = value.replace(/\.(?=.*\.)/g, '').replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    if (!isNaN(parsed)) return parsed;
  }
  
  return defaultValue;
}

// Mejorada para parsear fechas con formato de fecha y hora
function parseFlexibleDateTime(dateTimeStr: string, defaultDate: Date = new Date()): Date {
  if (!dateTimeStr || dateTimeStr.trim() === '') {
    return defaultDate;
  }
  
  try {
    // Quitar comillas si existen
    dateTimeStr = dateTimeStr.replace(/[""]/g, '').trim();
    
    // Formato ISO YYYY-MM-DD HH:MM:SS
    if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(:\d{2})?/.test(dateTimeStr)) {
      const date = new Date(dateTimeStr);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Formato YYYY-MM-DD HH:MM
    if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(dateTimeStr)) {
      const date = new Date(dateTimeStr);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Formato DD/MM/YYYY HH:MM
    if (/^\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{1,2}/.test(dateTimeStr)) {
      const parts = dateTimeStr.split(/[\s\/]/);
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const timeParts = parts[3].split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      const date = new Date(year, month, day, hours, minutes);
      if (!isNaN(date.getTime())) return date;
    }
    
    // Intentar analizar directamente la cadena
    const directParse = new Date(dateTimeStr);
    if (!isNaN(directParse.getTime())) return directParse;
    
    console.warn(`No se pudo parsear la fecha y hora: "${dateTimeStr}". Usando fecha predeterminada.`);
    return defaultDate;
  } catch (error) {
    console.warn(`Error al parsear fecha y hora "${dateTimeStr}":`, error);
    return defaultDate;
  }
}

export function getScoreCategory(score: number): ScoreCalculationResult {
  return calculateDriverBehaviorScore(score);
}

export async function fetchClientList(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('driver_behavior_scores')
      .select('client')
      .order('client');

    if (error) {
      console.error('Error fetching client list:', error);
      return [];
    }

    const uniqueClients = new Set<string>();
    data.forEach(item => {
      if (item.client) {
        uniqueClients.add(item.client);
      }
    });

    return Array.from(uniqueClients);
  } catch (error) {
    console.error('Error fetching client list:', error);
    return [];
  }
}
