
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, TrendingDown, Users, Timer, 
  Activity, DollarSign, Star, Clock
} from "lucide-react";

interface PerformanceMetricsCardsProps {
  data?: {
    label: string;
    value: number | string;
    change?: number;
    changeLabel?: string;
    changeType?: 'increase' | 'decrease' | 'neutral';
    description?: string;
  }[];
  isLoading: boolean;
}

export function PerformanceMetricsCards({ data, isLoading }: PerformanceMetricsCardsProps) {
  const getIcon = (label: string) => {
    switch (label) {
      case 'Total Custodios': return Users;
      case 'Validaciones': return Activity;
      case 'Tiempo Promedio de Respuesta': return Clock;
      case 'Tasa de Retención': return Star;
      case 'Distancia Promedio': return Timer;
      case 'Ingreso Promedio': return DollarSign;
      case 'LTV': return DollarSign;
      case 'Rotación': return Users;
      default: return Activity;
    }
  };
  
  const getColorClass = (type?: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase': return 'text-emerald-600';
      case 'decrease': return 'text-rose-600';
      case 'neutral': return 'text-slate-600';
      default: return 'text-slate-600';
    }
  };
  
  const getBackgroundClass = (label: string) => {
    switch (label) {
      case 'Total Custodios': return 'bg-violet-50 text-violet-600';
      case 'Validaciones': return 'bg-blue-50 text-blue-600';
      case 'Tiempo Promedio de Respuesta': return 'bg-amber-50 text-amber-600';
      case 'Tasa de Retención': return 'bg-emerald-50 text-emerald-600';
      case 'Distancia Promedio': return 'bg-indigo-50 text-indigo-600';
      case 'Ingreso Promedio': return 'bg-green-50 text-green-600';
      case 'LTV': return 'bg-teal-50 text-teal-600';
      case 'Rotación': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading ? (
        // Skeleton loaders when loading
        Array(8).fill(0).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : data?.map((metric, i) => {
        const Icon = getIcon(metric.label);
        return (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${getBackgroundClass(metric.label)} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <h3 className="text-2xl font-semibold mt-1">{metric.value}</h3>
                  {metric.change !== undefined && (
                    <p className={`text-xs flex items-center mt-1 ${getColorClass(metric.changeType)}`}>
                      {metric.changeType === 'increase' ? (
                        <TrendingUp className="mr-1 h-3 w-3" />
                      ) : metric.changeType === 'decrease' ? (
                        <TrendingDown className="mr-1 h-3 w-3" />
                      ) : null}
                      {metric.change > 0 ? '+' : ''}{metric.change}% {metric.changeLabel}
                    </p>
                  )}
                </div>
              </div>
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-4 pl-14">
                  {metric.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
