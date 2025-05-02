
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  // State for valid retention data
  const [validRetentionData, setValidRetentionData] = useState<{ month: string; rate: number }[]>([]);

  // Log the data for debugging
  useEffect(() => {
    console.log('DEBUG RetentionMetrics: Data received:', data);
    
    // Filter out invalid retention data points for the chart
    const filteredData = data?.retentionByMonth?.filter(
      point => point.rate !== null && point.rate !== undefined && !isNaN(point.rate)
    ) || [];
    
    setValidRetentionData(filteredData);
    
    // Log the chart data for debugging
    console.log('DEBUG RetentionMetrics: Valid retention chart data points:', filteredData.length);
    if (filteredData.length > 0) {
      console.log('DEBUG RetentionMetrics: Sample chart data:', filteredData[0]);
    }
  }, [data]);

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

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            Tendencia de Retención
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : validRetentionData.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={validRetentionData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                >
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Retención"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    name="Retención"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] w-full flex items-center justify-center">
              <p className="text-muted-foreground">No hay datos de retención disponibles o los datos contienen valores inválidos (NULL/N/A)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
