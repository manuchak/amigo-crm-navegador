
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface ServiciosTipoChartProps {
  data: { tipo: string; count: number }[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ServiciosTipoChart({ data = [], isLoading }: ServiciosTipoChartProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución por Tipo de Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Asegurar que tenemos datos
  const chartData = data.length > 0 ? data : [{ tipo: 'Sin datos', count: 1 }];

  // Calcular porcentajes para la etiqueta personalizada
  const total = chartData.reduce((sum, entry) => sum + entry.count, 0);
  const chartDataWithPercentage = chartData.map(item => ({
    ...item, 
    percentage: ((item.count / total) * 100).toFixed(1)
  }));

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución por Tipo de Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer 
            config={{ 
              colors: COLORS,
              theme: {
                backgroundColor: 'transparent',
                fontSize: 12,
              }
            }}
          >
            <PieChart>
              <Pie
                data={chartDataWithPercentage}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ tipo, percentage }) => `${tipo}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="tipo"
              >
                {chartDataWithPercentage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, props.payload.tipo]}
              />
              <Legend />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
