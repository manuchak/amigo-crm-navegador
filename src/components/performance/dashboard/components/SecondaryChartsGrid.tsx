
import React from 'react';
import { ServiciosHourDistributionChart } from '../charts/ServiciosHourDistributionChart';
import { ServiciosClientesActivos } from '../ServiciosClientesActivos';
import { ClienteServicios } from '../../services/servicios';

interface SecondaryChartsGridProps {
  filteredData: any[];
  isLoading: boolean;
  serviciosPorCliente: ClienteServicios[];
}

export function SecondaryChartsGrid({
  filteredData,
  isLoading,
  serviciosPorCliente
}: SecondaryChartsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animate-delay-150 duration-300">
      <div className="h-[420px]">
        <ServiciosHourDistributionChart 
          data={filteredData}
          isLoading={isLoading}
        />
      </div>
      
      <div className="h-[420px]">
        <ServiciosClientesActivos 
          clientes={serviciosPorCliente || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
