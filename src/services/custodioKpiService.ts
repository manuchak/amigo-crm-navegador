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
  month_year: string;
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
  const startDate = format(subMonths(new Date(), months), 'yyyy-MM-dd');
  
  console.log('Getting new custodios based on fecha_primer_servicio from', startDate);
  
  // Obtener custodios nuevos basados en fecha_primer_servicio
  const { data, error } = await supabase
    .from('servicios_custodia')
    .select('nombre_custodio, fecha_primer_servicio')
    .is('nombre_custodio', 'not.null')
    .not('fecha_primer_servicio', 'is', null)
    .gte('fecha_primer_servicio', startDate)
    .order('fecha_primer_servicio', { ascending: true });
    
  if (error) {
    console.error('Error fetching new custodios by fecha_primer_servicio:', error);
    return [];
  }
  
  console.log('DEBUG: Retrieved data for new custodios calculation:', data?.length);
  
  // Agrupar por mes y contar custodios únicos
  const monthlyData: Record<string, Set<string>> = {};
  
  data?.forEach(item => {
    if (!item.fecha_primer_servicio || !item.nombre_custodio) return;
    
    // Format to yyyy-MM-01 for month grouping
    const monthYear = format(new Date(item.fecha_primer_servicio), 'yyyy-MM-01');
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = new Set<string>();
    }
    
    monthlyData[monthYear].add(item.nombre_custodio);
  });
  
  const result = Object.entries(monthlyData).map(([month_year, custodiosSet]) => ({
    month_year,
    new_custodios: custodiosSet.size
  })).sort((a, b) => a.month_year.localeCompare(b.month_year));
  
  console.log('DEBUG: Calculated new custodios by month:', result);
  
  return result;
}

// Improved retention calculation function
export async function getCustodioRetention(months: number = 12): Promise<CustodioRetention[]> {
  const endDate = new Date();
  const startDate = subMonths(endDate, months);
  
  console.log('DEBUG: Getting custodio retention from', format(startDate, 'yyyy-MM-dd'), 'to', format(endDate, 'yyyy-MM-dd'));
  
  // Use the function calculate_custodio_retention in the database
  const { data, error } = await supabase
    .rpc('calculate_custodio_retention', { 
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    });
    
  if (error) {
    console.error('Error fetching custodio retention from RPC:', error);
    
    // If there's an error with the RPC, let's implement our own calculation as fallback
    try {
      console.log('Using manual retention calculation fallback');
      return await calculateRetentionManually(startDate, endDate);
    } catch (fallbackError) {
      console.error('Error in fallback retention calculation:', fallbackError);
      return [];
    }
  }
  
  console.log('DEBUG: Raw data from retention RPC:', data?.slice(0, 3));
  
  // Filter out any invalid data (NULL, N/A, undefined) from the database response
  const filteredData = data?.filter(item => 
    item && 
    item.retention_rate !== null && 
    !isNaN(Number(item.retention_rate))
  ) || [];
  
  console.log(`DEBUG: Received ${data?.length || 0} retention records, ${filteredData.length} valid after filtering`);
  
  // Log the first few records for debugging
  if (filteredData.length > 0) {
    console.log('DEBUG: Sample retention data after filtering:', filteredData.slice(0, 3));
  } else {
    console.log('DEBUG: No valid retention data found after filtering');
  }
  
  // Convert string values to numbers where needed
  const processedData = filteredData.map(item => ({
    ...item,
    retention_rate: typeof item.retention_rate === 'string' ? parseFloat(item.retention_rate) : Number(item.retention_rate)
  }));
  
  return processedData;
}

// Enhanced manual retention calculation function with improved null handling and detailed logging
async function calculateRetentionManually(startDate: Date, endDate: Date): Promise<CustodioRetention[]> {
  console.log('DEBUG: Calculating retention manually from:', format(startDate, 'yyyy-MM-dd'), 'to:', format(endDate, 'yyyy-MM-dd'));
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
  
  console.log(`DEBUG: Retrieved ${allServiciosData?.length || 0} servicios for retention calculation`);
  
  // DEBUG: Show some sample data to verify data quality
  if (allServiciosData && allServiciosData.length > 0) {
    console.log('DEBUG: Sample servicios data:', allServiciosData.slice(0, 3));
  }
  
  // Group servicios by month with custodio names
  const custodiosByMonth: Record<string, Set<string>> = {};
  
  // We need to look at each month separately
  let currentDate = new Date(startDate);
  
  // Create empty sets for each month in our range
  while (currentDate <= endDate) {
    const monthKey = format(currentDate, 'yyyy-MM-01');
    custodiosByMonth[monthKey] = new Set<string>();
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  // Now populate those sets with actual custodios
  allServiciosData.forEach(servicio => {
    if (!servicio.fecha_hora_cita || !servicio.nombre_custodio) return;
    
    // Format the date to first day of month for grouping
    const monthKey = format(new Date(servicio.fecha_hora_cita), 'yyyy-MM-01');
    
    if (!custodiosByMonth[monthKey]) {
      custodiosByMonth[monthKey] = new Set<string>();
    }
    
    custodiosByMonth[monthKey].add(servicio.nombre_custodio);
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(custodiosByMonth).sort();
  console.log('DEBUG: Months with custodio data:', sortedMonths);
  
  // For each month, log the custodios count
  sortedMonths.forEach(month => {
    console.log(`DEBUG: Month ${month} has ${custodiosByMonth[month].size} unique custodios`);
  });
  
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
    
    console.log(`DEBUG: Calculating retention for ${currentMonth}:`, 
      `Previous month (${previousMonth}) custodios: ${previousCustodios.size}`,
      `Current month (${currentMonth}) custodios: ${currentCustodios.size}`);
    
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
      
    console.log(`DEBUG: Retained: ${retainedCount} out of ${previousCustodios.size}, Rate: ${retentionRate.toFixed(2)}%`);
      
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
      month_year: currentMonth, 
      active_start: previousCustodios.size,
      active_end: currentCustodios.size,
      retention_rate: retentionRate,
      new_custodios: newCustodiosCount,
      lost_custodios: lostCustodiosCount,
      growth_rate: growthRate
    });
  }
  
  console.log(`DEBUG: Manual calculation completed with ${retentionData.length} retention data points`);
  
  if (retentionData.length > 0) {
    console.log('DEBUG: Sample calculated retention data:', retentionData.slice(0, 3));
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
