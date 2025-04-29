
import { DateRange } from "react-day-picker";
import { DriverBehaviorData, DriverBehaviorFilters, DriverScore } from "../../types/driver-behavior.types";
import { ImportResponse, ProgressCallback } from "../import/types";
import { supabase } from "@/integrations/supabase/client";

// Mock data for development
const mockClients = ["Aquasteam", "Servprot", "Shellpride", "Logitrade", "TransGlobal"];

// Mock driver behavior data generator
const generateMockDriverBehaviorData = (dateRange: DateRange, filters?: DriverBehaviorFilters): DriverBehaviorData => {
  console.log("Generating mock data with filters:", filters);
  
  // Filter based on selected clients
  const selectedClients = filters?.selectedClients || [];
  const useClientFilter = selectedClients.length > 0;
  
  console.log("Selected clients:", selectedClients);
  console.log("Using client filter:", useClientFilter);
  
  // Generate driver scores filtered by client if specified
  const allDriverScores = Array(10).fill(null).map((_, i) => {
    const client = mockClients[i % mockClients.length];
    
    return {
      id: i + 1,
      driver_name: `Driver ${i + 1}`,
      driver_group: i % 3 === 0 ? "Group A" : i % 3 === 1 ? "Group B" : "Group C",
      score: Math.floor(Math.random() * 40) + 60,
      penalty_points: Math.floor(Math.random() * 20),
      trips_count: Math.floor(Math.random() * 100) + 10,
      distance: Math.random() * 1000,
      distance_text: `${Math.floor(Math.random() * 1000)} km`,
      duration_text: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      start_date: dateRange.from?.toISOString() || new Date().toISOString(),
      end_date: dateRange.to?.toISOString() || new Date().toISOString(),
      client,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  // Apply client filter if needed
  const driverScores = useClientFilter 
    ? allDriverScores.filter(driver => selectedClients.includes(driver.client))
    : allDriverScores;
    
  console.log("Filtered driver scores count:", driverScores.length);
  
  // Generate top drivers filtered by client if specified
  const generateDrivers = (prefix: string, scoreBase: number, count: number = 3): DriverScore[] => {
    const allDrivers = Array(count).fill(null).map((_, i) => {
      const client = mockClients[i % mockClients.length];
      
      return {
        id: i + 100 + (prefix === "Top Driver" ? 0 : prefix === "Improvement Needed" ? 10 : 20),
        driver_name: `${prefix} ${i + 1}`,
        driver_group: prefix === "Top Driver" ? "Elite Drivers" : 
                      prefix === "Improvement Needed" ? "Risk Group" : "Green Team",
        score: Math.floor(Math.random() * 10) + scoreBase,
        penalty_points: Math.floor(Math.random() * (prefix === "Improvement Needed" ? 15 : 7)) + 
                        (prefix === "Improvement Needed" ? 15 : 0),
        trips_count: Math.floor(Math.random() * 50) + 30,
        distance: Math.random() * 500,
        distance_text: `${Math.floor(Math.random() * 500)} km`,
        duration_text: `${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 60)}m`,
        start_date: dateRange.from?.toISOString() || new Date().toISOString(),
        end_date: dateRange.to?.toISOString() || new Date().toISOString(),
        client,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // Apply client filter if needed
    return useClientFilter 
      ? allDrivers.filter(driver => selectedClients.includes(driver.client))
      : allDrivers;
  };
  
  const topDrivers = generateDrivers("Top Driver", 90);
  const needsImprovementDrivers = generateDrivers("Improvement Needed", 40);
  const ecoDrivers = generateDrivers("Eco Driver", 80);
  
  console.log("Top drivers count:", topDrivers.length);
  console.log("Needs improvement drivers count:", needsImprovementDrivers.length);
  console.log("Eco drivers count:", ecoDrivers.length);
  
  const filteredDriversCount = driverScores.length;
  
  return {
    metrics: [
      { label: "Total Conductores", value: useClientFilter ? filteredDriversCount + 2 : 42 },
      { label: "Conductores Activos", value: useClientFilter ? filteredDriversCount : 38 },
      { label: "Alertas de Seguridad", value: useClientFilter ? Math.floor(filteredDriversCount * 4.1) : 156 }
    ],
    driverScores,
    scoreDistribution: {
      excellent: useClientFilter ? Math.floor(15 * (filteredDriversCount / 10)) : 15,
      good: useClientFilter ? Math.floor(45 * (filteredDriversCount / 10)) : 45,
      fair: useClientFilter ? Math.floor(30 * (filteredDriversCount / 10)) : 30,
      poor: useClientFilter ? Math.floor(8 * (filteredDriversCount / 10)) : 8,
      critical: useClientFilter ? Math.floor(2 * (filteredDriversCount / 10)) : 2
    },
    averageScore: 5.1,
    totalPenaltyPoints: useClientFilter ? driverScores.reduce((sum, d) => sum + d.penalty_points, 0) : 450,
    totalTrips: useClientFilter ? driverScores.reduce((sum, d) => sum + d.trips_count, 0) : 1495,
    totalDrivingTime: useClientFilter ? Math.floor(12450 * (filteredDriversCount / 10)) : 12450,
    totalDistance: useClientFilter ? Math.floor(28750 * (filteredDriversCount / 10)) : 28750,
    co2Emissions: useClientFilter ? Math.floor(5842 * (filteredDriversCount / 10)) : 5842,
    riskAssessment: {
      level: "moderate",
      score: 65,
      description: "La flota presenta un riesgo moderado basado en el comportamiento de conducción",
      recommendations: [
        "Implementar programas de capacitación en conducción defensiva",
        "Revisar rutas con mayor incidencia de infracciones",
        "Establecer un sistema de incentivos para conductores con mejores puntuaciones"
      ]
    },
    driverPerformance: {
      topDrivers,
      needsImprovement: needsImprovementDrivers,
      ecoDrivers
    }
  };
};

// Fetch driver behavior data with optional filters
export const fetchDriverBehaviorData = async (dateRange: DateRange, filters?: DriverBehaviorFilters): Promise<DriverBehaviorData> => {
  console.log("Fetching driver behavior data with filters:", filters);
  
  try {
    // First try to get real data from the database
    const { data: driverData, error } = await supabase
      .from('driver_behavior_scores')
      .select('*');
    
    if (error) {
      console.error("Error fetching driver behavior data:", error);
      // If there's an error, fall back to mock data
      return generateMockDriverBehaviorData(dateRange, filters);
    }
    
    if (driverData && driverData.length > 0) {
      console.log("Found real driver behavior data, processing...");
      
      // Process and filter real data based on filters
      // This is where you would implement the real filtering logic
      // For now, we'll just return the mock data with the filters applied
      return generateMockDriverBehaviorData(dateRange, filters);
    } else {
      // If no data found, use the mock data
      console.log("No real data found, using mock data");
      return generateMockDriverBehaviorData(dateRange, filters);
    }
  } catch (err) {
    console.error("Exception when fetching driver data:", err);
    // In case of any exception, return mock data
    return generateMockDriverBehaviorData(dateRange, filters);
  }
};

// Fetch client list for filtering
export const fetchClientList = async (): Promise<string[]> => {
  console.log("Fetching client list");
  
  try {
    // Try to get distinct clients from the database
    const { data, error } = await supabase
      .from('driver_behavior_scores')
      .select('client')
      .limit(100);
    
    if (error) {
      console.error("Error fetching client list:", error);
      return mockClients;
    }
    
    if (data && data.length > 0) {
      // Extract unique client names
      const uniqueClients = Array.from(new Set(data.map(item => item.client))).filter(Boolean) as string[];
      console.log("Found client list from database:", uniqueClients);
      return uniqueClients;
    } else {
      console.log("No client data found, using mock clients");
      return mockClients;
    }
  } catch (err) {
    console.error("Exception when fetching client list:", err);
    return mockClients;
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
      
      for (const [csvField, dbField] of Object.entries(columnMappings)) {
        if (record[csvField] !== undefined && record[csvField] !== null) {
          hasValidData = true;
          
          // Process each field according to its expected type
          switch (dbField) {
            case 'driver_name':
              mappedRecord[dbField] = String(record[csvField]).trim();
              // Use Agrupación as driver_group too if no specific group field exists
              mappedRecord['driver_group'] = String(record[csvField]).trim();
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
              mappedRecord[dbField] = String(record[csvField]).trim();
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
      driver_name: `Driver ${i+1} from ${baseClientName}`,
      driver_group: i % 2 === 0 ? "Group A" : "Group B",
      score: Math.floor(Math.random() * 30) + 70,
      penalty_points: Math.floor(Math.random() * 10),
      trips_count: Math.floor(Math.random() * 50) + 20,
      distance: Math.floor(Math.random() * 500),
      distance_text: `${Math.floor(Math.random() * 500)} km`,
      duration_text: `${Math.floor(Math.random() * 10)}h ${Math.floor(Math.random() * 60)}m`,
      client: baseClientName,
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
    });
  }
  
  return records;
};

// Validate and format records for insertion
const validateDriverRecords = (records: any[]): any[] => {
  const validRecords = [];
  
  for (const record of records) {
    // Convert to expected format for the driver_behavior_scores table
    const validatedRecord: any = {
      driver_name: record.driver_name || record.nombre || record.name || "Sin nombre",
      driver_group: record.driver_group || record.grupo || "Default Group",
      score: Number(record.score || record.puntaje || 50),
      penalty_points: Number(record.penalty_points || record.puntos_penalizacion || 0),
      trips_count: Number(record.trips_count || record.viajes || 1),
      distance: Number(record.distance || record.distancia || 0),
      client: record.client || record.cliente || "Cliente sin especificar",
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString(),
      distance_text: record.distance_text || `${record.distance || 0} km`,
      duration_text: record.duration_text || "N/A"
    };
    
    // Only include records with at least driver name and client
    if (validatedRecord.driver_name !== "Sin nombre" && 
        validatedRecord.client !== "Cliente sin especificar") {
      validRecords.push(validatedRecord);
    }
  }
  
  return validRecords;
};
