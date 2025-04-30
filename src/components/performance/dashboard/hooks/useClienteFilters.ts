
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

      // Calculate AOV (Average Order Value) from cobro_cliente values
      let totalCobro = 0;
      
      // Get distinct service IDs to avoid counting duplicates
      const uniqueServices = new Map();
      
      // Track raw values for debugging
      const rawValues = [];
      
      filteredClientServices.forEach((servicio: any) => {
        // Skip if we've already counted this service ID
        if (servicio.id_servicio && uniqueServices.has(servicio.id_servicio)) return;
        if (servicio.id_servicio) uniqueServices.set(servicio.id_servicio, true);
        
        // Process cobro_cliente value
        if (servicio.cobro_cliente !== null && servicio.cobro_cliente !== undefined) {
          let cobroValue = 0;
          
          // Store raw value for debugging
          rawValues.push({
            id: servicio.id,
            raw: servicio.cobro_cliente,
            type: typeof servicio.cobro_cliente
          });
          
          try {
            // Handle different data types
            if (typeof servicio.cobro_cliente === 'number') {
              cobroValue = servicio.cobro_cliente;
            } else if (typeof servicio.cobro_cliente === 'string') {
              // Clean up the string value (remove currency symbols, spaces, commas)
              // Handle Mexican currency format which might use commas as decimal separators
              const cleanVal = servicio.cobro_cliente
                .replace(/\$/g, '') // Remove dollar signs
                .replace(/\s/g, '') // Remove spaces
                .replace(/,/g, '.'); // Replace commas with periods for decimal
              
              cobroValue = parseFloat(cleanVal);
            }
            
            // Only add valid numbers
            if (!isNaN(cobroValue)) {
              totalCobro += cobroValue;
            }
          } catch (err) {
            console.error(`Error parsing cobro_cliente value for ${servicio.id}:`, err);
          }
        }
      });
      
      // For debugging
      console.log(`${cliente.nombre_cliente} - Raw cobro_cliente values:`, rawValues);
      console.log(`${cliente.nombre_cliente} - Total cobro: ${totalCobro}, Unique services: ${uniqueServices.size}`);
      
      // Calculate average - use unique service count or filtered count if no unique IDs
      const serviceCount = uniqueServices.size > 0 ? uniqueServices.size : filteredCount;
      const avgCobro = serviceCount > 0 ? totalCobro / serviceCount : 0;
      
      console.log(`${cliente.nombre_cliente} - Final AOV calculation: ${totalCobro} / ${serviceCount} = ${avgCobro}`);
      
      return {
        ...cliente,
        totalServicios: filteredCount,
        kmPromedio: avgKm,
        costoPromedio: Number(avgCobro.toFixed(1)) // Format to 1 decimal place as requested
      };
    });
    
    console.log("Final filtered client count:", activeClientes.length);
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
