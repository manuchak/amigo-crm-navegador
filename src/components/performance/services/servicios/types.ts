
import { DateRange } from "react-day-picker";

export interface ServiciosMetricData {
  totalServicios: number;
  serviciosMoM: ComparisonMetric;
  serviciosWoW: ComparisonMetric;
  kmTotales: number;
  kmPromedioMoM: ComparisonMetric;
  clientesActivos: number;
  clientesNuevos: number;
  alertas: ClienteAlerta[];
  serviciosPorCliente: ClienteServicios[];
  serviciosPorTipo: { tipo: string; count: number }[];
  serviciosData: any[]; // Raw services data for charts
}

export interface ComparisonMetric {
  current: number;
  previous: number;
  percentChange: number;
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
  serviciosTrend?: 'up' | 'down' | 'neutral';
  kmTrend?: 'up' | 'down' | 'neutral';
  costTrend?: 'up' | 'down' | 'neutral';
}
