
import { DateRange } from "react-day-picker";
import { DriverBehaviorData, DriverBehaviorFilters, DriverScore } from "../../types/driver-behavior.types";
import { ImportResponse, ProgressCallback } from "../import/types";

// Mock data for development
const mockClients = ["Aquasteam", "Servprot", "Shellpride", "Logitrade", "TransGlobal"];

// Mock driver behavior data generator
const generateMockDriverBehaviorData = (dateRange: DateRange, filters?: DriverBehaviorFilters): DriverBehaviorData => {
  // Filter based on selected clients
  const selectedClients = filters?.selectedClients || [];
  const useClientFilter = selectedClients.length > 0;
  
  // Generate driver scores filtered by client if specified
  const driverScores = Array(10).fill(null).map((_, i) => {
    const client = i % mockClients.length === 0 ? mockClients[0] : mockClients[i % mockClients.length];
    
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
  }).filter(driver => {
    if (!useClientFilter) return true;
    return selectedClients.includes(driver.client);
  });
  
  // Generate top drivers filtered by client if specified
  const generateDrivers = (prefix: string, scoreBase: number, count: number = 3) => {
    return Array(count).fill(null).map((_, i) => {
      const client = mockClients[i % mockClients.length];
      
      return {
        id: i + 100,
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
    }).filter(driver => {
      if (!useClientFilter) return true;
      return selectedClients.includes(driver.client);
    });
  };
  
  return {
    metrics: [
      { label: "Total Conductores", value: useClientFilter ? driverScores.length + 2 : 42 },
      { label: "Conductores Activos", value: useClientFilter ? driverScores.length : 38 },
      { label: "Alertas de Seguridad", value: useClientFilter ? Math.floor(driverScores.length * 4.1) : 156 }
    ],
    driverScores,
    scoreDistribution: {
      excellent: useClientFilter ? Math.floor(15 * (driverScores.length / 10)) : 15,
      good: useClientFilter ? Math.floor(45 * (driverScores.length / 10)) : 45,
      fair: useClientFilter ? Math.floor(30 * (driverScores.length / 10)) : 30,
      poor: useClientFilter ? Math.floor(8 * (driverScores.length / 10)) : 8,
      critical: useClientFilter ? Math.floor(2 * (driverScores.length / 10)) : 2
    },
    averageScore: 5.1,
    totalPenaltyPoints: useClientFilter ? driverScores.reduce((sum, d) => sum + d.penalty_points, 0) : 450,
    totalTrips: useClientFilter ? driverScores.reduce((sum, d) => sum + d.trips_count, 0) : 1495,
    totalDrivingTime: useClientFilter ? Math.floor(12450 * (driverScores.length / 10)) : 12450,
    totalDistance: useClientFilter ? Math.floor(28750 * (driverScores.length / 10)) : 28750,
    co2Emissions: useClientFilter ? Math.floor(5842 * (driverScores.length / 10)) : 5842,
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
      topDrivers: generateDrivers("Top Driver", 90),
      needsImprovement: generateDrivers("Improvement Needed", 40),
      ecoDrivers: generateDrivers("Eco Driver", 80)
    }
  };
};

// Fetch driver behavior data with optional filters
export const fetchDriverBehaviorData = async (dateRange: DateRange, filters?: DriverBehaviorFilters): Promise<DriverBehaviorData> => {
  // This would be an API call in a real application
  console.log("Fetching driver behavior data with filters:", filters);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return generateMockDriverBehaviorData(dateRange, filters);
};

// Fetch client list for filtering
export const fetchClientList = async (): Promise<string[]> => {
  console.log("Fetching client list");
  
  // This would be an API call in a real application
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return a consistent list of clients for selection
  return mockClients;
};

// Add the missing import function that was referenced in importFactory.ts
export const importDriverBehaviorData = async (
  file: File,
  onProgress?: ProgressCallback
): Promise<ImportResponse> => {
  console.log("Importing driver behavior data from file:", file.name);

  // Simulate file processing and reporting progress
  if (onProgress) {
    onProgress("Analizando archivo...", 0, 100);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onProgress("Procesando datos...", 25, 100);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onProgress("Validando datos...", 50, 100);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    onProgress("Guardando datos...", 75, 100);
    await new Promise(resolve => setTimeout(resolve, 700));
    
    onProgress("Finalizado", 100, 100);
  }
  
  // Return a successful import response with properties that match ImportResponse type
  return {
    success: true,
    message: "Datos de comportamiento de conductores importados correctamente",
    insertedCount: 150,
    totalCount: 150,
    errors: [] // No errors in this mock implementation
  };
};
