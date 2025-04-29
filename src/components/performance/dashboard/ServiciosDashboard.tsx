
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

  // Debug logs to validate data is being fetched properly
  React.useEffect(() => {
    console.log("ServiciosDashboard render with dateRange:", {
      from: dateRange?.from ? dateRange.from.toISOString() : 'undefined',
      to: dateRange?.to ? dateRange.to.toISOString() : 'undefined'
    });
  }, [dateRange]);

  React.useEffect(() => {
    if (data) {
      console.log("ServiciosDashboard received data:", {
        totalServicios: data.totalServicios,
        serviciosDataLength: data.serviciosData?.length || 0,
        clientesActivos: data.clientesActivos,
        hasMockData: !data.serviciosData || data.serviciosData.length === 0
      });
    }
  }, [data]);

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
    <div className="space-y-10"> {/* Increased spacing between sections for better separation */}
      {/* Metrics cards at the top */}
      <ServiciosMetricsCards 
        data={data} 
        isLoading={isLoading} 
      />
      
      {/* Performance and Type charts in first row with increased gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      
      {/* Hour distribution in its own row with full width and increased height */}
      <div className="mt-10">
        <ServiciosHourDistributionChart 
          data={data?.serviciosData}
          isLoading={isLoading}
        />
      </div>
      
      {/* Clients and alerts in third row with increased gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
