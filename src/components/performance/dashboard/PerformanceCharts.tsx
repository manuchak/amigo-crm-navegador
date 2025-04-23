
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PerformanceChartsProps {
  performanceData?: {
    date: string;
    completionRate: number;
    responseTime: number;
    reliability: number;
    quality: number;
    validations: number;
  }[];
  isLoading: boolean;
}

export function PerformanceCharts({ performanceData, isLoading }: PerformanceChartsProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'd MMM', { locale: es });
    } catch (e) {
      return dateStr;
    }
  };
  
  const chartConfig = {
    metricsChart: {
      quality: { color: '#8B5CF6' },
      reliability: { color: '#0EA5E9' },
      responseTime: { color: '#F97316' }
    },
    validationsChart: {
      validations: { color: '#8B5CF6' }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            Métricas de Calidad y Respuesta
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px]">
              <ChartContainer
                config={chartConfig.metricsChart}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      yAxisId="left" 
                      domain={[0, 5]} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={(props) => (
                      <ChartTooltipContent {...props} />
                    )} />
                    <Line 
                      type="monotone" 
                      yAxisId="left"
                      dataKey="quality" 
                      name="Calidad" 
                      stroke={chartConfig.metricsChart.quality.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      yAxisId="left"
                      dataKey="reliability" 
                      name="Confiabilidad" 
                      stroke={chartConfig.metricsChart.reliability.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      yAxisId="right"
                      dataKey="responseTime" 
                      name="Tiempo de Resp. (h)" 
                      stroke={chartConfig.metricsChart.responseTime.color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <ChartLegend content={(props) => (
                      <ChartLegendContent {...props} />
                    )} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            Validaciones por Día
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px]">
              <ChartContainer
                config={chartConfig.validationsChart}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={(props) => (
                      <ChartTooltipContent {...props} />
                    )} />
                    <Bar
                      dataKey="validations"
                      name="Validaciones" 
                      fill={chartConfig.validationsChart.validations.color}
                      radius={[4, 4, 0, 0]}
                    />
                    <ChartLegend content={(props) => (
                      <ChartLegendContent {...props} />
                    )} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
