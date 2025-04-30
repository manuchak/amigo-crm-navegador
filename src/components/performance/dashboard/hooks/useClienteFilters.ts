
import { useMemo } from 'react';
import { ClienteServicios } from '../../services/servicios';
import { parseCurrencyValue } from '../../services/servicios/utils';

export function useClienteFilters(
  serviciosPorCliente: any[] | undefined, 
  serviciosData: any[] | undefined,
  filteredData: any[]
) {
  // Filter client data by status
  const filteredClientesData = useMemo(() => {
    if (!serviciosPorCliente || !serviciosData || !filteredData) return [];
    
    // Get the IDs of filtered services
    const filteredIds = new Set(filteredData.map((item: any) => item.id));
    
    console.log("Starting client filtering - filtered services count:", filteredIds.size);

    // Data integrity check - log raw cobro_cliente values to help diagnose issues
    console.log("Sampling cobro_cliente values to diagnose formatting issues:");
    const sampleSize = Math.min(10, serviciosData.length);
    const samples = serviciosData.slice(0, sampleSize);
    samples.forEach((s, i) => {
      console.log(`Sample ${i+1}: cobro_cliente="${s.cobro_cliente}", type=${typeof s.cobro_cliente}`);
    });
    
    // Only return clients that have services in the filtered set
    const activeClientes = serviciosPorCliente.filter(cliente => {
      // Find services for this client in the raw data
      const clientServices = serviciosData.filter(
        (servicio: any) => servicio.nombre_cliente === cliente.nombre_cliente
      );
      
      // Check if any of these services are in our filtered set
      return clientServices.some((servicio: any) => filteredIds.has(servicio.id));
    }).map(cliente => {
      // Count only services that match our filter for this client
      const filteredClientServices = serviciosData.filter(
        (servicio: any) => 
          servicio.nombre_cliente === cliente.nombre_cliente && 
          filteredIds.has(servicio.id)
      );
      
      const filteredCount = filteredClientServices.length;
      
      // Calculate average KM for filtered services, prioritizing km_teorico over km_recorridos
      let totalKm = 0;
      filteredClientServices.forEach((servicio: any) => {
        // Prioritize km_teorico over km_recorridos
        const kmValue = servicio.km_teorico !== null && servicio.km_teorico !== undefined ? 
          servicio.km_teorico : 
          (servicio.km_recorridos || 0);
        totalKm += Number(kmValue);
      });
      
      // Round to 2 decimal places
      const avgKm = filteredClientServices.length > 0 ? 
        Number((totalKm / filteredClientServices.length).toFixed(2)) : 0;

      // Log cliente details to help with debugging
      console.log(`Processing client ${cliente.nombre_cliente} with ${filteredClientServices.length} services`);
      
      // Track total valid amount and count for averaging
      let totalAmount = 0;
      let validServiceCount = 0;
      let rawValuesSample = [];
      
      // Process each service to calculate total amount
      filteredClientServices.forEach((servicio, idx) => {
        // Extract cobro_cliente (revenue/AOV value)
        const rawValue = servicio.cobro_cliente;
        
        // Debug: Collect raw values for first few services to understand the issue
        if (idx < 5) {
          rawValuesSample.push({
            id: servicio.id,
            rawValue,
            type: typeof rawValue
          });
        }
        
        // Skip services with no cobro_cliente value
        if (rawValue === null || rawValue === undefined || rawValue === '') {
          return;
        }
        
        // Parse the value (our enhanced parser handles various formats)
        const amount = parseCurrencyValue(rawValue);
        
        if (amount > 0) {
          totalAmount += amount;
          validServiceCount++;
          
          // Log some samples for debugging
          if (idx < 3) {
            console.log(`Service ${servicio.id}: Raw cobro_cliente "${rawValue}" → Parsed: ${amount}`);
          }
        }
      });
      
      // Log the sample of raw values to understand what we're dealing with
      if (rawValuesSample.length > 0) {
        console.log(`${cliente.nombre_cliente} cobro_cliente samples:`, rawValuesSample);
      }
      
      // Calculate the average
      let avgCost = 0;
      
      if (validServiceCount > 0) {
        avgCost = totalAmount / validServiceCount;
        console.log(`${cliente.nombre_cliente}: AOV calculation: ${totalAmount} ÷ ${validServiceCount} services = ${avgCost}`);
      } else {
        console.log(`${cliente.nombre_cliente}: No valid cobro_cliente values found`);
      }
      
      // Add trend info based on client metrics
      const serviciosTrend = filteredCount > 50 ? 'up' : (filteredCount > 20 ? 'neutral' : 'down');
      const kmTrend = avgKm > 200 ? 'up' : (avgKm > 100 ? 'neutral' : 'down');
      const costTrend = avgCost > 5000 ? 'up' : (avgCost > 1000 ? 'neutral' : 'down');
      
      return {
        ...cliente,
        totalServicios: filteredCount,
        kmPromedio: avgKm,
        costoPromedio: avgCost, // Store the raw numeric value
        serviciosTrend,
        kmTrend,
        costTrend
      };
    });
    
    console.log("Final filtered client count:", activeClientes.length);
    
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
