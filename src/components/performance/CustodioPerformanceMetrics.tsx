
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { useCustodioPerformanceData } from "./hooks/useCustodioPerformanceData";
import { Users, Award, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustodioPerformanceMetricsProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function CustodioPerformanceMetrics({ dateRange, comparisonRange }: CustodioPerformanceMetricsProps) {
  const { data, isLoading } = useCustodioPerformanceData(dateRange, comparisonRange);

  // Find specific metrics from the data
  const getTotalCustodios = () => {
    const metric = data?.summaryMetrics.find(m => m.label === 'Total Custodios');
    return metric?.value || 0;
  };
  
  const getTotalValidaciones = () => {
    const metric = data?.summaryMetrics.find(m => m.label === 'Validaciones');
    return metric?.value || 0;
  };
  
  const getResponseTime = () => {
    const metric = data?.summaryMetrics.find(m => m.label === 'Tiempo Promedio de Respuesta');
    return metric?.value || '0h';
  };
  
  const getReliabilityRate = () => {
    const avgReliability = data?.custodios && data.custodios.length > 0
      ? data.custodios.reduce((sum, c) => sum + c.reliability, 0) / data.custodios.length
      : 0;
    return avgReliability.toFixed(1);
  };

  const metrics = [
    {
      title: "Total Custodios",
      value: getTotalCustodios(),
      icon: Users,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Servicios Realizados",
      value: getTotalValidaciones(),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Tiempo de Respuesta",
      value: getResponseTime(),
      icon: Clock,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Confiabilidad Promedio",
      value: getReliabilityRate(),
      icon: Award,
      color: "bg-violet-50 text-violet-600",
      badge: true
    }
  ];

  // Helper function to render a rating badge
  const renderRatingBadge = (rating: string) => {
    const numRating = parseFloat(rating);
    let color = "bg-gray-100 text-gray-600";
    
    if (numRating >= 4.5) color = "bg-emerald-100 text-emerald-700";
    else if (numRating >= 3.5) color = "bg-green-100 text-green-700";
    else if (numRating >= 2.5) color = "bg-amber-100 text-amber-700";
    else if (numRating > 0) color = "bg-red-100 text-red-700";
    
    return (
      <Badge variant="secondary" className={`ml-2 ${color}`}>
        {rating}/5
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, i) => (
        <Card key={i} className="border-0 shadow-md bg-white/90">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`${metric.color} p-3 rounded-xl`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <div className="flex items-center justify-end mt-1">
                  <h3 className="text-2xl font-semibold">
                    {metric.value}
                  </h3>
                  {metric.badge && renderRatingBadge(metric.value as string)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
