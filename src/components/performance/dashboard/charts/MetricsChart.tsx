
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MetricsChartProps {
  data?: any[];
  isLoading: boolean;
}

export function MetricsChart({ data, isLoading }: MetricsChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'd MMM', { locale: es });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Métricas de Calidad y Respuesta
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[350px] w-full" />
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
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
                <Tooltip />
                <Line 
                  type="monotone" 
                  yAxisId="left"
                  dataKey="quality" 
                  name="Calidad" 
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  yAxisId="left"
                  dataKey="reliability" 
                  name="Confiabilidad" 
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  yAxisId="right"
                  dataKey="responseTime" 
                  name="Tiempo de Resp. (h)" 
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={false}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
