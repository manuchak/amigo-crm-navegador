
import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartBarIcon, ClockIcon, TrendingUpIcon, UsersIcon } from "lucide-react";

interface ServiciosMetricsCardsProps {
  data?: any[];
  comparisonData?: any[];
  isLoading: boolean;
}

export function ServiciosMetricsCards({ data = [], comparisonData = [], isLoading }: ServiciosMetricsCardsProps) {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const totalServicios = data.length;
    
    // Calculate average service duration
    const duracionData = data.filter(item => item.duracion_servicio);
    const avgDuracion = duracionData.length > 0 
      ? duracionData.reduce((acc, curr) => acc + (typeof curr.duracion_servicio === 'string' 
          ? parseDurationToMinutes(curr.duracion_servicio) 
          : 0), 0) / duracionData.length
      : 0;
    
    // Calculate median km per service
    const kmData = data
      .filter(item => item.km_recorridos)
      .map(item => item.km_recorridos || 0)
      .sort((a, b) => a - b);
    
    // Calculate median value
    const medianKm = calculateMedian(kmData);
    
    // Calculate average income per service
    const cobroData = data.filter(item => item.cobro_cliente);
    const avgCobro = cobroData.length > 0
      ? cobroData.reduce((acc, curr) => acc + (curr.cobro_cliente || 0), 0) / cobroData.length
      : 0;
      
    // Find active custodios (unique custodios with services)
    const activeCustodios = new Set(
      data
        .filter(item => item.nombre_custodio)
        .map(item => item.nombre_custodio)
    ).size;
    
    return {
      totalServicios,
      avgDuracion,
      medianKm,
      avgCobro,
      activeCustodios
    };
  }, [data]);
  
  // Calculate comparison metrics if available
  const comparisonMetrics = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return null;
    
    const totalServicios = comparisonData.length;
    
    const duracionData = comparisonData.filter(item => item.duracion_servicio);
    const avgDuracion = duracionData.length > 0 
      ? duracionData.reduce((acc, curr) => acc + (typeof curr.duracion_servicio === 'string' 
          ? parseDurationToMinutes(curr.duracion_servicio) 
          : 0), 0) / duracionData.length
      : 0;
    
    const kmData = comparisonData
      .filter(item => item.km_recorridos)
      .map(item => item.km_recorridos || 0)
      .sort((a, b) => a - b);
    
    const medianKm = calculateMedian(kmData);
    
    const cobroData = comparisonData.filter(item => item.cobro_cliente);
    const avgCobro = cobroData.length > 0
      ? cobroData.reduce((acc, curr) => acc + (curr.cobro_cliente || 0), 0) / cobroData.length
      : 0;
      
    const activeCustodios = new Set(
      comparisonData
        .filter(item => item.nombre_custodio)
        .map(item => item.nombre_custodio)
    ).size;
    
    return {
      totalServicios,
      avgDuracion,
      medianKm,
      avgCobro,
      activeCustodios
    };
  }, [comparisonData]);
  
  // Helper function to calculate median value
  function calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const half = Math.floor(values.length / 2);
    
    if (values.length % 2 === 0) {
      // For even length, average the two middle values
      return (values[half - 1] + values[half]) / 2;
    }
    
    // For odd length, return the middle value
    return values[half];
  }
  
  // Helper function to parse duration strings like "2 hours 30 minutes" into minutes
  function parseDurationToMinutes(durationStr: string): number {
    if (!durationStr) return 0;
    
    let minutes = 0;
    
    // Extract hours
    const hoursMatch = durationStr.match(/(\d+)\s*hours?/);
    if (hoursMatch && hoursMatch[1]) {
      minutes += parseInt(hoursMatch[1], 10) * 60;
    }
    
    // Extract minutes
    const minsMatch = durationStr.match(/(\d+)\s*minutes?/);
    if (minsMatch && minsMatch[1]) {
      minutes += parseInt(minsMatch[1], 10);
    }
    
    return minutes;
  }
  
  // Helper function to format minutes into hours and minutes
  function formatMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  }

  // Helper function to calculate percent change with comparison data
  function calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }
  
  // Render comparison indicator with arrow and percentage
  function renderComparison(current: number, previous: number | undefined) {
    if (previous === undefined) return null;
    
    const percentChange = calculatePercentChange(current, previous);
    const isPositive = percentChange > 0;
    const isNeutral = percentChange === 0;
    
    return (
      <div className={`text-xs flex items-center mt-1 ${
        isNeutral ? 'text-gray-500' : (isPositive ? 'text-green-600' : 'text-red-600')
      }`}>
        {isPositive ? '↑' : isNeutral ? '→' : '↓'} 
        <span className="ml-1">{Math.abs(Math.round(percentChange))}%</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-violet-50 text-violet-600 p-3 rounded-xl">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Servicios</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div>
                  <h3 className="text-2xl font-semibold mt-1">
                    {metrics?.totalServicios || 0}
                  </h3>
                  {comparisonMetrics && renderComparison(
                    metrics?.totalServicios || 0, 
                    comparisonMetrics?.totalServicios
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duración Promedio</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div>
                  <h3 className="text-2xl font-semibold mt-1">
                    {metrics ? formatMinutesToHours(metrics.avgDuracion) : '0h 0m'}
                  </h3>
                  {comparisonMetrics && renderComparison(
                    metrics?.avgDuracion || 0, 
                    comparisonMetrics?.avgDuracion
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
              <TrendingUpIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KM Mediana</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div>
                  <h3 className="text-2xl font-semibold mt-1">
                    {metrics ? `${Math.round(metrics.medianKm)} km` : '0 km'}
                  </h3>
                  {comparisonMetrics && renderComparison(
                    metrics?.medianKm || 0, 
                    comparisonMetrics?.medianKm
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-md bg-white/90">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custodios Activos</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <div>
                  <h3 className="text-2xl font-semibold mt-1">
                    {metrics?.activeCustodios || 0}
                  </h3>
                  {comparisonMetrics && renderComparison(
                    metrics?.activeCustodios || 0, 
                    comparisonMetrics?.activeCustodios
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
