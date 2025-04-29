
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ServiciosMetricData } from "./types";
import { calcularPorcentajeCambio, getValidNumberOrZero, calculateAverage } from "./utils";
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
      endDate: endDate.toISOString(),
      currentMonth: {start: currentMonthStart.toISOString(), end: currentMonthEnd.toISOString()},
      previousMonth: {start: previousMonthStart.toISOString(), end: previousMonthEnd.toISOString()}
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
      .select('id, local_foraneo, tipo_servicio, fecha_hora_cita, km_recorridos, duracion_servicio, nombre_cliente')
      .gte('fecha_hora_cita', startDate.toISOString())
      .lte('fecha_hora_cita', endDate.toISOString());

    if (serviciosError) throw serviciosError;

    // 5. Obtener datos específicos del mes actual para comparación
    const { data: serviciosMesActual, error: mesActualError } = await supabase
      .from('servicios_custodia')
      .select('km_recorridos')
      .gte('fecha_hora_cita', currentMonthStart.toISOString())
      .lte('fecha_hora_cita', currentMonthEnd.toISOString());
      
    if (mesActualError) throw mesActualError;
      
    // 6. Obtener datos específicos del mes anterior para comparación
    const { data: serviciosMesAnterior, error: mesAnteriorError } = await supabase
      .from('servicios_custodia')
      .select('km_recorridos')
      .gte('fecha_hora_cita', previousMonthStart.toISOString())
      .lte('fecha_hora_cita', previousMonthEnd.toISOString());
      
    if (mesAnteriorError) throw mesAnteriorError;
    
    // Calcular kilómetros totales directamente de los datos de servicios para el período completo
    let kmTotales = 0;
    const kmValues = [];
    if (serviciosData && serviciosData.length > 0) {
      serviciosData.forEach(servicio => {
        const km = getValidNumberOrZero(servicio.km_recorridos);
        kmTotales += km;
        kmValues.push(km);
      });
    }

    // Extraer valores de km para cálculos de promedios
    const kmMesActualValues = serviciosMesActual?.map(s => getValidNumberOrZero(s.km_recorridos)) || [];
    const kmMesAnteriorValues = serviciosMesAnterior?.map(s => getValidNumberOrZero(s.km_recorridos)) || [];
    
    // Calcular promedios de KM por mes
    const kmPromedioMesActual = calculateAverage(kmMesActualValues);
    const kmPromedioMesAnterior = calculateAverage(kmMesAnteriorValues);
    
    console.log("Detailed KM calculations:", {
      kmTotales,
      totalServices: serviciosData?.length || 0,
      kmPromedioMesActual,
      kmPromedioMesAnterior,
      kmMesActualLength: kmMesActualValues.length,
      kmMesAnteriorLength: kmMesAnteriorValues.length,
      sampleKmValues: kmValues.slice(0, 5) // First few values for debugging
    });
    
    // Procesar servicios por tipo (Foraneo, Local o Reparto)
    const serviciosPorTipo = procesarServiciosPorTipo(serviciosData || []);

    // Calcular cambios porcentuales
    const metrics = generalMetrics?.[0] || {};
    
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
    
    // Calcular cambio porcentual para KM promedio
    const kmPercentChange = calcularPorcentajeCambio(kmPromedioMesActual, kmPromedioMesAnterior);
    
    const kmPromedioMoM = {
      current: kmPromedioMesActual,
      previous: kmPromedioMesAnterior,
      percentChange: kmPercentChange
    };

    return {
      totalServicios: metrics.total_servicios || 0,
      serviciosMoM,
      serviciosWoW,
      kmTotales,
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
    
    // Clasificar el servicio según palabras clave
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
    .map(([tipo, count]) => ({ tipo, count }))
    .sort((a, b) => b.count - a.count);
}
