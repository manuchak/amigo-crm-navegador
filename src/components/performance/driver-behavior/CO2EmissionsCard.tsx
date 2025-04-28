
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Cloud } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DriverBehaviorData } from '../types/driver-behavior.types';
import { Progress } from '@/components/ui/progress';

interface CO2EmissionsCardProps {
  data?: DriverBehaviorData | null;
  isLoading: boolean;
}

export function CO2EmissionsCard({ data, isLoading }: CO2EmissionsCardProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no data is available
  if (!data || data.co2Emissions === undefined) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Emisiones de CO2
          </CardTitle>
          <CardDescription>
            No hay datos de emisiones disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            No hay información de distancias registrada para calcular emisiones
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract values from the data
  const co2EmissionsValue = data.co2Emissions || 0;
  const wastageValue = co2EmissionsValue * 0.15; // Estimated wastage due to poor driving habits
  const savedValue = co2EmissionsValue * 0.05; // Estimated savings from good driving habits
  
  // Calculate the potential reduction percentage
  const potentialReductionPercentage = Math.round((wastageValue / co2EmissionsValue) * 100);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-600" />
          Emisiones de CO2
        </CardTitle>
        <CardDescription>
          Impacto ambiental basado en patrones de conducción
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Emisiones totales</span>
              <span className="text-2xl font-bold">{co2EmissionsValue.toFixed(1)} kg</span>
            </div>
            <Progress value={100} className="h-2 bg-gray-100" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-amber-600">CO2 adicional por mala conducción</span>
              <span className="text-lg font-medium text-amber-600">+{wastageValue.toFixed(1)} kg</span>
            </div>
            <Progress value={Math.min(wastageValue / co2EmissionsValue * 100, 100)} className="h-2 bg-gray-100" indicatorClassName="bg-amber-500" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-600">CO2 ahorrado con buena conducción</span>
              <span className="text-lg font-medium text-green-600">-{savedValue.toFixed(1)} kg</span>
            </div>
            <Progress value={Math.min(savedValue / co2EmissionsValue * 100, 100)} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Potencial de reducción de emisiones mediante mejora de hábitos de conducción: {potentialReductionPercentage}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              *Basado en estudios que indican que la conducción ineficiente aumenta el consumo de combustible y emisiones hasta un 30%.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
