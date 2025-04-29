
import React from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { fetchServiciosData } from "../services/servicios/serviciosDataService";
import { ServiciosMetricsCards } from './ServiciosMetricsCards';
import { ServiciosPerformanceChart } from './charts/ServiciosPerformanceChart';
import { ServiciosAlertas } from './ServiciosAlertas';
import { ServiciosClientesActivos } from './ServiciosClientesActivos';
import { ServiciosTipoChart } from './ServiciosTipoChart';
import { CohortAnalysisViewer } from './CohortAnalysisViewer';
import { CustodioRetentionTable } from './CustodioRetentionTable';

interface ServiciosDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function ServiciosDashboard({ dateRange, comparisonRange }: ServiciosDashboardProps) {
  const { data: serviciosData, isLoading, error } = useQuery({
    queryKey: ['servicios-data', dateRange, comparisonRange],
    queryFn: () => fetchServiciosData(dateRange, comparisonRange),
  });

  const { data: comparisonData } = useQuery({
    queryKey: ['servicios-comparison-data', comparisonRange],
    queryFn: () => comparisonRange ? fetchServiciosData(comparisonRange) : null,
    enabled: !!comparisonRange && comparisonRange.from !== null && comparisonRange.to !== null,
  });

  if (error) {
    console.error('Error loading servicios data:', error);
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p className="font-semibold">Error al cargar los datos de servicios</p>
        <p className="text-sm">{String(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <ServiciosMetricsCards 
        data={serviciosData} 
        isLoading={isLoading} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico principal de rendimiento */}
        <ServiciosPerformanceChart 
          data={serviciosData?.serviciosPorCliente} 
          comparisonData={comparisonData?.serviciosPorCliente}
          isLoading={isLoading} 
          dateRange={dateRange} 
        />
        
        {/* Gráfico de distribución por tipo */}
        <ServiciosTipoChart 
          data={serviciosData?.serviciosPorTipo || []} 
          isLoading={isLoading} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <ServiciosAlertas 
          alertas={serviciosData?.alertas || []} 
          isLoading={isLoading} 
        />
        
        {/* Clientes más activos */}
        <ServiciosClientesActivos 
          clientes={serviciosData?.serviciosPorCliente || []} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* Análisis de cohortes */}
      <CohortAnalysisViewer
        data={serviciosData}
        isLoading={isLoading}
        dateRange={dateRange}
      />
      
      {/* Tabla de retención de custodios */}
      <CustodioRetentionTable 
        data={serviciosData} 
        isLoading={isLoading} 
        dateRange={dateRange} 
      />
    </div>
  );
}
