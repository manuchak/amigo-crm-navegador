import { supabase } from '@/integrations/supabase/client';
import { format, subMonths } from 'date-fns';

// Tipos para los KPI
export interface CustodioKpiData {
  month_year: string;
  total_custodios: number;
  total_servicios: number;
  total_revenue: number;
  avg_revenue_per_service: number;
  avg_services_per_custodio: number;
}

export interface CustodioMetrics {
  id: number;
  month_year: string;
  staff_cost: number;
  asset_cost: number;
  marketing_cost: number;
  nps_promoters: number;
  nps_neutral: number;
  nps_detractors: number;
  acquisition_cost_manual: number;
  avg_onboarding_days: number;
  campaign_name: string | null;
  campaign_cost: number;
  campaign_revenue: number;
}

export interface NewCustodiosByMonth {
  month_year: string;
  new_custodios: number;
}

export interface CustodioRetention {
  month_year: string; // Changed from Date to string to match the interface
  active_start: number;
  active_end: number;
  retention_rate: number;
  new_custodios: number;
  lost_custodios: number;
  growth_rate: number;
}

export interface CustodioLtv {
  nombre_custodio: string;
  months_active: number;
  total_revenue: number;
  avg_monthly_revenue: number;
  estimated_ltv: number;
  last_service_date: string;
}

// Funciones para obtener los datos
export async function getCustodioKpiData(months: number = 12): Promise<CustodioKpiData[]> {
  const startDate = format(subMonths(new Date(), months), 'yyyy-MM-dd');
  
  // Primero intentamos obtener datos de la tabla custodio_kpi_data
  const { data: kpiData, error: kpiError } = await supabase
    .from('custodio_kpi_data')
    .select('*')
    .gte('month_year', startDate)
    .order('month_year', { ascending: true });
    
  if (!kpiError && kpiData && kpiData.length > 0) {
    return kpiData;
  }
  
  // Si no hay datos o hay un error, calculamos directamente de servicios_custodia
  console.log('No KPI data found, calculating from servicios_custodia directly');
  
  // Consultamos los servicios en el rango de fechas
  const { data: serviciosData, error: serviciosError } = await supabase
    .from('servicios_custodia')
    .select('nombre_custodio, fecha_hora_cita, cobro_cliente, estado')
    .gte('fecha_hora_cita', startDate)
    .is('nombre_custodio', 'not.null')
    .order('fecha_hora_cita', { ascending: true });
  
  if (serviciosError || !serviciosData) {
    console.error('Error fetching servicios data:', serviciosError);
    return [];
  }
  
  // Agrupamos por mes y calculamos las métricas
  const monthlyData: Record<string, {
    total_custodios: Set<string>;
    total_servicios: number;
    total_revenue: number;
  }> = {};
  
  serviciosData.forEach(servicio => {
    if (!servicio.fecha_hora_cita) return;
    
    // Skip cancelled services for counting revenue
    if (servicio.estado === 'Cancelado') {
      // Only count the service in total_servicios, but not for revenue
      const monthYear = format(new Date(servicio.fecha_hora_cita), 'yyyy-MM-01');
      
      // Initialize month if it doesn't exist
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          total_custodios: new Set(),
          total_servicios: 0,
          total_revenue: 0
        };
      }
      
      // Only count custodian and service, but not revenue
      if (servicio.nombre_custodio) {
        monthlyData[monthYear].total_custodios.add(servicio.nombre_custodio);
      }
      monthlyData[monthYear].total_servicios += 1;
      return;
    }
    
    // Format date to first day of month for grouping
    const monthYear = format(new Date(servicio.fecha_hora_cita), 'yyyy-MM-01');
    
    // Initialize month if it doesn't exist
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        total_custodios: new Set(),
        total_servicios: 0,
        total_revenue: 0
      };
    }
    
    // Increment metrics
    if (servicio.nombre_custodio) {
      monthlyData[monthYear].total_custodios.add(servicio.nombre_custodio);
    }
    monthlyData[monthYear].total_servicios += 1;
    monthlyData[monthYear].total_revenue += Number(servicio.cobro_cliente) || 0;
  });
  
  // Convertimos a formato CustodioKpiData
  return Object.entries(monthlyData).map(([month_year, data]) => {
    const custodios_count = data.total_custodios.size;
    
    return {
      month_year,
      total_custodios: custodios_count,
      total_servicios: data.total_servicios,
      total_revenue: data.total_revenue,
      avg_revenue_per_service: data.total_servicios > 0 ? data.total_revenue / data.total_servicios : 0,
      avg_services_per_custodio: custodios_count > 0 ? data.total_servicios / custodios_count : 0
    };
  }).sort((a, b) => a.month_year.localeCompare(b.month_year));
}

