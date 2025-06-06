
import { DateRange } from "react-day-picker";
import { ServiciosMetricData } from "./types";
import { calculateAverage } from "./utils";

/**
 * Generates mock service data for development or fallback purposes
 * @param dateRange Optional date range for filtering
 * @returns ServiciosMetricData with mock values
 */
export function getMockServiciosData(dateRange?: DateRange): ServiciosMetricData {
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
  
  // Calculate total KM for the mock dataset
  let totalKm = 0;
  const kmValues = [];
  
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
    
    totalKm += km;
    kmValues.push(km);
    
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
  
  // Calculate average KM
  const avgKm = calculateAverage(kmValues);
  
  console.log("Mock data KM values:", {
    totalKm,
    avgKm,
    mockItemCount: count,
    kmValues: kmValues.slice(0, 5) // Log first few values for debugging
  });
  
  // Previous month data for comparison
  const prevMonthAvgKm = Math.max(30, avgKm - (Math.random() * 20 - 10));
  const kmPromedioPercentChange = ((avgKm - prevMonthAvgKm) / prevMonthAvgKm * 100).toFixed(1);
  
  return {
    totalServicios: count,
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
    kmTotales: totalKm,
    kmPromedioMoM: {
      current: avgKm, // Use the calculated average KM
      previous: prevMonthAvgKm,
      percentChange: Number(kmPromedioPercentChange)
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
      { tipo: "Foráneo", count: Math.floor(Math.random() * 50) + 30 },
      { tipo: "Local", count: Math.floor(Math.random() * 40) + 20 },
      { tipo: "Reparto", count: Math.floor(Math.random() * 30) + 15 }
    ],
    serviciosData: data
  };
}
