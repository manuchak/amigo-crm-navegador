
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

// Function to fetch driver behavior data for the dashboard
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
    
    // Apply filters if provided
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

// Process the raw driver behavior data for dashboard display
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

  // Calculate overall metrics
  const totalDrivers = new Set(data.map(item => item.driver_name)).size;
  const totalTrips = data.reduce((sum, item) => sum + item.trips_count, 0);
  const totalPenaltyPoints = data.reduce((sum, item) => sum + item.penalty_points, 0);
  
  // Calculate average score
  const averageScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
  
  // Calculate total driving time in minutes from duration_interval strings
  let totalDrivingTime = 0;
  data.forEach(item => {
    if (item.duration_interval) {
      // Parse PostgreSQL interval string like '2 hours 30 mins'
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
  
  // Calculate total distance
  const totalDistance = data.reduce((sum, item) => sum + (item.distance || 0), 0);
  
  // Group by score ranges for chart data
  const scoreDistribution = {
    excellent: data.filter(item => item.score >= 90).length,
    good: data.filter(item => item.score >= 80 && item.score < 90).length,
    fair: data.filter(item => item.score >= 70 && item.score < 80).length,
    poor: data.filter(item => item.score >= 60 && item.score < 70).length,
    critical: data.filter(item => item.score < 60).length,
  };

  // Calculate risk assessment
  const riskAssessment = calculateRiskAssessment(data, averageScore);

  // Calculate CO2 emissions
  const co2Data = calculateCO2Emissions(totalDistance, data, averageScore);

  // Identify top performers and those needing improvement
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

// Format driving time into hours and minutes
function formatDrivingTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Calculate risk assessment based on driver scores
function calculateRiskAssessment(data: DriverBehaviorScore[], averageScore: number): RiskAssessment {
  // Calculate risk score - weighted combination of average score and distribution of critical drivers
  const criticalPercentage = data.filter(d => d.score < 60).length / data.length;
  const riskScore = (100 - averageScore) * 0.7 + (criticalPercentage * 100) * 0.3;
  
  // Determine risk level
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

// Calculate CO2 emissions based on distance, driving style
function calculateCO2Emissions(
  totalDistance: number,
  data: DriverBehaviorScore[],
  averageScore: number
): CO2Calculation {
  // Base CO2 emissions calculation
  // Average passenger vehicle emits about 0.2 kg CO2 per km
  const emissionFactorPerKm = 0.2;
  const baseEmissions = totalDistance * emissionFactorPerKm;
  
  // Calculate wastage based on penalty points
  // Research suggests poor driving can increase fuel consumption & emissions by 5-30%
  // We'll use driver score to estimate the wastage
  // 100 score = 0% wastage, 0 score = 30% wastage
  const worstPossibleWastagePercentage = 0.3;
  const scoreBasedEfficiency = averageScore / 100;
  const wastagePercentage = worstPossibleWastagePercentage * (1 - scoreBasedEfficiency);
  
  const wastage = baseEmissions * wastagePercentage;
  const potentialSavings = wastage; // what could be saved with perfect driving
  const percentageIncrease = wastagePercentage * 100;
  
  return {
    baseEmissions,
    wastage,
    potentialSavings,
    percentageIncrease
  };
}

// Import driver behavior data from a file
export async function importDriverBehaviorData(
  file: File,
  onProgress?: ProgressCallback
): Promise<ImportResponse> {
  try {
    if (onProgress) {
      onProgress("Procesando archivo de comportamiento de conducción", 0, 0);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'driver-behavior');

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return { success: false, message: "Error al obtener la sesión: " + sessionError.message };
    }
    
    if (!sessionData.session) {
      return { success: false, message: "No hay sesión activa" };
    }
    
    const accessToken = sessionData.session.access_token;
    
    if (!accessToken) {
      return { success: false, message: "No se pudo obtener el token de acceso" };
    }

    // Simulate processing steps for CSV parsing
    if (onProgress) {
      onProgress("Validando estructura del archivo", 10, 100);
    }
    
    // Parse CSV data
    const csvText = await file.text();
    const lines = csvText.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim());
    
    if (onProgress) {
      onProgress("Procesando registros", 30, 100);
    }
    
    // Extract rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        console.warn(`La fila ${i} tiene un número incorrecto de columnas`);
        continue;
      }
      
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      rows.push(row);
    }
    
    if (onProgress) {
      onProgress(`Procesando ${rows.length} registros`, 50, 100);
    }
    
    // Map CSV data to database structure
    const driverBehaviorRecords = rows.map(row => {
      // Convert date strings to proper format
      const startDate = new Date(row['fecha_inicio'] || row['start_date']);
      const endDate = new Date(row['fecha_fin'] || row['end_date']);
      
      // Parse numeric values
      const score = parseFloat(row['puntuacion'] || row['score'] || '0');
      const penaltyPoints = parseInt(row['puntos_penalizacion'] || row['penalty_points'] || '0', 10);
      const tripsCount = parseInt(row['viajes'] || row['trips_count'] || '0', 10);
      const distance = row['distancia'] || row['distance'] ? parseFloat(row['distancia'] || row['distance']) : null;
      
      // Create the record
      return {
        driver_name: row['nombre_conductor'] || row['driver_name'],
        driver_group: row['grupo_conductor'] || row['driver_group'],
        client: row['cliente'] || row['client'],
        score: score,
        penalty_points: penaltyPoints,
        trips_count: tripsCount,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        distance: distance,
        distance_text: distance ? `${distance.toFixed(2)} km` : null,
        duration_text: row['tiempo_conduccion'] || row['duration_text'] || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    if (onProgress) {
      onProgress("Guardando registros en la base de datos", 75, 100);
    }
    
    let insertedCount = 0;
    const batchSize = 25;
    const errors = [];
    
    // Insert records in batches
    for (let i = 0; i < driverBehaviorRecords.length; i += batchSize) {
      const batch = driverBehaviorRecords.slice(i, i + batchSize);
      
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
      } else {
        insertedCount += data?.length || 0;
      }
      
      if (onProgress) {
        const progress = Math.min(75 + 20 * ((i + batch.length) / driverBehaviorRecords.length), 95);
        onProgress(`Insertados ${insertedCount} de ${driverBehaviorRecords.length} registros`, Math.floor(progress), 100);
      }
    }
    
    if (onProgress) {
      onProgress("Finalizando importación", 95, 100);
    }

    // Prepare the response
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
    return handleImportError(error, "import-toast");
  }
}

// Calculate the score category and corresponding color class
export function getScoreCategory(score: number): ScoreCalculationResult {
  return calculateDriverBehaviorScore(score);
}

// Get the list of clients for the filter component
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

    // Extract unique client names
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
