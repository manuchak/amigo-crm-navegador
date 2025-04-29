
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ServiciosMetricData } from "./types";
import { calcularPorcentajeCambio } from "./utils";
import { getMockServiciosData } from "./mockDataService";

/**
 * Fetches service data from Supabase or falls back to mock data
 * @param dateRange Optional primary date range 
 * @param comparisonRange Optional comparison date range
 * @returns Promise with services metric data
 */
export async function fetchServiciosData(dateRange?: DateRange, comparisonRange?: DateRange): Promise<ServiciosMetricData> {
  if (process.env.NODE_ENV === 'development' && (!dateRange || !dateRange.from || !dateRange.to)) {
    // En modo desarrollo, si no hay rango de fechas, usar datos simulados
    return getMockServiciosData(dateRange);
  }

  try {
    // Establecer fechas por defecto si no se proporcionan
    const endDate = dateRange?.to || new Date();
    const startDate = dateRange?.from || subMonths(endDate, 3);
    
    // Calcular rangos de tiempo para comparaciones
    const currentMonthStart = startOfMonth(endDate);
    const currentMonthEnd = endOfMonth(endDate);
    const previousMonthStart = startOfMonth(subMonths(currentMonthStart, 1));
    const previousMonthEnd = endOfMonth(subMonths(currentMonthStart, 1));
    
    const currentWeekStart = startOfWeek(endDate);
    const currentWeekEnd = endOfWeek(endDate);
    const previousWeekStart = startOfWeek(subWeeks(currentWeekStart, 1));
    const previousWeekEnd = endOfWeek(subWeeks(currentWeekStart, 1));

    // 1. Obtener métricas generales
    const { data: generalMetrics, error: generalError } = await supabase
      .rpc('obtener_metricas_generales', {
        fecha_inicio: startDate.toISOString(),
        fecha_fin: endDate.toISOString(),
        mes_actual_inicio: currentMonthStart.toISOString(),
        mes_actual_fin: currentMonthEnd.toISOString(),
        mes_anterior_inicio: previousMonthStart.toISOString(),
        mes_anterior_fin: previousMonthEnd.toISOString(),
        semana_actual_inicio: currentWeekStart.toISOString(),
        semana_actual_fin: currentWeekEnd.toISOString(),
        semana_anterior_inicio: previousWeekStart.toISOString(),
        semana_anterior_fin: previousWeekEnd.toISOString()
      });

    if (generalError) throw generalError;

    // 2. Obtener alertas de clientes con variaciones significativas
    const { data: alertas, error: alertasError } = await supabase
      .rpc('obtener_alertas_clientes', {
        mes_actual_inicio: currentMonthStart.toISOString(),
        mes_actual_fin: currentMonthEnd.toISOString(),
        mes_anterior_inicio: previousMonthStart.toISOString(),
        mes_anterior_fin: previousMonthEnd.toISOString(),
        umbral_variacion: 20 // Alerta cuando hay incremento de 20% o más
      });

    if (alertasError) throw alertasError;

    // 3. Obtener datos de servicios por cliente
    const { data: clientesData, error: clientesError } = await supabase
      .rpc('obtener_servicios_por_cliente', {
        fecha_inicio: startDate.toISOString(),
        fecha_fin: endDate.toISOString()
      });

    if (clientesError) throw clientesError;

    // 4. Obtener servicios por tipo
    const { data: serviciosPorTipo, error: tipoError } = await supabase
      .rpc('obtener_servicios_por_tipo', {
        fecha_inicio: startDate.toISOString(),
        fecha_fin: endDate.toISOString()
      });

    if (tipoError) throw tipoError;

    // Calcular cambios porcentuales
    const metrics = generalMetrics[0] || {};
    
    const serviciosMoM = {
      current: metrics.servicios_mes_actual || 0,
      previous: metrics.servicios_mes_anterior || 0,
      percentChange: calcularPorcentajeCambio(
        metrics.servicios_mes_actual || 0, 
        metrics.servicios_mes_anterior || 0
      )
    };
    
    const serviciosWoW = {
      current: metrics.servicios_semana_actual || 0,
      previous: metrics.servicios_semana_anterior || 0,
      percentChange: calcularPorcentajeCambio(
        metrics.servicios_semana_actual || 0, 
        metrics.servicios_semana_anterior || 0
      )
    };
    
    const kmPromedioMoM = {
      current: metrics.km_promedio_mes_actual || 0,
      previous: metrics.km_promedio_mes_anterior || 0,
      percentChange: calcularPorcentajeCambio(
        metrics.km_promedio_mes_actual || 0, 
        metrics.km_promedio_mes_anterior || 0
      )
    };

    return {
      totalServicios: metrics.total_servicios || 0,
      serviciosMoM,
      serviciosWoW,
      kmTotales: metrics.km_totales || 0,
      kmPromedioMoM,
      clientesActivos: metrics.clientes_activos || 0,
      clientesNuevos: metrics.clientes_nuevos || 0,
      alertas: alertas || [],
      serviciosPorCliente: clientesData || [],
      serviciosPorTipo: serviciosPorTipo || []
    };
  } catch (error) {
    console.error("Error fetching servicios data:", error);
    // En caso de error, devolver datos simulados
    return getMockServiciosData(dateRange);
  }
}
