
import React from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { fetchServiciosData } from '../services/servicios';
import { ServiciosMetricsCards } from './ServiciosMetricsCards';
import { ServiciosPerformanceChart } from './charts/ServiciosPerformanceChart';
import { ServiciosHourDistributionChart } from './charts/ServiciosHourDistributionChart';
import { ServiciosClientesActivos } from './ServiciosClientesActivos';
import { ServiciosAlertas } from './ServiciosAlertas';
import { ServiciosTipoChart } from './ServiciosTipoChart';

interface ServiciosDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function ServiciosDashboard({ dateRange, comparisonRange }: ServiciosDashboardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['servicios', dateRange, comparisonRange],
    queryFn: () => fetchServiciosData(dateRange, comparisonRange),
    refetchOnWindowFocus: false,
  });

  if (isError) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-medium mb-2">Error al cargar datos</h3>
        <p className="text-muted-foreground">
          Ocurrió un error al cargar los datos de servicios. Por favor, inténtelo de nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8"> {/* Increased space between sections */}
      <ServiciosMetricsCards 
        data={data} 
        isLoading={isLoading} 
      />
      
      {/* Performance and Type charts in first row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiciosPerformanceChart 
          data={data?.serviciosData} 
          isLoading={isLoading}
          dateRange={dateRange}
        />
        
        <ServiciosTipoChart 
          data={data?.serviciosPorTipo || []} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* Hour distribution in second row with full width */}
      <div className="grid grid-cols-1 gap-6">
        <ServiciosHourDistributionChart 
          data={data?.serviciosData}
          isLoading={isLoading}
        />
      </div>
      
      {/* Clients and alerts in third row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiciosClientesActivos 
          clientes={data?.serviciosPorCliente || []}
          isLoading={isLoading}
        />
        
        <ServiciosAlertas 
          alertas={data?.alertas || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
