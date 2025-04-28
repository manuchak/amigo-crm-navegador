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
    const lines = csvText.split(/\r?\n/);
    
    if (lines.length <= 1) {
      console.error("El archivo está vacío o no contiene datos válidos");
      return { success: false, message: "El archivo está vacío o no contiene datos válidos" };
    }
    
    // Detectar y procesar cabeceras
    let headers = lines[0].split(',').map(h => h.trim());
    console.log("Cabeceras detectadas:", headers);
    
    if (onProgress) {
      onProgress("Procesando registros", 30, 100);
    }
    
    // Procesar las filas
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      // Manejar CSV con comillas y comas adecuadamente
      let currentLine = lines[i];
      const values = [];
      let insideQuotes = false;
      let currentValue = '';
      
      for (let j = 0; j < currentLine.length; j++) {
        const char = currentLine[j];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue.trim());
      
      if (values.length !== headers.length) {
        console.warn(`La fila ${i} tiene un número incorrecto de columnas (${values.length} vs ${headers.length} esperadas). Ajustando...`);
        
        // Ajustar el array para que coincida con las cabeceras
        while (values.length < headers.length) {
          values.push('');
        }
        
        if (values.length > headers.length) {
          values.length = headers.length;
        }
      }
      
      // Crear objeto con los valores
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }
    
    if (rows.length === 0) {
      console.error("No se encontraron registros válidos en el archivo");
      return { success: false, message: "No se encontraron registros válidos en el archivo" };
    }
    
    console.log(`Procesando ${rows.length} registros`);
    if (onProgress) {
      onProgress(`Procesando ${rows.length} registros`, 50, 100);
    }
    
    // Mapear los datos al formato requerido por la tabla driver_behavior_scores
    const driverBehaviorRecords = rows.map((row, index) => {
      // Mapeo de nombres de columnas
      const mappings: Record<string, string> = {
        'nombre_conductor': 'driver_name',
        'grupo_conductor': 'driver_group',
        'cliente': 'client',
        'puntuacion': 'score',
        'puntos_penalizacion': 'penalty_points',
        'viajes': 'trips_count',
        'fecha_inicio': 'start_date',
        'fecha_fin': 'end_date',
        'distancia': 'distance',
        'tiempo_conduccion': 'duration_text'
      };
      
      // Procesamiento de fechas
      let startDate: Date, endDate: Date;
      
      // Función helper para parsear fechas en diferentes formatos
      const parseDate = (dateStr: string): Date => {
        if (!dateStr || dateStr.trim() === '') return new Date();
        
        // Intentar varios formatos comunes
        let result: Date | null = null;
        
        // Intentar formato ISO YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          result = new Date(dateStr);
        } 
        // Intentar formato DD/MM/YYYY
        else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
          const parts = dateStr.split('/');
          result = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
        }
        // Intentar formato DD-MM-YYYY
        else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
          const parts = dateStr.split('-');
          result = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
        }
        
        if (result && !isNaN(result.getTime())) {
          return result;
        }
        
        // Si nada funciona, usar la fecha actual
        console.warn(`No se pudo parsear la fecha: "${dateStr}". Usando fecha actual.`);
        return new Date();
      };
      
      try {
        const startDateStr = row['fecha_inicio'] || row['start_date'] || '';
        const endDateStr = row['fecha_fin'] || row['end_date'] || '';
        
        startDate = parseDate(startDateStr);
        endDate = parseDate(endDateStr);
      } catch (error) {
        console.error(`Error procesando fechas en fila ${index + 1}:`, error);
        startDate = new Date();
        endDate = new Date();
      }
      
      // Función para parsear números con manejo de errores
      const parseNumber = (value: string | null | undefined, defaultValue: number): number => {
        if (value === null || value === undefined || value === '') return defaultValue;
        
        // Reemplazar comas por puntos para manejar formato europeo
        const normalizedValue = String(value).replace(',', '.');
        const parsed = parseFloat(normalizedValue);
        
        if (isNaN(parsed)) {
          console.warn(`Valor numérico inválido: "${value}", usando ${defaultValue}`);
          return defaultValue;
        }
        
        return parsed;
      };
      
      // Tratar de obtener los valores usando diferentes posibles nombres de columnas
      const score = parseNumber(row['puntuacion'] || row['score'], 0);
      const penaltyPoints = parseNumber(row['puntos_penalizacion'] || row['penalty_points'], 0);
      const tripsCount = parseNumber(row['viajes'] || row['trips_count'], 0);
      
      let distance: number | null = null;
      const distanceStr = row['distancia'] || row['distance'];
      if (distanceStr !== null && distanceStr !== undefined && distanceStr !== '') {
        distance = parseNumber(distanceStr, 0);
      }
      
      // Crear objeto para inserción a la base de datos
      return {
        driver_name: (row['nombre_conductor'] || row['driver_name'] || 'Sin nombre').trim(),
        driver_group: (row['grupo_conductor'] || row['driver_group'] || 'Sin grupo').trim(),
        client: (row['cliente'] || row['client'] || 'Sin cliente').trim(),
        score: score,
        penalty_points: Math.round(penaltyPoints), // Asegurar que es entero
        trips_count: Math.round(tripsCount), // Asegurar que es entero
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        distance: distance,
        distance_text: distance ? `${distance.toFixed(2)} km` : null,
        duration_text: (row['tiempo_conduccion'] || row['duration_text'] || null),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    if (onProgress) {
      onProgress("Guardando registros en la base de datos", 75, 100);
    }
    
    // Insertar los registros en lotes pequeños para evitar errores de tamaño
    const batchSize = 5; // Reducir el tamaño del lote para mejor manejo
    let insertedCount = 0;
    const errors: any[] = [];
    
    console.log(`Iniciando inserción de ${driverBehaviorRecords.length} registros en lotes de ${batchSize}`);
    
    for (let i = 0; i < driverBehaviorRecords.length; i += batchSize) {
      const batch = driverBehaviorRecords.slice(i, i + batchSize);
      console.log(`Insertando lote ${Math.floor(i / batchSize) + 1} con ${batch.length} registros`);
      
      try {
        // Limpiar datos para asegurar que cumplen con la estructura de la tabla
        const cleanBatch = batch.map(record => ({
          driver_name: String(record.driver_name).substring(0, 255), // Limitar longitud
          driver_group: String(record.driver_group).substring(0, 255),
          client: String(record.client).substring(0, 255),
          score: parseFloat(String(record.score)),
          penalty_points: parseInt(String(record.penalty_points)),
          trips_count: parseInt(String(record.trips_count)),
          start_date: record.start_date,
          end_date: record.end_date,
          distance: record.distance,
          distance_text: record.distance_text,
          duration_text: record.duration_text,
          created_at: record.created_at,
          updated_at: record.updated_at
        }));
        
        const { data, error } = await supabase
          .from('driver_behavior_scores')
          .insert(cleanBatch)
          .select();
          
        if (error) {
          console.error("Error al insertar lote de registros:", error);
          errors.push({
            message: `Error al insertar lote ${Math.floor(i / batchSize) + 1}: ${error.message}`,
            details: error
          });
        } else {
          insertedCount += data?.length || 0;
          console.log(`Insertados ${data?.length || 0} registros correctamente. Total: ${insertedCount}`);
        }
      } catch (error) {
        console.error("Error no controlado al insertar registros:", error);
        errors.push({
          message: `Error no controlado en lote ${Math.floor(i / batchSize) + 1}`,
          details: error
        });
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
      totalCount: driverBehaviorRecords.length,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error("Error procesando archivo:", error);
    toast.error("Error en la importación", {
      description: "Ocurrió un error al procesar el archivo. Por favor inténtelo de nuevo."
    });
    return { success: false, message: "Error al procesar el archivo" };
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
