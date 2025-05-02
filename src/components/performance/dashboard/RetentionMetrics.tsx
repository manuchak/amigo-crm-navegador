
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RetentionChart } from "../../leads/dashboard/crm/charts/RetentionChart";

interface RetentionData {
  retention30Days: number;
  retention60Days: number;
  retention90Days: number;
  churnRate: number;
  retentionByMonth: { month: string; rate: number }[];
}

interface RetentionMetricsProps {
  data?: RetentionData;
  isLoading: boolean;
}

export function RetentionMetrics({ data, isLoading }: RetentionMetricsProps) {
  // Console.log only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('DEBUG RetentionMetrics: Data received:', data);
    
    // Log the chart data for debugging
    const validPoints = data?.retentionByMonth?.filter(
      point => point.rate !== null && point.rate !== undefined && !isNaN(point.rate)
    ) || [];
    
    console.log('DEBUG RetentionMetrics: Valid retention chart data points:', validPoints.length);
    if (validPoints.length > 0) {
      console.log('DEBUG RetentionMetrics: Sample chart data:', validPoints[0]);
    }
  }

  const RetentionCard = ({
    title,
    value,
    loading
  }: {
    title: string;
    value?: number;
    loading: boolean;
  }) => (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        {loading ? (
          <Skeleton className="h-8 w-20 mt-1" />
        ) : (
          <h3 className="text-2xl font-semibold mt-1">
            {value !== null && value !== undefined && !isNaN(value) ? `${value}%` : 'N/A'}
          </h3>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RetentionCard 
          title="Retención a 30 días" 
          value={data?.retention30Days} 
          loading={isLoading} 
        />
        <RetentionCard 
          title="Retención a 60 días" 
          value={data?.retention60Days} 
          loading={isLoading} 
        />
        <RetentionCard 
          title="Retención a 90 días" 
          value={data?.retention90Days} 
          loading={isLoading} 
        />
        <RetentionCard 
          title="Tasa de Abandono" 
          value={data?.churnRate} 
          loading={isLoading} 
        />
      </div>

      <RetentionChart 
        data={data?.retentionByMonth}
        isLoading={isLoading}
      />
    </div>
  );
}
