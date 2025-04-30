
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
      const filteredCount = serviciosData.filter(
        (servicio: any) => 
          servicio.nombre_cliente === cliente.nombre_cliente && 
          filteredIds.has(servicio.id)
      ).length;
      
      return {
        ...cliente,
        totalServicios: filteredCount
      };
    });
    
    console.log("Filtered client data:", activeClientes.length);
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
