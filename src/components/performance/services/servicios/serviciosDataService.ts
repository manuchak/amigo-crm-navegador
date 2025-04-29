import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export interface ServiciosMetricData {
  totalServicios: number;
  serviciosMoM: {
    current: number;
    previous: number;
    percentChange: number;
  };
  serviciosWoW: {
    current: number;
    previous: number;
    percentChange: number;
  };
  kmTotales: number;
  kmPromedioMoM: {
    current: number;
    previous: number;
    percentChange: number;
  };
  clientesActivos: number;
  clientesNuevos: number;
  alertas: ClienteAlerta[];
  serviciosPorCliente: ClienteServicios[];
  serviciosPorTipo: { tipo: string; count: number }[];
}

export interface ClienteAlerta {
  nombre: string;
  servicios_actual: number;
  servicios_anterior: number;
  variacion: number;
  kmPromedio: number;
  costoPromedio: number;
}

export interface ClienteServicios {
  nombre_cliente: string;
  totalServicios: number;
  kmPromedio: number;
  costoPromedio: number;
}

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

// Función para calcular el porcentaje de cambio entre dos valores
function calcularPorcentajeCambio(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return Number(((actual - anterior) / anterior * 100).toFixed(1));
}

// Mock data generator (mantenemos como fallback y para desarrollo)
function getMockServiciosData(dateRange?: DateRange): ServiciosMetricData {
  // Generate between 50-150 services
  const count = Math.floor(Math.random() * 100) + 50;
  const data = [];
  
  const today = new Date();
  const startDate = dateRange?.from || new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const endDate = dateRange?.to || today;
  
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // List of custodio names
  const custodios = [
    'Juan Pérez', 'María Rodríguez', 'Carlos López', 'Ana García', 
    'Miguel Hernández', 'Sofía Martínez', 'Roberto González', 'Laura Sánchez'
  ];
  
  for (let i = 0; i < count; i++) {
    // Generate random date within range
    const dateOffset = Math.floor(Math.random() * diffDays);
    const serviceDate = new Date(startDate);
    serviceDate.setDate(startDate.getDate() + dateOffset);
    
    // Generate random service duration (1-4 hours)
    const hours = Math.floor(Math.random() * 4) + 1;
    const minutes = Math.floor(Math.random() * 60);
    const durationStr = `${hours} hours ${minutes} minutes`;
    
    // Generate random KM (normally distributed around 100km)
    let km = Math.floor(Math.abs(Math.random() * 100 + Math.random() * 100));
    
    // Add some outliers (about 5% of the data)
    if (Math.random() < 0.05) {
      km = Math.floor(Math.random() * 1000) + 200;
    }
    
    // Random cost (between 500-1500)
    const cost = Math.floor(Math.random() * 1000) + 500;
    
    // Random custodio cost (between 250-750)
    const custodioCost = Math.floor(cost * 0.5);
    
    data.push({
      id: `serv-${i + 1}`,
      fecha_hora_cita: serviceDate.toISOString(),
      duracion_servicio: durationStr,
      km_recorridos: km,
      cobro_cliente: cost,
      costo_custodio: custodioCost,
      nombre_custodio: custodios[Math.floor(Math.random() * custodios.length)],
      estatus: Math.random() > 0.1 ? 'Completado' : 'Cancelado'
    });
  }
  // Datos simulados para el nuevo formato
  return {
    totalServicios: Math.floor(Math.random() * 100) + 150,
    serviciosMoM: {
      current: Math.floor(Math.random() * 30) + 40,
      previous: Math.floor(Math.random() * 20) + 30,
      percentChange: Math.floor(Math.random() * 30) - 10
    },
    serviciosWoW: {
      current: Math.floor(Math.random() * 10) + 8,
      previous: Math.floor(Math.random() * 10) + 5,
      percentChange: Math.floor(Math.random() * 40) - 5
    },
    kmTotales: Math.floor(Math.random() * 10000) + 5000,
    kmPromedioMoM: {
      current: Math.floor(Math.random() * 100) + 80,
      previous: Math.floor(Math.random() * 100) + 70,
      percentChange: Math.floor(Math.random() * 20) - 5
    },
    clientesActivos: Math.floor(Math.random() * 20) + 10,
    clientesNuevos: Math.floor(Math.random() * 5) + 1,
    alertas: Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
      nombre: `Cliente ${i + 1}`,
      servicios_actual: Math.floor(Math.random() * 30) + 10,
      servicios_anterior: Math.floor(Math.random() * 20) + 5,
      variacion: Math.floor(Math.random() * 50) + 20,
      kmPromedio: Math.floor(Math.random() * 100) + 50,
      costoPromedio: Math.floor(Math.random() * 5000) + 1000
    })),
    serviciosPorCliente: Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
      nombre_cliente: `Cliente ${i + 1}`,
      totalServicios: Math.floor(Math.random() * 50) + 5,
      kmPromedio: Math.floor(Math.random() * 150) + 30,
      costoPromedio: Math.floor(Math.random() * 6000) + 1000
    })),
    serviciosPorTipo: [
      { tipo: "Escolta", count: Math.floor(Math.random() * 50) + 30 },
      { tipo: "Validación", count: Math.floor(Math.random() * 40) + 20 },
      { tipo: "Local", count: Math.floor(Math.random() * 30) + 15 },
      { tipo: "Foráneo", count: Math.floor(Math.random() * 20) + 10 }
    ]
  };
}
