
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";

export async function fetchServiciosData(dateRange?: DateRange, comparisonRange?: DateRange) {
  // Return mock data for now
  // In a real implementation, this would fetch data from the API filtered by date range
  return getMockServiciosData(dateRange);
}

// Mock data generator
function getMockServiciosData(dateRange?: DateRange) {
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
  
  return data;
}
