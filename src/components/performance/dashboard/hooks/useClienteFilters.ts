
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
      
      // Calculate AOV (Average Order Value) - Sum of cobro_cliente values
      let totalCobro = 0;
      let validCobroCount = 0;

      // Get distinct service IDs to avoid counting duplicates
      const distinctServiceIds = new Set(filteredClientServices.map(s => s.id_servicio));
      
      filteredClientServices.forEach((servicio: any) => {
        // Only process services with valid cobro_cliente values and unique id_servicio
        if (servicio.cobro_cliente !== null && servicio.cobro_cliente !== undefined) {
          // Parse the value as a number
          let cobroValue;
          
          if (typeof servicio.cobro_cliente === 'string') {
            // Remove any non-numeric characters except decimal point and minus sign
            cobroValue = parseFloat(servicio.cobro_cliente.replace(/[^0-9.-]+/g, ''));
          } else {
            cobroValue = Number(servicio.cobro_cliente);
          }
          
          if (!isNaN(cobroValue)) {
            totalCobro += cobroValue;
            validCobroCount++;
          }
        }
      });
      
      // Use the number of distinct service IDs for the calculation
      const distinctCount = distinctServiceIds.size || filteredCount;
      const avgCobro = distinctCount > 0 ? totalCobro / distinctCount : 0;
      
      return {
        ...cliente,
        totalServicios: filteredCount,
        kmPromedio: avgKm, // Override with our recalculated value
        costoPromedio: avgCobro // AOV calculation
      };
    });
    
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
