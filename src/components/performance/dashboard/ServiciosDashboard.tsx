
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchServiciosData } from "../services/servicios/serviciosDataService";
import { ServiciosMetricsCards } from './ServiciosMetricsCards';
import { ServiciosPerformanceChart } from './charts/ServiciosPerformanceChart';
import { CustodioRetentionTable } from './CustodioRetentionTable';
import { CohortAnalysisViewer } from './CohortAnalysisViewer';
import { DateRange } from "react-day-picker";

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
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="text-center p-4">
            <p className="text-red-500">Error al cargar los datos de servicios</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ServiciosMetricsCards 
        data={serviciosData} 
        comparisonData={comparisonData}
        isLoading={isLoading} 
      />
      
      <ServiciosPerformanceChart 
        data={serviciosData} 
        comparisonData={comparisonData}
        isLoading={isLoading} 
        dateRange={dateRange} 
      />
      
      <CohortAnalysisViewer
        data={serviciosData}
        isLoading={isLoading}
        dateRange={dateRange}
      />
      
      <CustodioRetentionTable 
        data={serviciosData} 
        isLoading={isLoading} 
        dateRange={dateRange} 
      />
    </div>
  );
}
