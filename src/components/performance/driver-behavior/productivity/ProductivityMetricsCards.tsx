
import React from 'react';
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { ProductivitySummary } from "../../types/productivity.types";
import { Gauge, TrendingUp, Fuel, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from '@/components/performance/utils/formatters';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  subtitle?: string;
  isLoading?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  colorClass, 
  subtitle,
  isLoading = false
}: MetricCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`${colorClass} p-3 rounded-xl`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold mt-1">
                {isLoading ? <Skeleton className="h-8 w-16" /> : value}
              </h3>
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductivityMetricsCardsProps {
  data?: ProductivitySummary | null;
  isLoading: boolean;
}

export function ProductivityMetricsCards({ 
  data, 
  isLoading 
}: ProductivityMetricsCardsProps) {
  const defaultData: ProductivitySummary = {
    totalDrivers: 0,
    highPerformers: 0,
    averagePerformers: 0,
    lowPerformers: 0,
    averageProductivityScore: 0,
    totalDistanceCovered: 0,
    totalFuelCost: 0,
    totalTimeSpent: '0h 0m'
  };
  
  const summaryData = data || defaultData;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Productividad Promedio"
        value={isLoading ? 0 : `${Math.round(summaryData.averageProductivityScore)}%`}
        subtitle={`${summaryData.highPerformers} conductores de alto rendimiento`}
        icon={Gauge}
        colorClass="bg-blue-50 text-blue-600"
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Distancia Total"
        value={isLoading ? 0 : `${Math.round(summaryData.totalDistanceCovered).toLocaleString()} km`}
        subtitle={`${summaryData.totalDrivers} conductores en total`}
        icon={TrendingUp}
        colorClass="bg-emerald-50 text-emerald-600"
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Costo de Combustible"
        value={isLoading ? 0 : formatCurrency(summaryData.totalFuelCost)}
        subtitle="Estimado"
        icon={Fuel}
        colorClass="bg-amber-50 text-amber-600"
        isLoading={isLoading}
      />
      
      <MetricCard
        title="Tiempo Total"
        value={isLoading ? 0 : summaryData.totalTimeSpent}
        subtitle="Horas de conducción"
        icon={Clock}
        colorClass="bg-purple-50 text-purple-600"
        isLoading={isLoading}
      />
    </div>
  );
}
