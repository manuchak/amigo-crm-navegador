
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conductores Analizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Sin datos disponibles</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Conductores Analizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalDrivers}</div>
          <p className="text-xs text-muted-foreground">
            {summary.highPerformers} alto rendimiento, {summary.lowPerformers} bajo rendimiento
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Puntuación Promedio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.averageProductivityScore.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Puntuación de productividad media
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Distancia Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalDistanceCovered.toLocaleString()} km</div>
          <p className="text-xs text-muted-foreground">
            Tiempo total: {summary.totalTimeSpent}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Costo de Combustible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.totalFuelCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
          <p className="text-xs text-muted-foreground">
            Estimado en base al consumo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
