

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

      // IMPROVED: Calculate AOV (Average Order Value) from cobro_cliente values
      let totalCobro = 0;
      
      // Get distinct service IDs to avoid counting duplicates
      const uniqueServices = new Map();
      
      // DEBUG: Track all services and cobro values to identify issues
      console.log(`------------------------`);
      console.log(`Client: ${cliente.nombre_cliente} - Processing ${filteredClientServices.length} services`);
      
      // Counter for valid cobro values
      let validCobroCount = 0;
      
      filteredClientServices.forEach((servicio: any) => {
        // Skip if we've already counted this service ID
        if (servicio.id_servicio && uniqueServices.has(servicio.id_servicio)) {
          console.log(`Skipping duplicate service ID: ${servicio.id_servicio}`);
          return;
        }
        
        // Track service ID
        if (servicio.id_servicio) {
          uniqueServices.set(servicio.id_servicio, true);
        }
        
        // DEBUG: Log each service
        console.log(`Processing service ID: ${servicio.id} / ${servicio.id_servicio || 'no ID'}`);
        console.log(`Raw cobro_cliente value:`, servicio.cobro_cliente, `Type: ${typeof servicio.cobro_cliente}`);
        
        // Process cobro_cliente value with improved parsing
        if (servicio.cobro_cliente !== null && servicio.cobro_cliente !== undefined) {
          let cobroValue = 0;
          
          try {
            // Handle different data types
            if (typeof servicio.cobro_cliente === 'number') {
              cobroValue = servicio.cobro_cliente;
              console.log(`  - Numeric value: ${cobroValue}`);
            } else if (typeof servicio.cobro_cliente === 'string') {
              // Handle different currency formats and clean them properly
              const cleanVal = servicio.cobro_cliente
                .replace(/\$/g, '') // Remove dollar signs
                .replace(/\s/g, '') // Remove spaces
                .replace(/,/g, '.'); // Replace commas with periods for decimal
              
              cobroValue = parseFloat(cleanVal);
              console.log(`  - String value: "${servicio.cobro_cliente}" -> Cleaned: "${cleanVal}" -> Parsed: ${cobroValue}`);
            }
            
            // Only add valid numbers
            if (!isNaN(cobroValue) && cobroValue > 0) {
              totalCobro += cobroValue;
              validCobroCount++;
              console.log(`  - Added to total: ${cobroValue} -> Running total: ${totalCobro}`);
            } else if (isNaN(cobroValue)) {
              console.log(`  - INVALID VALUE: Could not parse as number`);
            } else if (cobroValue <= 0) {
              console.log(`  - ZERO/NEGATIVE VALUE: ${cobroValue}, ignoring`);
            }
          } catch (err) {
            console.error(`Error parsing cobro_cliente value for ${servicio.id}:`, err);
          }
        } else {
          console.log(`  - NO VALUE for cobro_cliente`);
        }
      });
      
      // Calculate average - use unique service count or filtered count if no unique IDs
      const serviceCount = uniqueServices.size > 0 ? uniqueServices.size : filteredCount;
      
      console.log(`Summary for ${cliente.nombre_cliente}:`);
      console.log(`- Total cobro: ${totalCobro}`);
      console.log(`- Service count for division: ${serviceCount}`);
      console.log(`- Valid cobro values count: ${validCobroCount}`);
      
      // Use the services with valid cobro values if available, otherwise use total service count
      const divisor = validCobroCount > 0 ? validCobroCount : (serviceCount || 1);
      const avgCobro = totalCobro / divisor;
      
      console.log(`- Final AOV calculation: ${totalCobro} / ${divisor} = ${avgCobro}`);
      console.log(`------------------------`);
      
      return {
        ...cliente,
        totalServicios: filteredCount,
        kmPromedio: avgKm,
        costoPromedio: Number(avgCobro.toFixed(1)), // Format to 1 decimal place as requested
        // Add trend info based on simple thresholds for demo purposes
        serviciosTrend: filteredCount > 50 ? 'up' : (filteredCount > 20 ? 'neutral' : 'down')
      };
    });
    
    console.log("Final filtered client count:", activeClientes.length);
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
