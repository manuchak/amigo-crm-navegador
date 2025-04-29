
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ServiciosMetricData } from "./types";
import { calcularPorcentajeCambio, getValidNumberOrZero } from "./utils";
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

    console.log("Date ranges for KM calculation:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

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
    
    // 4. Obtener servicios por tipo y datos crudos de servicios
    const { data: serviciosData, error: serviciosError } = await supabase
      .from('servicios_custodia')
      .select('id, local_foraneo, tipo_servicio, fecha_hora_cita, km_recorridos, duracion_servicio')
      .gte('fecha_hora_cita', startDate.toISOString())
      .lte('fecha_hora_cita', endDate.toISOString());

    if (serviciosError) throw serviciosError;
    
    // Procesar servicios por tipo (Foraneo, Local o Reparto)
    const serviciosPorTipo = procesarServiciosPorTipo(serviciosData || []);

    // Calcular kilómetros totales directamente de los datos de servicios
    let kmTotales = 0;
    if (serviciosData && serviciosData.length > 0) {
      kmTotales = serviciosData.reduce((total, servicio) => {
        const km = getValidNumberOrZero(servicio.km_recorridos);
        return total + km;
      }, 0);
    }

    console.log("Calculando KM totales desde servicios:", {
      kmTotalesCalculados: kmTotales,
      numServicios: serviciosData?.length || 0,
      muestraServicios: serviciosData?.slice(0, 3).map(s => ({
        id: s.id,
        km: s.km_recorridos
      }))
    });

    // Calcular cambios porcentuales
    const metrics = generalMetrics?.[0] || {};
    
    // Log métricas generales para depurar
    console.log("General metrics received:", metrics);
    
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
    
    // Calcular km promedio del mes actual y anterior
    const kmPromedioMesActual = getValidNumberOrZero(metrics.km_promedio_mes_actual);
    const kmPromedioMesAnterior = getValidNumberOrZero(metrics.km_promedio_mes_anterior);
    
    console.log("KM promedio values:", {
      mesActual: kmPromedioMesActual,
      mesAnterior: kmPromedioMesAnterior,
      original: {
        mesActual: metrics.km_promedio_mes_actual,
        mesAnterior: metrics.km_promedio_mes_anterior
      }
    });
    
    const kmPromedioMoM = {
      current: kmPromedioMesActual,
      previous: kmPromedioMesAnterior,
      percentChange: calcularPorcentajeCambio(kmPromedioMesActual, kmPromedioMesAnterior)
    };

    return {
      totalServicios: metrics.total_servicios || 0,
      serviciosMoM,
      serviciosWoW,
      kmTotales: kmTotales, // Utilizar los kilómetros calculados directamente de los datos de servicios
      kmPromedioMoM,
      clientesActivos: metrics.clientes_activos || 0,
      clientesNuevos: metrics.clientes_nuevos || 0,
      alertas: alertas || [],
      serviciosPorCliente: clientesData || [],
      serviciosPorTipo,
      serviciosData: serviciosData || []
    };
  } catch (error) {
    console.error("Error fetching servicios data:", error);
    // En caso de error, devolver datos simulados
    return getMockServiciosData(dateRange);
  }
}

/**
 * Procesa los servicios y los clasifica en categorías simplificadas
 */
function procesarServiciosPorTipo(servicios: any[]): { tipo: string; count: number }[] {
  const tipoMap: Record<string, number> = {
    "Foráneo": 0,
    "Local": 0,
    "Reparto": 0
  };
  
  servicios.forEach(servicio => {
    // Normalizar a minúsculas y eliminar acentos para hacer coincidencias más robustas
    const localForaneo = servicio.local_foraneo 
      ? servicio.local_foraneo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      : '';
    
    const tipoServicio = servicio.tipo_servicio 
      ? servicio.tipo_servicio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      : '';
    
    if (localForaneo.includes('foraneo') || tipoServicio.includes('foraneo')) {
      tipoMap["Foráneo"]++;
    } else if (localForaneo.includes('local') || tipoServicio.includes('local')) {
      tipoMap["Local"]++;
    } else if (tipoServicio.includes('reparto') || tipoServicio.includes('distribucion')) {
      tipoMap["Reparto"]++;
    } else {
      // Asignación por defecto a la categoría más común
      tipoMap["Local"]++;
    }
  });
  
  // Convertir a array de objetos y filtrar categorías vacías
  return Object.entries(tipoMap)
    .filter(([_, count]) => count > 0)
    .map(([tipo, count]) => ({ tipo, count }))
    .sort((a, b) => b.count - a.count);
}
