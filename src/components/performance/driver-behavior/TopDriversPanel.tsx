
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, TrendingDown, Gauge } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { DriverPerformance, DriverScore } from '../types/driver-behavior.types';
import { getScoreColorClass } from '../utils/scoreCalculator';

interface TopDriversPanelProps {
  data?: DriverPerformance;
  isLoading: boolean;
}

export function TopDriversPanel({ data, isLoading }: TopDriversPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || (!data.topDrivers.length && !data.needsImprovement.length)) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Desempeño de Conductores</CardTitle>
          <CardDescription>
            No hay datos disponibles para mostrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            No hay información suficiente para analizar el desempeño
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper to render driver entry
  const renderDriverEntry = (driver: DriverScore, icon: React.ElementType, iconColorClass: string) => {
    const Icon = icon;
    const scoreColorClass = getScoreColorClass(driver.score);
    
    return (
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">{driver.driver_name}</h4>
            <p className="text-xs text-gray-500">{driver.client} • {driver.trips_count} viajes</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreColorClass}`}>
              {driver.score.toFixed(1)}
            </div>
            <div className={`p-2 rounded-full ${iconColorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Desempeño de Conductores</CardTitle>
        <CardDescription>
          Conductores destacados y áreas de mejora
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y">
          <div>
            <h3 className="px-4 py-2 bg-gray-50 text-sm font-medium text-green-600 flex items-center gap-2">
              <Award className="h-4 w-4" /> 
              Conductores Destacados
            </h3>
            {data.topDrivers.length > 0 ? (
              data.topDrivers.map(driver => 
                renderDriverEntry(driver, Award, "bg-green-50 text-green-600")
              )
            ) : (
              <div className="p-4 text-sm text-gray-500">No hay datos disponibles</div>
            )}
          </div>

          <div>
            <h3 className="px-4 py-2 bg-gray-50 text-sm font-medium text-amber-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> 
              Oportunidades de Mejora
            </h3>
            {data.needsImprovement.length > 0 ? (
              data.needsImprovement.map(driver => 
                renderDriverEntry(driver, TrendingDown, "bg-amber-50 text-amber-600")
              )
            ) : (
              <div className="p-4 text-sm text-gray-500">No hay datos disponibles</div>
            )}
          </div>

          <div>
            <h3 className="px-4 py-2 bg-gray-50 text-sm font-medium text-blue-600 flex items-center gap-2">
              <Gauge className="h-4 w-4" /> 
              Conductores más Ecológicos
            </h3>
            {data.ecoDrivers.length > 0 ? (
              data.ecoDrivers.map(driver => 
                renderDriverEntry(driver, Gauge, "bg-blue-50 text-blue-600")
              )
            ) : (
              <div className="p-4 text-sm text-gray-500">No hay datos disponibles</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