export async function getCustodioMetrics(months: number = 12): Promise<CustodioMetrics[]> {
  const startDate = format(subMonths(new Date(), months), 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('custodio_metrics')
    .select('*')
    .gte('month_year', startDate)
    .order('month_year', { ascending: true });
    
  if (error) {
    console.error('Error fetching custodio metrics:', error);
    return [];
  }
  
  return data || [];
}

export async function getNewCustodiosByMonth(months: number = 12): Promise<NewCustodiosByMonth[]> {
  // Usamos la función get_new_custodios_by_month en la base de datos
  const { data, error } = await supabase
    .rpc('get_new_custodios_by_month')
    .limit(months);
    
  if (error) {
    console.error('Error fetching new custodios by month:', error);
    return [];
  }
  
  return data || [];
}

// Improved retention calculation function
export async function getCustodioRetention(months: number = 12): Promise<CustodioRetention[]> {
  const endDate = new Date();
  const startDate = subMonths(endDate, months);
  
  // Use the function calculate_custodio_retention in the database
  const { data, error } = await supabase
    .rpc('calculate_custodio_retention', { 
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    });
    
  if (error) {
    console.error('Error fetching custodio retention:', error);
    
    // If there's an error, let's implement our own calculation as fallback
    try {
      console.log('Using manual retention calculation fallback');
      return await calculateRetentionManually(startDate, endDate);
    } catch (fallbackError) {
      console.error('Error in fallback retention calculation:', fallbackError);
      return [];
    }
  }
  
  return data || [];
}

// New function to calculate retention manually if the RPC call fails
async function calculateRetentionManually(startDate: Date, endDate: Date): Promise<CustodioRetention[]> {
  console.log('Calculating retention manually from:', format(startDate, 'yyyy-MM-dd'), 'to:', format(endDate, 'yyyy-MM-dd'));
  const retentionData: CustodioRetention[] = [];
  
  // Get all servicios data for the period to avoid multiple DB calls, excluding cancelled services
  const { data: allServiciosData, error: allServiciosError } = await supabase
    .from('servicios_custodia')
    .select('nombre_custodio, fecha_hora_cita, estado')
    .gte('fecha_hora_cita', format(startDate, 'yyyy-MM-dd'))
    .lte('fecha_hora_cita', format(endDate, 'yyyy-MM-dd'))
    .neq('estado', 'Cancelado')
    .is('nombre_custodio', 'not.null')
    .order('fecha_hora_cita', { ascending: true });
    
  if (allServiciosError || !allServiciosData || allServiciosData.length === 0) {
    console.error('Error fetching all servicios data:', allServiciosError);
    return [];
  }
  
  console.log(`Retrieved ${allServiciosData.length} servicios for retention calculation`);
  
  // Group servicios by month with custodio names
  const custodiosByMonth: Record<string, Set<string>> = {};
  allServiciosData.forEach(servicio => {
    if (!servicio.fecha_hora_cita || !servicio.nombre_custodio) return;
    
    const monthKey = format(new Date(servicio.fecha_hora_cita), 'yyyy-MM-01');
    
    if (!custodiosByMonth[monthKey]) {
      custodiosByMonth[monthKey] = new Set<string>();
    }
    
    custodiosByMonth[monthKey].add(servicio.nombre_custodio);
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(custodiosByMonth).sort();
  console.log('Months with custodio data:', sortedMonths);
  
  // We need at least 2 months to calculate retention
  if (sortedMonths.length < 2) {
    console.warn('Not enough months to calculate retention (need at least 2 months)');
    return [];
  }
  
  // Calculate retention for each month starting from the second month
  for (let i = 1; i < sortedMonths.length; i++) {
    const currentMonth = sortedMonths[i];
    const previousMonth = sortedMonths[i-1];
    
    // Get sets of custodios for both months
    const currentCustodios = custodiosByMonth[currentMonth];
    const previousCustodios = custodiosByMonth[previousMonth];
    
    console.log(`Calculating retention for ${currentMonth}:`, 
      `Previous month custodios: ${previousCustodios.size}`,
      `Current month custodios: ${currentCustodios.size}`);
    
    // Count custodios that appear in both months (retained)
    let retainedCount = 0;
    previousCustodios.forEach(custodio => {
      if (currentCustodios.has(custodio)) {
        retainedCount++;
      }
    });
    
    // Calculate retention rate - KEY FORMULA: (retained / previous) * 100
    const retentionRate = previousCustodios.size > 0 
      ? (retainedCount / previousCustodios.size) * 100 
      : 0;
      
    console.log(`Retained: ${retainedCount} out of ${previousCustodios.size}, Rate: ${retentionRate.toFixed(2)}%`);
      
    // Calculate new custodios (in current month but not in previous)
    let newCustodiosCount = 0;
    currentCustodios.forEach(custodio => {
      if (!previousCustodios.has(custodio)) {
        newCustodiosCount++;
      }
    });
    
    // Calculate lost custodios (in previous month but not in current)
    const lostCustodiosCount = previousCustodios.size - retainedCount;
    
    // Calculate growth rate
    const growthRate = previousCustodios.size > 0
      ? ((currentCustodios.size - previousCustodios.size) / previousCustodios.size) * 100
      : 0;
    
    retentionData.push({
      month_year: currentMonth, // This is already a string formatted as 'yyyy-MM-01'
      active_start: previousCustodios.size,
      active_end: currentCustodios.size,
      retention_rate: retentionRate,
      new_custodios: newCustodiosCount,
      lost_custodios: lostCustodiosCount,
      growth_rate: growthRate
    });
  }
  
  return retentionData;
}

export async function getCustodioLtv(months: number = 12): Promise<CustodioLtv[]> {
  // Usamos la función calculate_custodio_ltv en la base de datos
  const { data, error } = await supabase
    .rpc('calculate_custodio_ltv', { months_lookback: months });
    
  if (error) {
    console.error('Error fetching custodio LTV:', error);
    return [];
  }
  
  return data || [];
}

// Función para actualizar métricas manuales
export async function updateCustodioMetrics(metrics: Partial<CustodioMetrics>): Promise<boolean> {
  // If no exists the metric for that month, create it
  if (!metrics.id) {
    const { error } = await supabase
      .from('custodio_metrics')
      .insert([metrics]);
      
    return !error;
  }
  
  // If already exists, update
  const { error } = await supabase
    .from('custodio_metrics')
    .update(metrics)
    .eq('id', metrics.id);
    
  return !error;
}
