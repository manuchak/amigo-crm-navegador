
import { DateRange } from "react-day-picker";
import { DriverBehaviorData, DriverBehaviorFilters } from "../../types/driver-behavior.types";
import { ImportResponse, ProgressCallback } from "../import/types";

// Mock data for development
const mockClients = ["Aquasteam", "Servprot", "Shellpride", "Logitrade", "TransGlobal"];

// Mock driver behavior data generator
const generateMockDriverBehaviorData = (dateRange: DateRange, filters?: DriverBehaviorFilters): DriverBehaviorData => {
  // Filter client based on filters
  const client = filters?.client || "All Clients";
  
  return {
    metrics: [
      { label: "Total Conductores", value: 42 },
      { label: "Conductores Activos", value: 38 },
      { label: "Alertas de Seguridad", value: 156 }
    ],
    driverScores: Array(10).fill(null).map((_, i) => ({
      id: i + 1,
      driver_name: `Driver ${i + 1}`,
      driver_group: i % 3 === 0 ? "Group A" : i % 3 === 1 ? "Group B" : "Group C",
      score: Math.floor(Math.random() * 40) + 60,
      penalty_points: Math.floor(Math.random() * 20),
      trips_count: Math.floor(Math.random() * 100) + 10,
      distance: Math.random() * 1000,
      distance_text: `${Math.floor(Math.random() * 1000)} km`,
      start_date: dateRange.from?.toISOString() || new Date().toISOString(),
      end_date: dateRange.to?.toISOString() || new Date().toISOString(),
      client: i % mockClients.length === 0 ? mockClients[0] : mockClients[i % mockClients.length],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    scoreDistribution: {
      excellent: 15,
      good: 45,
      fair: 30,
      poor: 8,
      critical: 2
    },
    averageScore: 5.1,
    totalPenaltyPoints: 450,
    totalTrips: 1495,
    totalDrivingTime: 12450,
    totalDistance: 28750,
    co2Emissions: 5842,
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
      topDrivers: Array(3).fill(null).map((_, i) => ({
        id: i + 100,
        driver_name: `Top Driver ${i + 1}`,
        driver_group: "Elite Drivers",
        score: Math.floor(Math.random() * 10) + 90,
        penalty_points: Math.floor(Math.random() * 5),
        trips_count: Math.floor(Math.random() * 50) + 50,
        start_date: dateRange.from?.toISOString() || new Date().toISOString(),
        end_date: dateRange.to?.toISOString() || new Date().toISOString(),
        client: client === "All Clients" ? mockClients[i % mockClients.length] : client,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      needsImprovement: Array(3).fill(null).map((_, i) => ({
        id: i + 200,
        driver_name: `Improvement Needed ${i + 1}`,
        driver_group: "Risk Group",
        score: Math.floor(Math.random() * 20) + 40,
        penalty_points: Math.floor(Math.random() * 10) + 15,
        trips_count: Math.floor(Math.random() * 30) + 10,
        start_date: dateRange.from?.toISOString() || new Date().toISOString(),
        end_date: dateRange.to?.toISOString() || new Date().toISOString(),
        client: client === "All Clients" ? mockClients[i % mockClients.length] : client,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      ecoDrivers: Array(3).fill(null).map((_, i) => ({
        id: i + 300,
        driver_name: `Eco Driver ${i + 1}`,
        driver_group: "Green Team",
        score: Math.floor(Math.random() * 15) + 80,
        penalty_points: Math.floor(Math.random() * 7),
        trips_count: Math.floor(Math.random() * 40) + 30,
        start_date: dateRange.from?.toISOString() || new Date().toISOString(),
        end_date: dateRange.to?.toISOString() || new Date().toISOString(),
        client: client === "All Clients" ? mockClients[i % mockClients.length] : client,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
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
  
  // Return a successful import response
  return {
    success: true,
    message: "Datos de comportamiento de conductores importados correctamente",
    rowsProcessed: 150,
    errors: [] // No errors in this mock implementation
  };
};
