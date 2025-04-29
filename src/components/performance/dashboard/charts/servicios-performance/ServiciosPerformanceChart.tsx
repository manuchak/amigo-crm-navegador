
import React from 'react';
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePerformanceChartData } from './usePerformanceChartData';
import { LoadingState } from './LoadingState';
import { PerformanceChart } from './PerformanceChart';

interface ServiciosPerformanceChartProps {
  data?: any[];
  comparisonData?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function ServiciosPerformanceChart({ 
  data = [], 
  comparisonData, 
  isLoading, 
  dateRange 
}: ServiciosPerformanceChartProps) {
  // Process chart data using our custom hook
  const chartData = usePerformanceChartData(data, dateRange);

  if (isLoading) {
    return <LoadingState />;
  }

  // Get min and max values for better Y-axis
  const maxServicios = Math.max(...chartData.map(item => item.servicios), 0);
  const yAxisMax = Math.ceil(maxServicios * 1.1); // Add 10% padding

  // Calculate average for reference line
  const average = chartData.length > 0 
    ? chartData.reduce((sum, item) => sum + item.servicios, 0) / chartData.length
    : 0;

  return (
    <Card className="border shadow-sm bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Rendimiento de Servicios</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        <div className="h-[360px] w-full">
          <PerformanceChart 
            chartData={chartData}
            average={average}
            yAxisMax={yAxisMax}
          />
        </div>
      </CardContent>
    </Card>
  );
}
