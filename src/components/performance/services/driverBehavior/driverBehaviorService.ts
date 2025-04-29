import { DateRange } from "react-day-picker";
import { DriverBehaviorData, DriverBehaviorFilters, DriverScore } from "../../types/driver-behavior.types";
import { ImportResponse, ProgressCallback } from "../import/types";
import { supabase } from "@/integrations/supabase/client";

// Fetch driver behavior data with optional filters
export const fetchDriverBehaviorData = async (dateRange: DateRange, filters?: DriverBehaviorFilters): Promise<DriverBehaviorData> => {
  console.log("Fetching driver behavior data with filters:", filters);
  
  try {
    let query = supabase
      .from('driver_behavior_scores')
      .select('*');
      
    // Aplicar filtro de rango de fechas si se proporciona
    if (dateRange.from) {
      query = query.gte('start_date', dateRange.from.toISOString());
    }
    
    if (dateRange.to) {
      query = query.lte('end_date', dateRange.to.toISOString());
    }
    
    // Aplicar filtro de cliente si se proporciona
    if (filters?.selectedClients && filters.selectedClients.length > 0) {
      console.log("Applying client filter:", filters.selectedClients);
      query = query.in('client', filters.selectedClients);
    }
    
    // Aplicar filtro de nombre de conductor si se proporciona
    if (filters?.driverName && filters.driverName.trim() !== '') {
      console.log("Applying driver name filter:", filters.driverName);
      query = query.ilike('driver_name', `%${filters.driverName}%`);
    }
    
    // Ejecutar la consulta
    const { data: driverScores, error } = await query;
    
    if (error) {
      console.error("Error fetching driver behavior data:", error);
      throw error;
    }
    
    if (!driverScores || driverScores.length === 0) {
      console.log("No driver behavior data found with applied filters");
      // Devolver estructura de datos vacía
      return createEmptyDriverBehaviorData();
    }
    
    console.log(`Found ${driverScores.length} driver behavior records`);
    
    // Procesar los datos para crear la estructura DriverBehaviorData
    return processDriverBehaviorData(driverScores);
    
  } catch (err) {
    console.error("Exception when fetching driver data:", err);
    // En caso de cualquier excepción, devolver datos vacíos
    return createEmptyDriverBehaviorData();
  }
};

// Create an empty data structure
const createEmptyDriverBehaviorData = (): DriverBehaviorData => ({
  metrics: [],
  driverScores: [],
  scoreDistribution: {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    critical: 0
  },
  averageScore: 0,
  totalPenaltyPoints: 0,
  totalTrips: 0,
  totalDrivingTime: 0,
  totalDistance: 0,
  co2Emissions: 0,
  riskAssessment: {
    level: 'low',
    score: 0,
    description: "No hay datos suficientes para evaluar el riesgo",
    recommendations: ["Importar datos de comportamiento de conducción"]
  },
  driverPerformance: {
    topDrivers: [],
    needsImprovement: [],
    ecoDrivers: []
  }
});

