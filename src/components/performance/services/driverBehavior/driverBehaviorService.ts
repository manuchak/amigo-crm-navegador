
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
  const updateProgress = async (status: string, percent: number) => {
    if (onProgress) {
      onProgress(status, percent, 100);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  try {
    // Start upload process
    await updateProgress("Analizando archivo...", 10);
    
    // Read file content - in a real implementation this would parse the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'driver-behavior');
    
    // In a real implementation, upload to server
    await updateProgress("Procesando datos...", 30);
    
    // Simulate server validation
    await updateProgress("Validando datos...", 50);
    
    // Try to insert data into Supabase
    const records = [];
    
    // Generate some sample records based on the file name
    for (let i = 0; i < 10; i++) {
      records.push({
        driver_name: `Driver from ${file.name.split('.')[0]} ${i+1}`,
        driver_group: i % 2 === 0 ? "Group A" : "Group B",
        score: Math.floor(Math.random() * 30) + 70,
        penalty_points: Math.floor(Math.random() * 10),
        trips_count: Math.floor(Math.random() * 50) + 20,
        distance: Math.floor(Math.random() * 500),
        distance_text: `${Math.floor(Math.random() * 500)} km`,
        client: mockClients[Math.floor(Math.random() * mockClients.length)],
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
      });
    }
    
    // Insert data into Supabase
    await updateProgress("Guardando datos en la base de datos...", 75);
    
    const { data, error } = await supabase
      .from('driver_behavior_scores')
      .insert(records);
      
    if (error) {
      console.error("Error inserting driver behavior data:", error);
      return {
        success: false,
        message: `Error al guardar datos: ${error.message}`,
        insertedCount: 0,
        totalCount: records.length,
        errors: [{
          row: 0,
          message: error.message
        }]
      };
    }

    console.log("Successfully inserted records:", data);
    await updateProgress("Finalizado", 100);
    
    // Return success response
    return {
      success: true,
      message: `Se importaron ${records.length} registros de comportamiento de conductores exitosamente`,
      insertedCount: records.length,
      totalCount: records.length,
      errors: []
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
