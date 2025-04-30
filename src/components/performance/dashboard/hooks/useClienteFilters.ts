
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

      // ========== IMPROVED AOV CALCULATION ==========
      // 1. Track unique services and total charges
      let totalCobroCliente = 0;
      const processedServiceIds = new Set();
      let validCobroCount = 0;
      
      console.log(`Processing AOV for client: ${cliente.nombre_cliente} with ${filteredClientServices.length} services`);
      
      filteredClientServices.forEach((servicio: any) => {
        // Skip duplicates if we have service IDs
        if (servicio.id_servicio && processedServiceIds.has(servicio.id_servicio)) {
          return;
        }
        
        // Add to processed set if it has an ID
        if (servicio.id_servicio) {
          processedServiceIds.add(servicio.id_servicio);
        }
        
        // Extract and parse the cobro_cliente value
        if (servicio.cobro_cliente !== null && servicio.cobro_cliente !== undefined) {
          // Use our enhanced parsing function
          const cobroValue = parseCurrencyValue(servicio.cobro_cliente);
          
          // Debug logging
          if (typeof servicio.cobro_cliente === 'string') {
            console.log(`Parsed string value "${servicio.cobro_cliente}" to: ${cobroValue}`);
          } else {
            console.log(`Parsed value type ${typeof servicio.cobro_cliente} to: ${cobroValue}`);
          }
          
          // Only count if we got a valid value
          if (cobroValue > 0) {
            totalCobroCliente += cobroValue;
            validCobroCount++;
            console.log(`Added ${cobroValue} to total, now: ${totalCobroCliente}`);
          }
        }
      });
      
      // Calculate AOV using the appropriate divisor
      let avgCobro = 0;
      if (validCobroCount > 0) {
        // If we have valid cobro values, use that count
        avgCobro = totalCobroCliente / validCobroCount;
        console.log(`Calculated AOV using ${validCobroCount} valid values: ${avgCobro}`);
      } else if (processedServiceIds.size > 0) {
        // If we have unique service IDs but no cobro values, use that count
        avgCobro = totalCobroCliente / processedServiceIds.size;
        console.log(`Calculated AOV using ${processedServiceIds.size} unique services: ${avgCobro}`);
      } else if (filteredCount > 0) {
        // Last resort - use the total filtered count
        avgCobro = totalCobroCliente / filteredCount;
        console.log(`Calculated AOV using ${filteredCount} total services: ${avgCobro}`);
      }
      
      // Debug final calculation - this is important
      console.log(`Final AOV for ${cliente.nombre_cliente}: ${avgCobro} (${totalCobroCliente} / divisor)`);
      
      // Add trend info based on client metrics
      const serviciosTrend = filteredCount > 50 ? 'up' : (filteredCount > 20 ? 'neutral' : 'down');
      const kmTrend = avgKm > 200 ? 'up' : (avgKm > 100 ? 'neutral' : 'down');
      const costTrend = avgCobro > 5000 ? 'up' : (avgCobro > 1000 ? 'neutral' : 'down');
      
      return {
        ...cliente,
        totalServicios: filteredCount,
        kmPromedio: avgKm,
        costoPromedio: Number(avgCobro.toFixed(1)), // Format to 1 decimal place as requested
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
