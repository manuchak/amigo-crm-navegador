
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ServiciosMetricData } from "../types";

/**
 * Core data fetching logic for servicios data
 */
export async function fetchServiciosRawData(dateRange: DateRange) {
  if (!dateRange || !dateRange.from || !dateRange.to) {
    throw new Error('Invalid date range provided');
  }
  
  // Use provided date range
  const endDate = dateRange.to;
  const startDate = dateRange.from;
  
  console.log("Fetching real data with date range:", {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  
  // Calculate time ranges for comparisons
  const currentMonthStart = startOfMonth(endDate);
  const currentMonthEnd = endOfMonth(endDate);
  const previousMonthStart = startOfMonth(new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1));
  const previousMonthEnd = endOfMonth(new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - 1));
  
  const currentWeekStart = startOfWeek(endDate, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(endDate, { weekStartsOn: 1 });
  const previousWeekStart = startOfWeek(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });
  const previousWeekEnd = endOfWeek(new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });

  // 1. Get general metrics using database function
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

  // 2. Get client alerts using database function
  const { data: alertas, error: alertasError } = await supabase
    .rpc('obtener_alertas_clientes', {
      mes_actual_inicio: currentMonthStart.toISOString(),
      mes_actual_fin: currentMonthEnd.toISOString(),
      mes_anterior_inicio: previousMonthStart.toISOString(),
      mes_anterior_fin: previousMonthEnd.toISOString(),
      umbral_variacion: 20 // Alert on 20%+ increase
    });

  if (alertasError) {
    console.error("Error fetching alerts:", alertasError);
    throw alertasError;
  }

  // 3. Get services by client using database function
  const { data: clientesData, error: clientesError } = await supabase
    .rpc('obtener_servicios_por_cliente', {
      fecha_inicio: startDate.toISOString(),
      fecha_fin: endDate.toISOString()
    });

  if (clientesError) {
    console.error("Error fetching client data:", clientesError);
    throw clientesError;
  }
  
  // 4. Get services by type and raw service data
  const { data: serviciosData, error: serviciosError } = await supabase
    .from('servicios_custodia')
    .select(`
      id, 
      local_foraneo, 
      tipo_servicio, 
      fecha_hora_cita, 
      km_recorridos, 
      km_teorico, 
      duracion_servicio, 
      nombre_cliente,
      ruta,
      origen,
      destino,
      tipo_gadget,
      placa_carga,
      tipo_unidad,
      estado
    `)
    .gte('fecha_hora_cita', startDate.toISOString())
    .lte('fecha_hora_cita', endDate.toISOString());

  if (serviciosError) {
    console.error("Error fetching services data:", serviciosError);
    throw serviciosError;
  }

  // 5. Get specific data for current month for comparison
  const { data: serviciosMesActual, error: mesActualError } = await supabase
    .from('servicios_custodia')
    .select('km_recorridos, km_teorico')
    .gte('fecha_hora_cita', currentMonthStart.toISOString())
    .lte('fecha_hora_cita', currentMonthEnd.toISOString());
    
  if (mesActualError) {
    console.error("Error fetching current month data:", mesActualError);
    throw mesActualError;
  }
    
  // 6. Get specific data for previous month for comparison
  const { data: serviciosMesAnterior, error: mesAnteriorError } = await supabase
    .from('servicios_custodia')
    .select('km_recorridos, km_teorico')
    .gte('fecha_hora_cita', previousMonthStart.toISOString())
    .lte('fecha_hora_cita', previousMonthEnd.toISOString());
    
  if (mesAnteriorError) {
    console.error("Error fetching previous month data:", mesAnteriorError);
    throw mesAnteriorError;
  }
  
  // Get services by type from database function
  const { data: serviciosPorTipo, error: tiposError } = await supabase
    .rpc('obtener_servicios_por_tipo', {
      fecha_inicio: startDate.toISOString(),
      fecha_fin: endDate.toISOString()
    });

  if (tiposError) {
    console.error("Error fetching service types:", tiposError);
    throw tiposError;
  }

  return {
    generalMetrics: generalMetrics?.[0] || {},
    alertas,
    clientesData,
    serviciosData,
    serviciosMesActual,
    serviciosMesAnterior,
    serviciosPorTipo
  };
}
