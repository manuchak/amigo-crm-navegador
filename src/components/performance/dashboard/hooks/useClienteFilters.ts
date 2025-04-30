

import { useMemo } from 'react';
import { ClienteServicios } from '../../services/servicios';

export function useClienteFilters(
  serviciosPorCliente: any[] | undefined, 
  serviciosData: any[] | undefined,
  filteredData: any[]
) {
  // Filtrar datos de clientes por estado
  const filteredClientesData = useMemo(() => {
    if (!serviciosPorCliente || !serviciosData || !filteredData) return [];
    
    // Obtener los IDs de servicios filtrados
    const filteredIds = new Set(filteredData.map((item: any) => item.id));
    
    console.log("Iniciando filtrado de clientes - servicios filtrados:", filteredIds.size);
    
    // Solo retornar clientes que tengan servicios en el conjunto filtrado
    const activeClientes = serviciosPorCliente.filter(cliente => {
      // Encontrar servicios para este cliente en los datos sin procesar
      const clientServices = serviciosData.filter(
        (servicio: any) => servicio.nombre_cliente === cliente.nombre_cliente
      );
      
      // Verificar si alguno de estos servicios está en nuestro conjunto filtrado
      return clientServices.some((servicio: any) => filteredIds.has(servicio.id));
    }).map(cliente => {
      // Contar solo los servicios que coinciden con nuestro filtro para este cliente
      const filteredClientServices = serviciosData.filter(
        (servicio: any) => 
          servicio.nombre_cliente === cliente.nombre_cliente && 
          filteredIds.has(servicio.id)
      );
      
      const filteredCount = filteredClientServices.length;
      
      // Calcular KM promedio para servicios filtrados, priorizando km_teorico sobre km_recorridos
      let totalKm = 0;
      filteredClientServices.forEach((servicio: any) => {
        // Priorizar km_teorico sobre km_recorridos
        const kmValue = servicio.km_teorico !== null && servicio.km_teorico !== undefined ? 
          servicio.km_teorico : 
          (servicio.km_recorridos || 0);
        totalKm += Number(kmValue);
      });
      
      // Redondear a 2 decimales
      const avgKm = filteredClientServices.length > 0 ? 
        Number((totalKm / filteredClientServices.length).toFixed(2)) : 0;

      // Calcular costo promedio (ahora los valores son numéricos gracias a la normalización)
      let totalAmount = 0;
      let validServiceCount = 0;
      
      filteredClientServices.forEach((servicio) => {
        // Extraer cobro_cliente (valor de ingresos/AOV)
        const amount = servicio.cobro_cliente;
        
        // Omitir servicios sin valor cobro_cliente
        if (amount === null || amount === undefined) {
          return;
        }
        
        // Los valores ahora deberían ser numéricos
        if (typeof amount === 'number' && !isNaN(amount) && amount > 0) {
          totalAmount += amount;
          validServiceCount++;
        }
      });
      
      // Calcular el promedio
      const avgCost = validServiceCount > 0 ? totalAmount / validServiceCount : 0;
      
      // Agregar información de tendencia basada en métricas del cliente
      const serviciosTrend = filteredCount > 50 ? 'up' : (filteredCount > 20 ? 'neutral' : 'down');
      const kmTrend = avgKm > 200 ? 'up' : (avgKm > 100 ? 'neutral' : 'down');
      const costTrend = avgCost > 5000 ? 'up' : (avgCost > 1000 ? 'neutral' : 'down');
      
      return {
        ...cliente,
        totalServicios: filteredCount,
        kmPromedio: avgKm,
        costoPromedio: avgCost, // Almacenar el valor numérico sin formato
        serviciosTrend,
        kmTrend,
        costTrend
      };
    });
    
    console.log("Número final de clientes filtrados:", activeClientes.length);
    
    return activeClientes;
  }, [serviciosPorCliente, serviciosData, filteredData]);

  return filteredClientesData;
}
