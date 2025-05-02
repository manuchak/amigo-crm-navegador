
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
  
  const { data, error } = await supabase
    .from('custodio_kpi_data')
    .select('*')
    .gte('month_year', startDate)
    .order('month_year', { ascending: true });
    
  if (error) {
    console.error('Error fetching custodio KPI data:', error);
    return [];
  }
  
  return data || [];
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
