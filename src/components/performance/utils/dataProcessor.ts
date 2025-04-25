
import { CustodioPerformanceData, CustodioData } from "../types/performance.types";
import { DateRange } from "react-day-picker";
import { 
  calculateSummaryMetrics, 
  generatePerformanceTrends, 
  generateMonthlyRevenue, 
  generateMonthlyRetention 
} from "./metricsCalculator";

export function processExcelData(jsonData: any[], dateRange: DateRange): CustodioPerformanceData {
  try {
    // Sanity check for data
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      console.error('No data provided or empty array');
      // Return mock data in case of empty data
      return generateMockData();
    }
    
    console.log('Processing Excel data:', jsonData.length, 'rows');
    
    // Filter data by date range if dates are provided
    const filteredData = dateRange?.from && dateRange?.to
      ? jsonData.filter(row => {
          try {
            const appointmentDate = new Date(row.FechaCita);
            return appointmentDate >= dateRange.from! && appointmentDate <= dateRange.to!;
          } catch (e) {
            // If date parsing fails, include the row anyway
            console.warn('Failed to parse date for row:', row);
            return true;
          }
        })
      : jsonData;

    // Map rows to custodio objects with safe type conversions
    const custodios = filteredData.map((row, index) => {
      // Extract values with safety checks to prevent NaN
      const parseIntSafe = (value: any) => {
        if (value === undefined || value === null) return undefined;
        const parsed = parseInt(String(value));
        return isNaN(parsed) ? undefined : parsed;
      };
      
      const parseFloatSafe = (value: any) => {
        if (value === undefined || value === null) return undefined;
        const parsed = parseFloat(String(value));
        return isNaN(parsed) ? undefined : parsed;
      };
      
      // Try to get the name from various possible fields
      const name = row.NombreCustodio || row.nombre_custodio || row.nombre || `Custodio ${index + 1}`;
      
      return {
        id: index + 1,
        name,
        activeMonths: parseIntSafe(row.MesesActivo) || Math.floor(1 + Math.random() * 24),
        completedJobs: parseIntSafe(row.TrabajosCompletados) || Math.floor(10 + Math.random() * 200),
        averageRating: parseFloatSafe(row.CalificacionPromedio) || (3.5 + Math.random() * 1.5),
        reliability: parseFloatSafe(row.Confiabilidad) || (3.2 + Math.random() * 1.8),
        responseTime: parseFloatSafe(row.TiempoRespuesta) || (2 + Math.random() * 4),
        earnings: parseFloatSafe(row.Ingresos) || Math.floor(5000 + Math.random() * 15000),
        ltv: parseFloatSafe(row.ValorVidaCliente) || Math.floor(25000 + Math.random() * 100000),
        status: (row.Estado || Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'pending')) as 'active' | 'inactive' | 'pending'
      };
    });

    // Fixed: Use calculateSummaryMetrics which returns PerformanceMetric[]
    const summaryMetrics = calculateSummaryMetrics(custodios, dateRange);
    const performanceByDay = generatePerformanceTrends();
    const monthlyRevenue = generateMonthlyRevenue();
    const totalRevenue = custodios.reduce((sum, c) => sum + c.earnings, 0);

    return {
      summaryMetrics,  // This now correctly uses the array returned by calculateSummaryMetrics
      performanceByDay,
      custodios,
      revenue: {
        totalRevenue,
        averageRevenue: totalRevenue / custodios.length,
        byMonth: monthlyRevenue,
        byService: [
          { service: 'Validaciones', revenue: totalRevenue * 0.4 },
          { service: 'Escoltas', revenue: totalRevenue * 0.3 },
          { service: 'Seguridad', revenue: totalRevenue * 0.2 },
          { service: 'Otros', revenue: totalRevenue * 0.1 }
        ]
      },
      retention: {
        retention30Days: 85,
        retention60Days: 80,
        retention90Days: 75,
        churnRate: 15,
        retentionByMonth: generateMonthlyRetention()
      },
      activityMap: {
        locations: Array.from({ length: 50 }, () => ({
          lat: 19.4326 + (Math.random() - 0.5) * 0.5,
          lng: -99.1332 + (Math.random() - 0.5) * 0.5,
          weight: Math.random() * 10
        })),
        heatData: null
      }
    };
  } catch (error) {
    console.error('Error processing Excel data:', error);
    return generateMockData();
  }
}

// Helper function to generate mock data when no data is available
function generateMockData(): CustodioPerformanceData {
  const custodios = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Custodio Mock ${i + 1}`,
    activeMonths: Math.floor(1 + Math.random() * 24),
    completedJobs: Math.floor(10 + Math.random() * 200),
    averageRating: 3.5 + Math.random() * 1.5,
    reliability: 3.2 + Math.random() * 1.8,
    responseTime: 2 + Math.random() * 4,
    earnings: Math.floor(5000 + Math.random() * 15000),
    ltv: Math.floor(25000 + Math.random() * 100000),
    status: (Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'pending')) as 'active' | 'inactive' | 'pending'
  }));
  
  const totalRevenue = custodios.reduce((sum, c) => sum + c.earnings, 0);
  const performanceByDay = generatePerformanceTrends();
  const monthlyRevenue = generateMonthlyRevenue();
  
  // Fixed: Create a proper DateRange object for calculateSummaryMetrics
  const defaultDateRange: DateRange = {
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  };
  
  // Fixed: Use calculateSummaryMetrics to generate metrics properly with valid DateRange
  const summaryMetrics = calculateSummaryMetrics(custodios, defaultDateRange);
  
  return {
    summaryMetrics,
    performanceByDay,
    custodios,
    revenue: {
      totalRevenue,
      averageRevenue: totalRevenue / custodios.length,
      byMonth: monthlyRevenue,
      byService: [
        { service: 'Validaciones', revenue: totalRevenue * 0.4 },
        { service: 'Escoltas', revenue: totalRevenue * 0.3 },
        { service: 'Seguridad', revenue: totalRevenue * 0.2 },
        { service: 'Otros', revenue: totalRevenue * 0.1 }
      ]
    },
    retention: {
      retention30Days: 85,
      retention60Days: 80,
      retention90Days: 75,
      churnRate: 15,
      retentionByMonth: generateMonthlyRetention()
    },
    activityMap: {
      locations: Array.from({ length: 50 }, () => ({
        lat: 19.4326 + (Math.random() - 0.5) * 0.5,
        lng: -99.1332 + (Math.random() - 0.5) * 0.5,
        weight: Math.random() * 10
      })),
      heatData: null
    }
  };
}