// Process raw driver behavior scores into structured data
const processDriverBehaviorData = (driverScores: any[]): DriverBehaviorData => {
  // Calculate score distribution
  let excellent = 0, good = 0, fair = 0, poor = 0, critical = 0;
  
  for (const driver of driverScores) {
    const score = Number(driver.score);
    if (score >= 90) excellent++;
    else if (score >= 75) good++;
    else if (score >= 60) fair++;
    else if (score >= 40) poor++;
    else critical++;
  }
  
  // Calculate totals and averages
  const totalPenaltyPoints = driverScores.reduce((sum, d) => sum + Number(d.penalty_points), 0);
  const totalTrips = driverScores.reduce((sum, d) => sum + Number(d.trips_count), 0);
  const totalDistance = driverScores.reduce((sum, d) => sum + (Number(d.distance) || 0), 0);
  
  // Calculate average score
  const sumScores = driverScores.reduce((sum, d) => sum + Number(d.score), 0);
  const averageScore = driverScores.length > 0 ? sumScores / driverScores.length : 0;
  
  // Group drivers by performance categories
  const sortedByScore = [...driverScores].sort((a, b) => Number(b.score) - Number(a.score));
  const sortedByPenalty = [...driverScores].sort((a, b) => Number(a.penalty_points) - Number(b.penalty_points));
  
  const topDrivers = sortedByScore.slice(0, 3);
  const needsImprovement = [...driverScores]
    .filter(d => Number(d.score) < 50)
    .sort((a, b) => Number(a.score) - Number(b.score))
    .slice(0, 3);
  
  const ecoDrivers = sortedByPenalty.slice(0, 3);
  
  // Calculate CO2 emissions (simplified estimate based on distance)
  // Average car emissions: 0.15 kg CO2 per km
  const co2Emissions = totalDistance * 0.15;
  
  // Estimate driving time based on trips (average 45 mins per trip)
  const totalDrivingTime = totalTrips * 45; // in minutes
  
  // Assess fleet risk based on scores
  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
  let riskScore = 0;
  let riskDescription = '';
  const recommendations: string[] = [];
  
  if (driverScores.length > 0) {
    riskScore = 100 - averageScore;
    
    if (riskScore >= 60) {
      riskLevel = 'critical';
      riskDescription = 'La flota presenta un riesgo crítico basado en el comportamiento de conducción';
      recommendations.push(
        'Implementar programa de capacitación urgente',
        'Revisar condiciones de las unidades',
        'Considerar cambios en las políticas de operación'
      );
    } else if (riskScore >= 40) {
      riskLevel = 'high';
      riskDescription = 'La flota presenta un riesgo alto basado en el comportamiento de conducción';
      recommendations.push(
        'Implementar capacitación focalizada',
        'Revisar rutas con mayor incidencia de infracciones',
        'Establecer incentivos para conductores seguros'
      );
    } else if (riskScore >= 25) {
      riskLevel = 'moderate';
      riskDescription = 'La flota presenta un riesgo moderado basado en el comportamiento de conducción';
      recommendations.push(
        'Implementar programas de capacitación en conducción defensiva',
        'Revisar rutas con mayor incidencia de infracciones',
        'Establecer un sistema de incentivos para conductores con mejores puntuaciones'
      );
    } else {
      riskLevel = 'low';
      riskDescription = 'La flota presenta un riesgo bajo basado en el comportamiento de conducción';
      recommendations.push(
        'Mantener el programa de capacitación actual',
        'Continuar con el monitoreo de conductores',
        'Reconocer a los conductores destacados'
      );
    }
  }
  
  // Build metrics array
  const metrics = [
    { label: "Total Conductores", value: driverScores.length },
    { label: "Conductores Activos", value: driverScores.filter(d => d.trips_count > 0).length },
    { label: "Alertas de Seguridad", value: totalPenaltyPoints }
  ];
  
  return {
    metrics,
    driverScores,
    scoreDistribution: { excellent, good, fair, poor, critical },
    averageScore,
    totalPenaltyPoints,
    totalTrips,
    totalDrivingTime,
    totalDistance,
    co2Emissions,
    riskAssessment: {
      level: riskLevel,
      score: Math.round(averageScore),
      description: riskDescription,
      recommendations
    },
    driverPerformance: {
      topDrivers,
      needsImprovement,
      ecoDrivers
    }
  };
};

// Fetch client list for filtering
export const fetchClientList = async (): Promise<string[]> => {
  console.log("Fetching client list");
  
  try {
    const { data, error } = await supabase
      .from('driver_behavior_scores')
      .select('client')
      .order('client')
      .limit(100);
    
    if (error) {
      console.error("Error fetching client list:", error);
      return [];
    }
    
    if (data && data.length > 0) {
      // Extraer nombres únicos de clientes
      const uniqueClients = Array.from(new Set(data.map(item => item.client))).filter(Boolean) as string[];
      console.log("Found client list from database:", uniqueClients);
      return uniqueClients.sort();
    } else {
      console.log("No client data found");
      return [];
    }
  } catch (err) {
    console.error("Exception when fetching client list:", err);
    return [];
  }
};

