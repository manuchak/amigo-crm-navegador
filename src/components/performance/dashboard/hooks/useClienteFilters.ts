
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

      // ========== COMPLETELY REWRITTEN AOV CALCULATION ==========
      console.log(`\n===== CALCULATING AOV FOR ${cliente.nombre_cliente} =====`);
      
      // Track total valid amount and count for averaging
      let totalAmount = 0;
      let validServiceCount = 0;
      
      // Debug: Show some sample services
      const sampleServices = filteredClientServices.slice(0, 3);
      console.log(`Sample services (up to 3 of ${filteredClientServices.length} total):`);
      sampleServices.forEach((s, idx) => {
        console.log(`Sample ${idx+1}:`, {
          id: s.id,
          cobro_cliente: s.cobro_cliente,
          cobro_type: typeof s.cobro_cliente
        });
      });
      
      // Process each service to calculate total amount
      filteredClientServices.forEach((servicio, idx) => {
        // Extract cobro_cliente (revenue/AOV value)
        const rawValue = servicio.cobro_cliente;
        
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
          if (idx < 5) {
            console.log(`Service ${servicio.id}: Raw value "${rawValue}" → Parsed: ${amount}`);
          }
        }
      });
      
      // Calculate the average
      let avgCost = 0;
      
      if (validServiceCount > 0) {
        avgCost = totalAmount / validServiceCount;
        console.log(`Final calculation: ${totalAmount} ÷ ${validServiceCount} services = ${avgCost}`);
      } else {
        console.log(`No valid cobro_cliente values found for ${cliente.nombre_cliente}`);
      }
      
      console.log(`===== END AOV CALCULATION =====\n`);
      
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
    
    // Additional debug: Show final AOV values for all clients
    console.log("Final AOV values for all clients:");
    activeClientes.forEach(cliente => {
      console.log(`${cliente.nombre_cliente}: ${cliente.costoPromedio}`);
    });
    
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
