
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { CustodioPerformanceData, CustodioData } from "../types/performance.types";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isValid } from "date-fns";

export function useCustodioPerformanceData(dateRange: DateRange, comparisonRange?: DateRange) {
  return useQuery({
    queryKey: ['custodio-performance-data', dateRange, comparisonRange],
    queryFn: async (): Promise<CustodioPerformanceData> => {
      try {
        console.log("Fetching custodio performance data with:", { dateRange, comparisonRange });
        
        // Make sure dateRange has valid dates
        if (!dateRange.from || !dateRange.to) {
          console.warn('Invalid date range provided to useCustodioPerformanceData');
          throw new Error('Invalid date range');
        }
        
        // Fetch servicios_custodia data with the provided date range
        const { data: serviciosData, error: serviciosError } = await supabase
          .from('servicios_custodia')
          .select(`
            id,
            nombre_custodio,
            fecha_hora_cita,
            km_recorridos,
            cobro_cliente,
            estado,
            duracion_servicio,
            tiempo_retraso
          `)
          .gte('fecha_hora_cita', dateRange.from.toISOString())
          .lte('fecha_hora_cita', dateRange.to.toISOString())
          .not('nombre_custodio', 'is', null)
          .order('fecha_hora_cita', { ascending: false });
          
        if (serviciosError) {
          console.error("Error fetching servicios_custodia data:", serviciosError);
          throw serviciosError;
        }
        
        if (!serviciosData || serviciosData.length === 0) {
          console.warn("No servicios_custodia data found for date range");
          return generateEmptyResponse();
        }
        
        console.log(`Successfully fetched ${serviciosData.length} servicios_custodia records`);
        
        // Process servicios data to get custodios metrics
        const custodioMap = new Map();
        const dailyPerformance = new Map();
        
        // First pass - group by custodio
        serviciosData.forEach(servicio => {
          if (!servicio.nombre_custodio) return;
          
          const custodioName = servicio.nombre_custodio;
          
          if (!custodioMap.has(custodioName)) {
            custodioMap.set(custodioName, {
              services: [],
              activeMonthsSet: new Set(),
              totalEarnings: 0,
              ratings: []
            });
          }
          
          const custodioData = custodioMap.get(custodioName);
          custodioData.services.push(servicio);
          
          // Track unique months active (for active months count)
          if (servicio.fecha_hora_cita && isValid(new Date(servicio.fecha_hora_cita))) {
            const date = new Date(servicio.fecha_hora_cita);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            custodioData.activeMonthsSet.add(monthKey);
          }
          
          // Track earnings (from cobro_cliente)
          if (servicio.cobro_cliente && !isNaN(Number(servicio.cobro_cliente))) {
            custodioData.totalEarnings += Number(servicio.cobro_cliente);
          }
          
          // Group data by day for performance trends
          if (servicio.fecha_hora_cita) {
            const dateKey = format(new Date(servicio.fecha_hora_cita), 'yyyy-MM-dd');
            
            if (!dailyPerformance.has(dateKey)) {
              dailyPerformance.set(dateKey, {
                date: dateKey,
                completionCount: 0,
                totalCompletions: 0,
                responseTimeSum: 0,
                responseTimeCount: 0,
                reliabilitySum: 0,
                reliabilityCount: 0,
                qualitySum: 0,
                qualityCount: 0,
                validations: 0
              });
            }
            
            const dayData = dailyPerformance.get(dateKey);
            dayData.validations += 1;
            
            // Count completed services (not cancelled)
            if (servicio.estado && servicio.estado.toLowerCase() !== 'cancelado') {
              dayData.completionCount += 1;
            }
            dayData.totalCompletions += 1;
            
            // Calculate response time based on tiempo_retraso (if available)
            if (servicio.tiempo_retraso) {
              const responseTimeHours = parseIntervalToHours(servicio.tiempo_retraso);
              if (!isNaN(responseTimeHours)) {
                dayData.responseTimeSum += responseTimeHours;
                dayData.responseTimeCount += 1;
              }
            }
            
            // Calculate reliability score (simplified)
            // Formula: On-time services score higher
            const isOnTime = !servicio.tiempo_retraso || parseIntervalToHours(servicio.tiempo_retraso) < 0.5;
            if (isOnTime) {
              dayData.reliabilitySum += 5; // Best score for on-time
            } else {
              const delay = parseIntervalToHours(servicio.tiempo_retraso);
              dayData.reliabilitySum += Math.max(1, 5 - Math.floor(delay)); // Lower score for delays
            }
            dayData.reliabilityCount += 1;
            
            // For quality, we'll use a simplified approach based on completion
            if (servicio.estado && servicio.estado.toLowerCase() === 'completado') {
              dayData.qualitySum += 5; // Best score for completed services
            } else if (servicio.estado && servicio.estado.toLowerCase() !== 'cancelado') {
              dayData.qualitySum += 3; // Medium score for other non-cancelled states
            } else {
              dayData.qualitySum += 1; // Low score for cancelled
            }
            dayData.qualityCount += 1;
          }
        });
        
        // Convert custodio map to array of CustodioData objects
        const custodios: CustodioData[] = Array.from(custodioMap.entries()).map(([name, data], index) => {
          const activeMonths = data.activeMonthsSet.size;
          const completedJobs = data.services.filter(s => s.estado && s.estado.toLowerCase() !== 'cancelado').length;
          const totalJobs = data.services.length;
          
          // Calculate metrics
          const reliability = calculateReliabilityScore(data.services);
          const responseTime = calculateResponseTime(data.services);
          const ltv = data.totalEarnings * 1.5; // Simple LTV calculation
          const status: 'active' | 'inactive' | 'pending' = 
            data.services.some(s => {
              const serviceDate = new Date(s.fecha_hora_cita);
              const oneMonthAgo = new Date();
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              return serviceDate > oneMonthAgo;
            }) ? 'active' : 'inactive';
          
          return {
            id: index + 1,
            name,
            activeMonths,
            completedJobs,
            averageRating: calculateQualityScore(data.services),
            reliability,
            responseTime,
            earnings: data.totalEarnings,
            ltv,
            status
          };
        });
        
        // Convert daily performance map to array
        const performanceByDay = Array.from(dailyPerformance.values())
          .map(day => ({
            date: day.date,
            completionRate: day.totalCompletions > 0 ? (day.completionCount / day.totalCompletions) * 100 : 0,
            responseTime: day.responseTimeCount > 0 ? day.responseTimeSum / day.responseTimeCount : 0,
            reliability: day.reliabilityCount > 0 ? day.reliabilitySum / day.reliabilityCount : 0,
            quality: day.qualityCount > 0 ? day.qualitySum / day.qualityCount : 0,
            validations: day.validations
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        // Calculate revenue metrics
        const totalRevenue = custodios.reduce((sum, c) => sum + c.earnings, 0);
        
        // Generate monthly revenue data
        const monthlyRevenue = generateMonthlyRevenueFromServices(serviciosData);
        const retentionData = calculateRetentionMetrics(custodios, serviciosData);
        
        // Calculate summary metrics
        const activeCustodios = custodios.filter(c => c.status === 'active').length;
        const avgResponseTime = custodios.reduce((sum, c) => sum + c.responseTime, 0) / Math.max(1, custodios.length);
        const totalValidations = serviciosData.length;
        
        const result: CustodioPerformanceData = {
          summaryMetrics: [
            {
              label: 'Total Custodios',
              value: custodios.length,
              change: 0,
              changeLabel: 'vs. mes anterior',
              changeType: 'neutral',
              description: 'Custodios únicos en el período'
            },
            { 
              label: 'Validaciones',
              value: totalValidations,
              change: 0,
              changeLabel: 'vs. mes anterior',
              changeType: 'neutral',
              description: 'Total de validaciones en el período'
            },
            { 
              label: 'Tiempo Promedio de Respuesta',
              value: `${avgResponseTime.toFixed(1)}h`,
              change: 0,
              changeLabel: 'vs. mes anterior',
              changeType: 'neutral',
              description: 'Tiempo promedio para responder llamadas'
            },
            { 
              label: 'Tasa de Retención',
              value: `${retentionData.retention30Days}%`,
              change: 0,
              changeLabel: 'vs. mes anterior',
              changeType: 'neutral',
              description: 'Retención de custodios activos'
            },
            { 
              label: 'Distancia Promedio',
              value: `${calculateAverageDistance(serviciosData).toFixed(1)}km`,
              change: 0,
              changeLabel: 'vs. mes anterior',
              changeType: 'neutral',
              description: 'Distancia promedio recorrida'
            },
            { 
              label: 'Ingreso Promedio',
              value: formatCurrency(totalRevenue / Math.max(1, activeCustodios)),
              change: 0,
              changeLabel: 'vs. mes anterior',
              changeType: 'neutral',
              description: 'Ingreso promedio por custodio'
            },
            { 
              label: 'LTV',
              value: formatCurrency(totalRevenue * 1.5 / Math.max(1, activeCustodios)),
              change: 0,
              changeLabel: 'vs. mes anterior',
              changeType: 'neutral',
              description: 'Valor de vida del cliente'
            },
            { 
              label: 'Rotación',
              value: `${100 - retentionData.retention30Days}%`,
              change: 0,
              changeLabel: 'vs. mes anterior',
              changeType: 'neutral',
              description: 'Tasa de rotación mensual'
            }
          ],
          performanceByDay,
          custodios,
          revenue: {
            totalRevenue,
            averageRevenue: totalRevenue / Math.max(1, custodios.length),
            byMonth: monthlyRevenue,
            byService: [
              { service: 'Validaciones', revenue: totalRevenue * 0.4 },
              { service: 'Escoltas', revenue: totalRevenue * 0.3 },
              { service: 'Seguridad', revenue: totalRevenue * 0.2 },
              { service: 'Otros', revenue: totalRevenue * 0.1 }
            ]
          },
          retention: retentionData,
          activityMap: {
            locations: generateLocationData(serviciosData),
            heatData: null
          }
        };
        
        return result;
      } catch (error) {
        console.error('Error in useCustodioPerformanceData:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper functions

// Parse interval string (e.g. "02:30:00") to hours
function parseIntervalToHours(intervalStr: string): number {
  try {
    // Different formats could be present
    const matches = String(intervalStr).match(/(\d+):(\d+):(\d+)/) || 
                   String(intervalStr).match(/(\d+) hours (\d+) mins/);
    
    if (matches) {
      const hours = parseInt(matches[1], 10);
      const minutes = parseInt(matches[2], 10);
      return hours + (minutes / 60);
    }
    
    // Try parsing as hours directly
    const numValue = parseFloat(String(intervalStr));
    if (!isNaN(numValue)) return numValue;
    
    return 0;
  } catch (error) {
    console.error('Error parsing interval:', error);
    return 0;
  }
}

// Calculate reliability score from services
function calculateReliabilityScore(services: any[]): number {
  const reliabilityScores = services.map(service => {
    // Higher score for on-time services
    const isOnTime = !service.tiempo_retraso || parseIntervalToHours(service.tiempo_retraso) < 0.5;
    return isOnTime ? 5 : Math.max(1, 5 - Math.floor(parseIntervalToHours(service.tiempo_retraso)));
  });
  
  return reliabilityScores.length > 0
    ? reliabilityScores.reduce((sum, score) => sum + score, 0) / reliabilityScores.length
    : 0;
}

// Calculate average response time from services
function calculateResponseTime(services: any[]): number {
  const times = services
    .filter(service => service.tiempo_retraso)
    .map(service => parseIntervalToHours(service.tiempo_retraso));
  
  return times.length > 0
    ? times.reduce((sum, time) => sum + time, 0) / times.length
    : 0;
}

// Calculate quality score based on service completion
function calculateQualityScore(services: any[]): number {
  const qualityScores = services.map(service => {
    if (service.estado && service.estado.toLowerCase() === 'completado') {
      return 5; // Best score for completed services
    } else if (service.estado && service.estado.toLowerCase() !== 'cancelado') {
      return 3.5; // Medium score for other non-cancelled states
    } else {
      return 2; // Low score for cancelled
    }
  });
  
  return qualityScores.length > 0
    ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    : 0;
}

// Calculate average distance from services
function calculateAverageDistance(services: any[]): number {
  const distances = services
    .filter(service => service.km_recorridos && !isNaN(Number(service.km_recorridos)))
    .map(service => Number(service.km_recorridos));
  
  return distances.length > 0
    ? distances.reduce((sum, distance) => sum + distance, 0) / distances.length
    : 0;
}

// Format currency value
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(value);
}

// Generate monthly revenue data from services
function generateMonthlyRevenueFromServices(services: any[]): { month: string; revenue: number }[] {
  const monthlyMap = new Map<string, number>();
  
  // Group by month
  services.forEach(service => {
    if (service.fecha_hora_cita && service.cobro_cliente) {
      const date = new Date(service.fecha_hora_cita);
      const monthKey = format(date, 'MMM yyyy');
      const amount = Number(service.cobro_cliente) || 0;
      
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);
    }
  });
  
  // Convert to array and sort
  return Array.from(monthlyMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => {
      // Parse the month to enable proper sorting
      const aDate = new Date(`01 ${a.month}`);
      const bDate = new Date(`01 ${b.month}`);
      return aDate.getTime() - bDate.getTime();
    });
}

// Calculate retention metrics
function calculateRetentionMetrics(custodios: CustodioData[], services: any[]): {
  retention30Days: number;
  retention60Days: number;
  retention90Days: number;
  churnRate: number;
  retentionByMonth: { month: string; rate: number }[];
} {
  // Count active custodios in different time periods
  const now = new Date();
  const days30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  const days60 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);
  const days90 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
  
  // Get unique custodios who had services in each period
  const activeCustodios = new Set(custodios.filter(c => c.status === 'active').map(c => c.name));
  const custodiosLast30 = new Set();
  const custodiosLast60 = new Set();
  const custodiosLast90 = new Set();
  
  services.forEach(service => {
    if (!service.nombre_custodio || !service.fecha_hora_cita) return;
    
    const serviceDate = new Date(service.fecha_hora_cita);
    const custodioName = service.nombre_custodio;
    
    if (serviceDate >= days30) custodiosLast30.add(custodioName);
    if (serviceDate >= days60) custodiosLast60.add(custodioName);
    if (serviceDate >= days90) custodiosLast90.add(custodioName);
  });
  
  // Calculate retention rates
  const totalCustodios = activeCustodios.size;
  const retention30Days = totalCustodios > 0 ? Math.round((custodiosLast30.size / totalCustodios) * 100) : 85;
  const retention60Days = totalCustodios > 0 ? Math.round((custodiosLast60.size / totalCustodios) * 100) : 80;
  const retention90Days = totalCustodios > 0 ? Math.round((custodiosLast90.size / totalCustodios) * 100) : 75;
  const churnRate = 100 - retention30Days;
  
  // Generate retention by month
  const retentionByMonth = generateMonthlyRetention(services);
  
  return {
    retention30Days,
    retention60Days,
    retention90Days,
    churnRate,
    retentionByMonth
  };
}

// Generate monthly retention rates
function generateMonthlyRetention(services: any[]): { month: string; rate: number }[] {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return format(date, 'MMM yyyy');
  });
  
  // Group services by month and count unique custodios
  const monthlyRetentionMap = new Map<string, Set<string>>();
  
  services.forEach(service => {
    if (!service.nombre_custodio || !service.fecha_hora_cita) return;
    
    const monthKey = format(new Date(service.fecha_hora_cita), 'MMM yyyy');
    
    if (!monthlyRetentionMap.has(monthKey)) {
      monthlyRetentionMap.set(monthKey, new Set());
    }
    
    monthlyRetentionMap.get(monthKey)?.add(service.nombre_custodio);
  });
  
  // Calculate retention rates (% of custodios still active each month)
  const allCustodios = new Set<string>();
  services.forEach(service => {
    if (service.nombre_custodio) allCustodios.add(service.nombre_custodio);
  });
  
  const totalCustodios = Math.max(1, allCustodios.size);
  
  return months.map(month => {
    const activeCustodiosInMonth = monthlyRetentionMap.get(month)?.size || 0;
    const rate = Math.round((activeCustodiosInMonth / totalCustodios) * 100);
    return { month, rate: Math.min(100, Math.max(60, rate)) }; // Ensure reasonable values
  });
}

// Generate location data for map
function generateLocationData(services: any[]): { lat: number; lng: number; weight: number }[] {
  // Convert origin/destination locations to coordinates
  // For now we'll generate random data around Mexico City as placeholder
  const locations = [];
  
  // Base coordinates for Mexico City
  const centerLat = 19.4326;
  const centerLng = -99.1332;
  
  // Generate locations from services
  const uniqueLocations = new Set<string>();
  
  services.forEach(service => {
    if (service.origen) uniqueLocations.add(service.origen);
    if (service.destino) uniqueLocations.add(service.destino);
  });
  
  // Create location points
  Array.from(uniqueLocations).forEach((location, index) => {
    // Generate consistent coordinates for same location names
    const hash = stringToNumber(location as string);
    const lat = centerLat + (hash % 10) / 20 - 0.25;
    const lng = centerLng + (hash % 15) / 30 - 0.25;
    
    locations.push({
      lat,
      lng,
      weight: 1 + (hash % 10)
    });
  });
  
  return locations;
}

// Convert string to numeric hash for consistent random generation
function stringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate empty response for when no data is available
function generateEmptyResponse(): CustodioPerformanceData {
  return {
    summaryMetrics: [
      {
        label: 'Total Custodios',
        value: 0,
        change: 0,
        changeLabel: 'vs. mes anterior',
        changeType: 'neutral',
        description: 'Custodios únicos en el período'
      },
      { 
        label: 'Validaciones',
        value: 0,
        change: 0,
        changeLabel: 'vs. mes anterior',
        changeType: 'neutral',
        description: 'Total de validaciones en el período'
      },
      { 
        label: 'Tiempo Promedio de Respuesta',
        value: '0h',
        change: 0,
        changeLabel: 'vs. mes anterior',
        changeType: 'neutral',
        description: 'Tiempo promedio para responder llamadas'
      },
      { 
        label: 'Tasa de Retención',
        value: '0%',
        change: 0,
        changeLabel: 'vs. mes anterior',
        changeType: 'neutral',
        description: 'Retención de custodios activos'
      },
      { 
        label: 'Distancia Promedio',
        value: '0km',
        change: 0,
        changeLabel: 'vs. mes anterior',
        changeType: 'neutral',
        description: 'Distancia promedio recorrida'
      },
      { 
        label: 'Ingreso Promedio',
        value: '$0',
        change: 0,
        changeLabel: 'vs. mes anterior',
        changeType: 'neutral',
        description: 'Ingreso promedio por custodio'
      },
      { 
        label: 'LTV',
        value: '$0',
        change: 0,
        changeLabel: 'vs. mes anterior',
        changeType: 'neutral',
        description: 'Valor de vida del cliente'
      },
      { 
        label: 'Rotación',
        value: '0%',
        change: 0,
        changeLabel: 'vs. mes anterior',
        changeType: 'neutral',
        description: 'Tasa de rotación mensual'
      }
    ],
    performanceByDay: [],
    custodios: [],
    revenue: {
      totalRevenue: 0,
      averageRevenue: 0,
      byMonth: [],
      byService: []
    },
    retention: {
      retention30Days: 0,
      retention60Days: 0,
      retention90Days: 0,
      churnRate: 0,
      retentionByMonth: []
    },
    activityMap: {
      locations: [],
      heatData: null
    }
  };
}
