
import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartBarIcon, ClockIcon, TrendingUpIcon, UsersIcon } from "lucide-react";

interface ServiciosMetricsCardsProps {
  data?: any[];
  isLoading: boolean;
}

export function ServiciosMetricsCards({ data = [], isLoading }: ServiciosMetricsCardsProps) {
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
    
    // Calculate average km per service
    const kmData = data.filter(item => item.km_recorridos);
    const avgKm = kmData.length > 0
      ? kmData.reduce((acc, curr) => acc + (curr.km_recorridos || 0), 0) / kmData.length
      : 0;
    
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
      avgKm,
      avgCobro,
      activeCustodios
    };
  }, [data]);
  
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
                <h3 className="text-2xl font-semibold mt-1">
                  {metrics?.totalServicios || 0}
                </h3>
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
                <h3 className="text-2xl font-semibold mt-1">
                  {metrics ? formatMinutesToHours(metrics.avgDuracion) : '0h 0m'}
                </h3>
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
              <p className="text-sm text-muted-foreground">KM Promedio</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <h3 className="text-2xl font-semibold mt-1">
                  {metrics ? `${Math.round(metrics.avgKm)} km` : '0 km'}
                </h3>
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
                <h3 className="text-2xl font-semibold mt-1">
                  {metrics?.activeCustodios || 0}
                </h3>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
