
import { getValidNumberOrZero, calculateAverage, calcularPorcentajeCambio } from "../utils";
import { ServiciosMetricData, ComparisonMetric } from "../types";

/**
 * Processes raw servicios data into metrics for the dashboard
 */
export function processServiciosMetrics(data: any): ServiciosMetricData {
  const { 
    generalMetrics, 
    alertas, 
    clientesData, 
    serviciosData, 
    serviciosMesActual, 
    serviciosMesAnterior, 
    serviciosPorTipo 
  } = data;
  
  // Log status values to troubleshoot filtering
  if (serviciosData && serviciosData.length > 0) {
    const statusCounts: Record<string, number> = {};
    const statusSamples: Record<string, any> = {};
    
    serviciosData.forEach((servicio: any, idx: number) => {
      const status = servicio.estado || 'undefined';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Store a sample of each status type
      if (!statusSamples[status]) {
        statusSamples[status] = { ...servicio };
      }
    });
    
    console.log("Status distribution in data:", statusCounts);
    console.log("Status samples:", statusSamples);
  }
  
  // Calculate total KM - prefer km_teorico, fallback to km_recorridos
  let kmTotales = 0;
  
  if (serviciosData && serviciosData.length > 0) {
    serviciosData.forEach((servicio: any) => {
      const km = getValidNumberOrZero(servicio.km_teorico || servicio.km_recorridos);
      kmTotales += km;
    });
  }

  // Extract KM values for average calculations
  const kmMesActualValues = serviciosMesActual?.map((s: any) => 
    getValidNumberOrZero(s.km_teorico || s.km_recorridos)) || [];
    
  const kmMesAnteriorValues = serviciosMesAnterior?.map((s: any) => 
    getValidNumberOrZero(s.km_teorico || s.km_recorridos)) || [];
  
  // Calculate average KM per month
  const kmPromedioMesActual = calculateAverage(kmMesActualValues);
  const kmPromedioMesAnterior = calculateAverage(kmMesAnteriorValues);

  // Calculate percentage changes
  const metrics = generalMetrics;
  
  const serviciosMoM: ComparisonMetric = {
    current: metrics.servicios_mes_actual || 0,
    previous: metrics.servicios_mes_anterior || 0,
    percentChange: calcularPorcentajeCambio(
      metrics.servicios_mes_actual || 0, 
      metrics.servicios_mes_anterior || 0
    )
  };
  
  const serviciosWoW: ComparisonMetric = {
    current: metrics.servicios_semana_actual || 0,
    previous: metrics.servicios_semana_anterior || 0,
    percentChange: calcularPorcentajeCambio(
      metrics.servicios_semana_actual || 0, 
      metrics.servicios_semana_anterior || 0
    )
  };
  
  // Calculate percentage change for average KM
  const kmPromedioMoM: ComparisonMetric = {
    current: kmPromedioMesActual,
    previous: kmPromedioMesAnterior,
    percentChange: calcularPorcentajeCambio(kmPromedioMesActual, kmPromedioMesAnterior)
  };

  // Assemble the result object
  const result: ServiciosMetricData = {
    totalServicios: metrics.total_servicios || 0,
    serviciosMoM,
    serviciosWoW,
    kmTotales,
    kmPromedioMoM,
    clientesActivos: metrics.clientes_activos || 0,
    clientesNuevos: metrics.clientes_nuevos || 0,
    alertas: alertas || [],
    serviciosPorCliente: clientesData || [],
    serviciosPorTipo: serviciosPorTipo || [],
    serviciosData: serviciosData || []
  };
  
  return result;
}
