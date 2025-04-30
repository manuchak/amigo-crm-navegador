
import { DriverBehaviorData, DriverScore } from '../../../types/driver-behavior.types';

// Create an empty data structure
export const createEmptyDriverBehaviorData = (): DriverBehaviorData => ({
  metrics: [
    { label: "Total Conductores", value: 0 },
    { label: "Conductores Activos", value: 0 },
    { label: "Alertas de Seguridad", value: 0 }
  ],
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
  co2Emissions: {
    totalEmissions: 0,
    emissionsByClient: [],
    emissionsTrend: []
  },
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
export const processDriverBehaviorData = (driverScores: any[]): DriverBehaviorData => {
  console.log(`Processing ${driverScores.length} driver records`);
  
  if (!driverScores || driverScores.length === 0) {
    return createEmptyDriverBehaviorData();
  }
  
  try {
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
    
    // Calculate totals and averages across all records in the time period
    const totalPenaltyPoints = driverScores.reduce((sum, d) => sum + Number(d.penalty_points || 0), 0);
    const totalTrips = driverScores.reduce((sum, d) => sum + Number(d.trips_count || 0), 0);
    const totalDistance = driverScores.reduce((sum, d) => sum + (Number(d.distance) || 0), 0);
    
    // Calculate average score
    const sumScores = driverScores.reduce((sum, d) => sum + Number(d.score || 0), 0);
    const averageScore = driverScores.length > 0 ? sumScores / driverScores.length : 0;
    
    // Group drivers by performance categories
    const sortedByScore = [...driverScores].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
    const sortedByPenalty = [...driverScores].sort((a, b) => Number(a.penalty_points || 0) - Number(b.penalty_points || 0));
    
    const topDrivers = sortedByScore.slice(0, 3);
    const needsImprovement = [...driverScores]
      .filter(d => Number(d.score || 0) < 50)
      .sort((a, b) => Number(a.score || 0) - Number(b.score || 0))
      .slice(0, 3);
    
    const ecoDrivers = sortedByPenalty.slice(0, 3);
    
    // Calculate CO2 emissions (simplified estimate based on distance)
    // Average car emissions: 0.15 kg CO2 per km
    const co2EmissionsValue = totalDistance * 0.15;
    
    // Create emissions trend data (mock data for now)
    const emissionsTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        emissions: co2EmissionsValue / 7 * (0.85 + Math.random() * 0.3)
      };
    }).reverse();
    
    // Create emissions by client (mock data grouped by client)
    const clientEmissions = driverScores.reduce((acc, driver) => {
      if (!acc[driver.client]) {
        acc[driver.client] = 0;
      }
      const driverDistance = Number(driver.distance) || 0;
      acc[driver.client] += driverDistance * 0.15;
      return acc;
    }, {} as Record<string, number>);
    
    // Fix: Explicitly cast the emissions property as number
    const emissionsByClient = Object.entries(clientEmissions).map(([client, emissions]) => ({
      client,
      emissions: Number(emissions)
    }));
    
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
    
    // Build metrics array with real data
    const metrics = [
      { label: "Total Conductores", value: driverScores.length },
      { label: "Conductores Activos", value: driverScores.filter(d => Number(d.trips_count || 0) > 0).length },
      { label: "Alertas de Seguridad", value: totalPenaltyPoints }
    ];
    
    // Log the processed data summary
    console.log("Processed driver data summary:", {
      totalDrivers: driverScores.length,
      averageScore: averageScore.toFixed(1),
      totalTrips,
      totalPenaltyPoints,
      riskLevel
    });
    
    return {
      metrics,
      driverScores,
      scoreDistribution: { excellent, good, fair, poor, critical },
      averageScore,
      totalPenaltyPoints,
      totalTrips,
      totalDrivingTime,
      totalDistance,
      co2Emissions: {
        totalEmissions: co2EmissionsValue,
        emissionsByClient,
        emissionsTrend
      },
      riskAssessment: {
        level: riskLevel,
        score: Math.round(riskScore),
        description: riskDescription,
        recommendations
      },
      driverPerformance: {
        topDrivers,
        needsImprovement,
        ecoDrivers
      }
    };
  } catch (error) {
    console.error("Error processing driver behavior data:", error);
    return createEmptyDriverBehaviorData();
  }
};
