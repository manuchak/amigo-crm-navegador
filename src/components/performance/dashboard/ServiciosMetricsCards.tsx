
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowUp, ArrowDown, Calendar, TrendingUp, 
  Users, AlertTriangle, BarChart3, MapPin
} from "lucide-react";
import { ServiciosMetricData } from '../services/servicios'; // Updated import
import { formatNumber, formatCurrency } from '../utils/formatters';
import { getValidNumberOrZero } from '../services/servicios/utils';

interface ServiciosMetricsCardsProps {
  data?: ServiciosMetricData;
  isLoading: boolean;
}

export function ServiciosMetricsCards({ data, isLoading }: ServiciosMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Process km data to avoid NaN values
  const kmTotales = getValidNumberOrZero(data.kmTotales);
  const kmPromedioCurrent = getValidNumberOrZero(data.kmPromedioMoM.current);
  const kmPromedioPrevious = getValidNumberOrZero(data.kmPromedioMoM.previous);
  const kmPromedioPercentChange = getValidNumberOrZero(data.kmPromedioMoM.percentChange);

  const metrics = [
    {
      title: "Total Servicios",
      value: formatNumber(data.totalServicios),
      icon: BarChart3,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Servicios MoM",
      value: formatNumber(data.serviciosMoM.current),
      change: data.serviciosMoM.percentChange,
      comparison: `vs ${formatNumber(data.serviciosMoM.previous)} mes anterior`,
      icon: Calendar,
      color: "bg-purple-50 text-purple-600"
    },
    {
      title: "Servicios WoW",
      value: formatNumber(data.serviciosWoW.current),
      change: data.serviciosWoW.percentChange,
      comparison: `vs ${formatNumber(data.serviciosWoW.previous)} semana anterior`,
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      title: "Km Totales",
      value: formatNumber(kmTotales),
      icon: MapPin,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Km Promedio MoM",
      value: formatNumber(kmPromedioCurrent),
      change: kmPromedioPercentChange,
      comparison: `vs ${formatNumber(kmPromedioPrevious)} mes anterior`,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Clientes Activos",
      value: formatNumber(data.clientesActivos),
      icon: Users,
      color: "bg-sky-50 text-sky-600"
    },
    {
      title: "Clientes Nuevos",
      value: formatNumber(data.clientesNuevos),
      icon: Users,
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Alertas",
      value: formatNumber(data.alertas.length),
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => (
        <Card key={i} className="border-0 shadow-md bg-white/90 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`${metric.color} p-3 rounded-xl`}>
                <metric.icon className="w-5 h-5" />
              </div>
              
              {typeof metric.change !== 'undefined' && (
                <div className={`flex items-center text-xs font-medium ${
                  metric.change > 0 ? 'text-green-600' : 
                  metric.change < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metric.change > 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : metric.change < 0 ? (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  ) : null}
                  {Math.abs(metric.change)}%
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
              
              {metric.comparison && (
                <p className="text-xs text-muted-foreground mt-1">{metric.comparison}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