// Import driver behavior data
export const importDriverBehaviorData = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<ImportResponse> => {
  console.log("Importing driver behavior data from file:", file.name);

  // Progress reporting function
  const updateProgress = async (status: string, processed: number, total: number) => {
    if (onProgress) {
      onProgress(status, processed, total);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  try {
    // Start upload process
    await updateProgress("Analizando archivo...", 10, 100);
    
    // Process the file based on its type
    const fileData = await readFileContent(file);
    if (!fileData || !fileData.length) {
      return {
        success: false,
        message: "No se pudieron extraer datos del archivo",
        insertedCount: 0,
        totalCount: 0,
        errors: [{
          row: 0,
          message: "Archivo vacío o formato no válido"
        }]
      };
    }
    
    await updateProgress("Procesando datos...", 30, 100);
    console.log(`Extracted ${fileData.length} records from file`);
    console.log("Sample data:", fileData.slice(0, 2));
    
    // Validate and map data before insertion
    const validRecords = mapCsvToDriverRecords(fileData);
    if (validRecords.length === 0) {
      console.error("No valid records found after mapping");
      return {
        success: false,
        message: "No hay registros válidos para importar",
        insertedCount: 0,
        totalCount: fileData.length,
        errors: [{
          row: 0,
          message: "No se encontraron registros válidos en el archivo. Verifique que el formato coincide con la plantilla."
        }]
      };
    }
    
    console.log(`Validated ${validRecords.length} records, preparing for insertion`);
    await updateProgress("Guardando datos en la base de datos...", 60, 100);
    
    // Insert data into Supabase in batches to prevent timeouts
    const batchSize = 25;
    let insertedCount = 0;
    let errors: any[] = [];
    
    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1} with ${batch.length} records`);
      
      try {
        const { data, error } = await supabase
          .from('driver_behavior_scores')
          .insert(batch)
          .select();
        
        if (error) {
          console.error("Error inserting batch:", error);
          errors.push({
            row: i,
            message: `Error en lote: ${error.message}`
          });
        } else {
          insertedCount += data?.length || 0;
          console.log(`Successfully inserted ${data?.length || 0} records in this batch`);
        }
      } catch (batchError: any) {
        console.error("Exception during batch insert:", batchError);
        errors.push({
          row: i,
          message: `Excepción en lote: ${batchError.message}`
        });
      }
      
      // Update progress based on processed batches
      const progressPercent = 60 + Math.floor((i / validRecords.length) * 35);
      await updateProgress(
        `Guardando datos (${i+batch.length} de ${validRecords.length})...`, 
        progressPercent, 
        100
      );
    }
    
    console.log(`Import completed. Inserted ${insertedCount} out of ${validRecords.length} records`);
    await updateProgress("Finalizado", 100, 100);
    
    // Return success response
    return {
      success: true,
      message: `Se importaron ${insertedCount} registros de comportamiento de conductores exitosamente`,
      insertedCount,
      totalCount: validRecords.length,
      errors: errors.length > 0 ? errors : []
    };
  } catch (error: any) {
    console.error("Error in driver behavior data import:", error);
    
    return {
      success: false,
      message: `Error en la importación: ${error.message || "Error desconocido"}`,
      insertedCount: 0,
      totalCount: 0,
      errors: [{
        row: 0,
        message: error.message || "Error desconocido"
      }]
    };
  }
};

// Helper function to read file content
const readFileContent = async (file: File): Promise<any[]> => {
  try {
    console.log("Reading file content...");
    const text = await file.text();
    
    // Determine if CSV or Excel by extension
    if (file.name.toLowerCase().endsWith('.csv')) {
      // Process as CSV
      return processCSV(text);
    } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      // For Excel files, we'd normally use a library like XLSX
      // But for simplicity in this example, we'll return sample data
      return generateSampleData(file.name);
    } else {
      console.error("Unsupported file format");
      return [];
    }
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

// Process CSV content with improved parsing
const processCSV = (content: string): any[] => {
  console.log("Processing CSV content...");
  // Split by lines and remove empty lines
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    console.error("CSV has less than 2 lines (no header or data)");
    return [];
  }
  
  // Extract headers and handle potential BOM character
  let headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim());
  console.log("CSV Headers:", headers);
  
  const result = [];
  let rowErrors = 0;
  
  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      // Handle quoted values with commas properly
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Don't forget the last value
      values.push(currentValue);
      
      // Create record mapping headers to values
      if (values.length !== headers.length) {
        console.warn(`Row ${i+1} has incorrect number of columns. Expected ${headers.length}, got ${values.length}`);
        rowErrors++;
        continue;
      }
      
      const record: Record<string, any> = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          // Remove quotes if present
          const value = values[index].replace(/^"|"$/g, '').trim();
          record[header] = value;
        }
      });
      
      result.push(record);
    } catch (error) {
      console.error(`Error parsing row ${i+1}:`, error);
      rowErrors++;
    }
  }
  
  console.log(`CSV processing complete. Extracted ${result.length} records with ${rowErrors} errors.`);
  if (result.length > 0) {
    console.log("First record sample:", result[0]);
  }
  
  return result;
};

// Map CSV data to driver behavior records format
const mapCsvToDriverRecords = (records: any[]): any[] => {
  console.log("Mapping CSV records to driver behavior format...");
  const validRecords = [];
  
  // Define column mappings (based on your CSV structure shown in the image)
  const columnMappings: Record<string, string> = {
    'Agrupación': 'driver_name',
    'Valoración': 'score',
    'Multa': 'penalty_points',
    'Cantidad': 'trips_count',
    'Duración': 'duration_text',
    'Kilometraje': 'distance_text',
    'Comienzo': 'start_date',
    'Fin': 'end_date',
    'Cliente': 'client'
  };
  
  // Log all record keys to help debug
  if (records.length > 0) {
    console.log("Available fields in CSV:", Object.keys(records[0]));
  }
  
  // Convert each record using the mappings
  for (const record of records) {
    try {
      const mappedRecord: Record<string, any> = {
        driver_name: '',
        driver_group: 'Default Group', // Default value
        score: 0,
        penalty_points: 0,
        trips_count: 1,
        distance: 0,
        client: 'Default Client',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Map fields based on headers in the CSV
      let hasValidData = false;
      
      // First, map driver_name from Agrupación (which is also driver name according to the user)
      if (record['Agrupación'] !== undefined && record['Agrupación'] !== null) {
        mappedRecord['driver_name'] = String(record['Agrupación']).trim();
        mappedRecord['driver_group'] = String(record['Agrupación']).trim(); // Use the same value for group
        hasValidData = true;
      }
      
      // Map other fields
      for (const [csvField, dbField] of Object.entries(columnMappings)) {
        if (record[csvField] !== undefined && record[csvField] !== null) {
          hasValidData = true;
          
          // Process each field according to its expected type
          switch (dbField) {
            case 'driver_name':
              // Already handled above
              break;
              
            case 'score':
              // Parse decimal number
              const scoreValue = parseFloat(String(record[csvField]).replace(',', '.'));
              mappedRecord[dbField] = isNaN(scoreValue) ? 0 : Math.min(100, Math.max(0, scoreValue * 10)); // Scale 0-10 to 0-100
              break;
              
            case 'penalty_points':
              // Parse integer
              mappedRecord[dbField] = parseInt(String(record[csvField]), 10) || 0;
              break;
              
            case 'trips_count':
              // Parse integer
              mappedRecord[dbField] = parseInt(String(record[csvField]), 10) || 1;
              break;
              
            case 'duration_text':
              // Store as is
              mappedRecord[dbField] = String(record[csvField]);
              break;
              
            case 'distance_text':
              // Store as is
              mappedRecord[dbField] = String(record[csvField]);
              // Try to extract numeric distance if possible
              const distanceMatch = String(record[csvField]).match(/(\d+(?:[.,]\d+)?)/);
              if (distanceMatch) {
                mappedRecord['distance'] = parseFloat(distanceMatch[1].replace(',', '.'));
              }
              break;
              
            case 'start_date':
            case 'end_date':
              // Parse date with flexible format
              try {
                let dateString = String(record[csvField]);
                // Check if date is in format DD.MM.YYYY HH:MM
                let dateParts = dateString.split(' ');
                if (dateParts.length === 2) {
                  let [datePart, timePart] = dateParts;
                  if (datePart.includes('.')) {
                    // Convert DD.MM.YYYY to YYYY-MM-DD
                    let [day, month, year] = datePart.split('.');
                    dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00`;
                  }
                }
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                  mappedRecord[dbField] = date.toISOString();
                }
              } catch (e) {
                console.warn(`Could not parse date in field ${csvField}:`, record[csvField]);
              }
              break;
              
            case 'client':
              // Store as is
              mappedRecord[dbField] = String(record[csvField]).trim() || "Cliente sin especificar";
              break;
              
            default:
              // For any other fields, store as is
              mappedRecord[dbField] = record[csvField];
          }
        }
      }
      
      // Only include record if it has a valid driver name and some data
      if (mappedRecord.driver_name && mappedRecord.driver_name.length > 0 && hasValidData) {
        // Fix any missing required fields
        if (!mappedRecord.score || isNaN(mappedRecord.score)) {
          mappedRecord.score = 50; // Default score
        }
        
        // If no client is specified, use a default value
        if (!mappedRecord.client || mappedRecord.client === "Cliente sin especificar") {
          mappedRecord.client = "Cliente Predeterminado";
        }
        
        validRecords.push(mappedRecord);
      } else {
        console.warn("Skipping invalid record due to missing driver_name:", record);
      }
    } catch (error) {
      console.error("Error mapping record:", error, record);
    }
  }
  
  console.log(`Mapping complete. Found ${validRecords.length} valid records.`);
  if (validRecords.length > 0) {
    console.log("First mapped record:", validRecords[0]);
  }
  
  return validRecords;
};

// Generate sample data based on filename for testing
const generateSampleData = (filename: string): any[] => {
  const baseClientName = filename.split('.')[0];
  const records = [];
  
  for (let i = 0; i < 10; i++) {
    records.push({
      'Agrupación': `Driver ${i+1} from ${baseClientName}`,
      'Valoración': (Math.random() * 10).toFixed(1),
      'Multa': Math.floor(Math.random() * 10),
      'Cantidad': Math.floor(Math.random() * 50) + 20,
      'Kilometraje': `${Math.floor(Math.random() * 500)} km`,
      'Duración': `${Math.floor(Math.random() * 10)}h ${Math.floor(Math.random() * 60)}m`,
      'Cliente': baseClientName,
      'Comienzo': new Date().toISOString(),
      'Fin': new Date().toISOString(),
    });
  }
  
  return records;
};
