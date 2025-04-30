
import { useMemo } from 'react';
import { ClienteServicios } from '../../services/servicios';

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
      console.log(`Client: ${cliente.nombre_cliente}, Services: ${filteredCount}`);
      
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
      
      console.log(`Client ${cliente.nombre_cliente} - Total KM: ${totalKm}, Avg KM: ${avgKm}`);

      // DETAILED DEBUG FOR AOV CALCULATION
      console.log(`------- AOV Debug for ${cliente.nombre_cliente} -------`);
      
      // Get distinct service IDs to avoid counting duplicates
      const distinctServiceIds = new Set();
      filteredClientServices.forEach(s => {
        if (s.id_servicio) distinctServiceIds.add(s.id_servicio);
      });
      
      console.log(`Distinct service IDs: ${distinctServiceIds.size}`);
      
      // Debug log each service's cobro_cliente value
      const serviceValues = filteredClientServices.map(s => ({
        id: s.id,
        id_servicio: s.id_servicio,
        cobro_cliente: s.cobro_cliente,
        cobro_cliente_type: typeof s.cobro_cliente
      }));
      
      console.log("Service values:", JSON.stringify(serviceValues, null, 2));
      
      // Calculate AOV (Average Order Value) - Sum of cobro_cliente values
      let totalCobro = 0;
      let validCobroCount = 0;
      let debugValues = [];
      
      filteredClientServices.forEach((servicio: any) => {
        // Only process services with valid cobro_cliente values
        if (servicio.cobro_cliente !== null && servicio.cobro_cliente !== undefined) {
          // Parse the value as a number
          let cobroValue;
          let originalValue = servicio.cobro_cliente;
          
          try {
            if (typeof servicio.cobro_cliente === 'string') {
              // Handle various string formats (common in Mexico: "$1,234.56", "1.234,56", etc)
              // Remove currency symbols, spaces and commas
              const cleanValue = servicio.cobro_cliente
                .replace(/\$/g, '')  // Remove $ signs
                .replace(/,/g, '')   // Remove commas
                .trim();             // Remove spaces
              
              cobroValue = parseFloat(cleanValue);
              debugValues.push({
                original: originalValue,
                cleaned: cleanValue,
                parsed: cobroValue,
                type: typeof cobroValue
              });
            } else {
              cobroValue = Number(servicio.cobro_cliente);
              debugValues.push({
                original: originalValue,
                parsed: cobroValue,
                type: typeof cobroValue
              });
            }
            
            if (!isNaN(cobroValue)) {
              totalCobro += cobroValue;
              validCobroCount++;
            }
          } catch (error) {
            console.error(`Error parsing cobro_cliente: ${servicio.cobro_cliente}`, error);
          }
        }
      });
      
      console.log("Cobro value parsing:", debugValues);
      console.log(`Total cobro: ${totalCobro}, Valid count: ${validCobroCount}`);
      
      // Use the number of distinct service IDs for the calculation
      const distinctCount = distinctServiceIds.size || filteredCount;
      console.log(`Using count for division: ${distinctCount}`);
      
      const avgCobro = distinctCount > 0 ? totalCobro / distinctCount : 0;
      console.log(`Final AOV: ${avgCobro}`);
      console.log("----------------------------------------");
      
      return {
        ...cliente,
        totalServicios: filteredCount,
        kmPromedio: avgKm, // Override with our recalculated value
        costoPromedio: avgCobro // AOV calculation
      };
    });
    
    console.log("Final filtered client count:", activeClientes.length);
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
