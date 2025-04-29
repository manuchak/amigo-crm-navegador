
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
  // Important debugging for date range issues
  console.log("fetchServiciosData called with date range:", {
    from: dateRange?.from ? dateRange.from.toISOString() : 'undefined',
    to: dateRange?.to ? dateRange.to.toISOString() : 'undefined'
  });

  try {
    // Only use mock data if explicitly in development mode without any date range
    const useMockData = process.env.NODE_ENV === 'development' && 
                      (!dateRange || !dateRange.from || !dateRange.to);
    
    if (useMockData) {
      console.log("Using mock data because no date range provided in development mode");
      return getMockServiciosData(dateRange);
    }
    
    // Ensure we have valid date ranges
    const endDate = dateRange?.to || new Date();
    const startDate = dateRange?.from || subMonths(endDate, 3);
    
    console.log("Using real data with date range:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
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

    if (generalError) {
      console.error("Error fetching general metrics:", generalError);
      throw generalError;
    }

    // 2. Obtener alertas de clientes con variaciones significativas
    const { data: alertas, error: alertasError } = await supabase
      .rpc('obtener_alertas_clientes', {
        mes_actual_inicio: currentMonthStart.toISOString(),
        mes_actual_fin: currentMonthEnd.toISOString(),
        mes_anterior_inicio: previousMonthStart.toISOString(),
        mes_anterior_fin: previousMonthEnd.toISOString(),
        umbral_variacion: 20 // Alerta cuando hay incremento de 20% o más
      });

    if (alertasError) {
      console.error("Error fetching alerts:", alertasError);
      throw alertasError;
    }

    // 3. Obtener datos de servicios por cliente
    const { data: clientesData, error: clientesError } = await supabase
      .rpc('obtener_servicios_por_cliente', {
        fecha_inicio: startDate.toISOString(),
        fecha_fin: endDate.toISOString()
      });

    if (clientesError) {
      console.error("Error fetching client data:", clientesError);
      throw clientesError;
    }
    
    // 4. Obtener servicios por tipo y datos crudos de servicios
    const { data: serviciosData, error: serviciosError } = await supabase
      .from('servicios_custodia')
      .select('id, local_foraneo, tipo_servicio, fecha_hora_cita, km_recorridos, km_teorico, duracion_servicio, nombre_cliente')
      .gte('fecha_hora_cita', startDate.toISOString())
      .lte('fecha_hora_cita', endDate.toISOString());

    if (serviciosError) {
      console.error("Error fetching services data:", serviciosError);
      throw serviciosError;
    }

    console.log(`Fetched ${serviciosData?.length || 0} services from database`);
    if (serviciosData && serviciosData.length > 0) {
      // Log a sample of the data to verify date formats and April data
      const sample = serviciosData.slice(0, 5);
      console.log("Sample service dates:", sample.map(s => ({
        id: s.id,
        fecha: s.fecha_hora_cita,
        month: s.fecha_hora_cita ? new Date(s.fecha_hora_cita).getMonth() + 1 : 'unknown'
      })));
      
      // Check specifically for April data
      const aprilData = serviciosData.filter(s => {
        if (!s.fecha_hora_cita) return false;
        const date = new Date(s.fecha_hora_cita);
        return date.getMonth() === 3; // April is month 3 (0-indexed)
      });
      
      console.log(`Found ${aprilData.length} services in April`);
    }

    // 5. Obtener datos específicos del mes actual para comparación
    const { data: serviciosMesActual, error: mesActualError } = await supabase
      .from('servicios_custodia')
      .select('km_recorridos, km_teorico')
      .gte('fecha_hora_cita', currentMonthStart.toISOString())
      .lte('fecha_hora_cita', currentMonthEnd.toISOString());
      
    if (mesActualError) {
      console.error("Error fetching current month data:", mesActualError);
      throw mesActualError;
    }
      
    // 6. Obtener datos específicos del mes anterior para comparación
    const { data: serviciosMesAnterior, error: mesAnteriorError } = await supabase
      .from('servicios_custodia')
      .select('km_recorridos, km_teorico')
      .gte('fecha_hora_cita', previousMonthStart.toISOString())
      .lte('fecha_hora_cita', previousMonthEnd.toISOString());
      
    if (mesAnteriorError) {
      console.error("Error fetching previous month data:", mesAnteriorError);
      throw mesAnteriorError;
    }
    
    // Calculate KM totales using km_teorico instead of km_recorridos
    let kmTotales = 0;
    
    if (serviciosData && serviciosData.length > 0) {
      let validKmCount = 0;
      serviciosData.forEach(servicio => {
        // Use km_teorico or fallback to km_recorridos if teorico is not available
        const km = getValidNumberOrZero(servicio.km_teorico || servicio.km_recorridos);
        if (km > 0) {
          validKmCount++;
        }
        kmTotales += km;
      });

      console.log("KM calculation:", {
        kmTotales,
        totalServices: serviciosData.length,
        servicesWithValidKm: validKmCount
      });
    }

    // Extraer valores de km para cálculos de promedios
    const kmMesActualValues = serviciosMesActual?.map(s => getValidNumberOrZero(s.km_teorico || s.km_recorridos)) || [];
    const kmMesAnteriorValues = serviciosMesAnterior?.map(s => getValidNumberOrZero(s.km_teorico || s.km_recorridos)) || [];
    
    // Calcular promedios de KM por mes
    const kmPromedioMesActual = calculateAverage(kmMesActualValues);
    const kmPromedioMesAnterior = calculateAverage(kmMesAnteriorValues);
    
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

    const result = {
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
    
    console.log("Successfully processed real data from Supabase");
    return result;
  } catch (error) {
    console.error("Error fetching servicios data:", error);
    console.warn("Falling back to mock data due to error");
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
