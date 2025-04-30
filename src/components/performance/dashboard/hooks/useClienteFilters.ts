
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
      
      const avgKm = filteredClientServices.length > 0 ? totalKm / filteredClientServices.length : 0;
      
      // Calculate AOV (Average Order Value) - Sum of cobro_cliente divided by service count
      // Debug logging to identify issues with cobro_cliente values
      console.log(`Client ${cliente.nombre_cliente} services:`, filteredClientServices.map(s => ({
        id: s.id,
        cobro_cliente: s.cobro_cliente,
        cobro_cliente_type: typeof s.cobro_cliente
      })));
      
      // Fix: Ensure cobro_cliente values are properly converted to numbers
      let totalCobro = 0;
      filteredClientServices.forEach((servicio: any) => {
        // Check if cobro_cliente exists and convert it properly to a number
        if (servicio.cobro_cliente !== null && servicio.cobro_cliente !== undefined) {
          // Handle both numeric and string representations
          const cobroValue = typeof servicio.cobro_cliente === 'string' 
            ? parseFloat(servicio.cobro_cliente.replace(/[^0-9.-]+/g, '')) 
            : Number(servicio.cobro_cliente);
            
          if (!isNaN(cobroValue)) {
            totalCobro += cobroValue;
          }
        }
      });
      
      const avgCobro = filteredClientServices.length > 0 ? totalCobro / filteredClientServices.length : 0;
      
      console.log(`Client ${cliente.nombre_cliente} AOV calculation:`, {
        totalCobro,
        serviceCount: filteredClientServices.length,
        avgCobro
      });
      
      return {
        ...cliente,
        totalServicios: filteredCount,
        kmPromedio: avgKm, // Override with our recalculated value
        costoPromedio: avgCobro // AOV calculation
      };
    });
    
    console.log("Filtered client data:", activeClientes.length);
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
