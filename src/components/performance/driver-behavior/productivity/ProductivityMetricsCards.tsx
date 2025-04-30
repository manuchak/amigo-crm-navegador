
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateProductivitySummary, fetchProductivityAnalysis } from '../../services/productivity/productivityService';
import { DriverBehaviorFilters } from '../../types/driver-behavior.types';

interface ProductivityMetricsCardsProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

export function ProductivityMetricsCards({ dateRange, filters }: ProductivityMetricsCardsProps) {
  const { data: analysisData, isLoading } = useQuery({
    queryKey: ['productivity-analysis', dateRange, filters],
    queryFn: () => fetchProductivityAnalysis(dateRange, filters),
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const summary = React.useMemo(() => {
    if (!analysisData) return null;
    return calculateProductivitySummary(analysisData);
  }, [analysisData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 bg-white/90 backdrop-blur-sm">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white/90 backdrop-blur-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Conductores Analizados</div>
          <div className="text-3xl font-bold mb-1">0</div>
          <p className="text-xs text-gray-400">Sin datos disponibles</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
        <div className="text-sm font-medium text-gray-500 mb-1">Conductores Analizados</div>
        <div className="text-3xl font-bold mb-1">{summary.totalDrivers}</div>
        <p className="text-xs text-gray-400">
          <span className="text-green-500 font-medium">{summary.highPerformers}</span> alto rendimiento, 
          <span className="text-red-500 font-medium ml-1">{summary.lowPerformers}</span> bajo rendimiento
        </p>
      </Card>
      
      <Card className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
        <div className="text-sm font-medium text-gray-500 mb-1">Puntuación Promedio</div>
        <div className="text-3xl font-bold mb-1 flex items-baseline">
          {summary.averageProductivityScore.toFixed(1)}
          <span className="text-xs text-gray-400 ml-1">/100</span>
        </div>
        <p className="text-xs text-gray-400">
          Puntuación de productividad media
        </p>
      </Card>
      
      <Card className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
        <div className="text-sm font-medium text-gray-500 mb-1">Distancia Total</div>
        <div className="text-3xl font-bold mb-1">{summary.totalDistanceCovered.toLocaleString()} km</div>
        <p className="text-xs text-gray-400">
          Tiempo total: {summary.totalTimeSpent}
        </p>
      </Card>
      
      <Card className="p-6 bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
        <div className="text-sm font-medium text-gray-500 mb-1">Costo de Combustible</div>
        <div className="text-3xl font-bold mb-1">${summary.totalFuelCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
        <p className="text-xs text-gray-400">
          Estimado en base al consumo
        </p>
      </Card>
    </div>
  );
}
