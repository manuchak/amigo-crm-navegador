
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
import { CohortAnalysisViewer } from './CohortAnalysisViewer';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from "lucide-react";

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
        kmTotales: data.kmTotales,
        hasMockData: !data.serviciosData || data.serviciosData.length === 0
      });
    }
  }, [data]);

  if (isError) {
    return (
      <Card className="p-8 text-center border shadow-sm bg-white">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-2 text-gray-800">Error al cargar datos</h3>
          <p className="text-muted-foreground">
            Ocurrió un error al cargar los datos de servicios. Por favor, inténtelo de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando datos de servicios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics cards at the top */}
      <div className="animate-fade-in duration-300">
        <ServiciosMetricsCards 
          data={data} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* Performance chart with full width for better visibility */}
      <div className="animate-fade-in animate-delay-100 duration-300">
        <ServiciosPerformanceChart 
          data={data?.serviciosData} 
          isLoading={isLoading}
          dateRange={dateRange}
        />
      </div>
      
      {/* Two charts in a row: Tipos and Hour Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animate-delay-150 duration-300">
        <ServiciosTipoChart 
          data={data?.serviciosPorTipo || []} 
          isLoading={isLoading} 
        />
        
        <ServiciosHourDistributionChart 
          data={data?.serviciosData}
          isLoading={isLoading}
        />
      </div>
      
      {/* Clients and alerts in a row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animate-delay-200 duration-300">
        <ServiciosClientesActivos 
          clientes={data?.serviciosPorCliente || []}
          isLoading={isLoading}
        />
        
        <ServiciosAlertas 
          alertas={data?.alertas || []}
          isLoading={isLoading}
        />
      </div>

      {/* Optional cohort analysis section */}
      <div className="animate-fade-in animate-delay-300 duration-300">
        <CohortAnalysisViewer
          data={data}
          isLoading={isLoading}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}
