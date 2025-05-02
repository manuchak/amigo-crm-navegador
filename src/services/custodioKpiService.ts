
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
    .select('nombre_custodio, fecha_hora_cita, cobro_cliente')
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
    
    // Formateamos la fecha al primer día del mes para agrupar
    const monthYear = format(new Date(servicio.fecha_hora_cita), 'yyyy-MM-01');
    
    // Inicializamos el mes si no existe
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        total_custodios: new Set(),
        total_servicios: 0,
        total_revenue: 0
      };
    }
    
    // Incrementamos las métricas
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

export async function getCustodioRetention(months: number = 12): Promise<CustodioRetention[]> {
  const endDate = new Date();
  const startDate = subMonths(endDate, months);
  
  // Usamos la función calculate_custodio_retention en la base de datos
  const { data, error } = await supabase
    .rpc('calculate_custodio_retention', { 
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd')
    });
    
  if (error) {
    console.error('Error fetching custodio retention:', error);
    return [];
  }
  
  return data || [];
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
  // Si no existe la métrica para ese mes, crearla
  if (!metrics.id) {
    const { error } = await supabase
      .from('custodio_metrics')
      .insert([metrics]);
      
    return !error;
  }
  
  // Si ya existe, actualizar
  const { error } = await supabase
    .from('custodio_metrics')
    .update(metrics)
    .eq('id', metrics.id);
    
  return !error;
}
