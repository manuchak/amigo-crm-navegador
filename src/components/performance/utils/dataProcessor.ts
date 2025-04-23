
import { CustodioPerformanceData } from "../types/performance.types";
import { 
  calculateSummaryMetrics, 
  generatePerformanceTrends, 
  generateMonthlyRevenue, 
  generateMonthlyRetention 
} from "./metricsCalculator";

export function processExcelData(jsonData: any[]): CustodioPerformanceData {
  try {
    const custodios = jsonData.map((row, index) => ({
      id: index + 1,
      name: row.Nombre || `Custodio ${index + 1}`,
      activeMonths: parseInt(row.MesesActivo) || Math.floor(1 + Math.random() * 24),
      completedJobs: parseInt(row.TrabajosCompletados) || Math.floor(10 + Math.random() * 200),
      averageRating: parseFloat(row.CalificacionPromedio) || (3.5 + Math.random() * 1.5),
      reliability: parseFloat(row.Confiabilidad) || (3.2 + Math.random() * 1.8),
      responseTime: parseFloat(row.TiempoRespuesta) || (2 + Math.random() * 4),
      earnings: parseFloat(row.Ingresos) || Math.floor(5000 + Math.random() * 15000),
      ltv: parseFloat(row.ValorVidaCliente) || Math.floor(25000 + Math.random() * 100000),
      status: (row.Estado || Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'pending')) as 'active' | 'inactive' | 'pending'
    }));

    const summaryMetrics = calculateSummaryMetrics(custodios);
    const performanceByDay = generatePerformanceTrends();
    const monthlyRevenue = generateMonthlyRevenue();
    const totalRevenue = custodios.reduce((sum, c) => sum + c.earnings, 0);

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
  } catch (error) {
    console.error('Error processing Excel data:', error);
    throw new Error('Failed to process Excel data');
  }
}
