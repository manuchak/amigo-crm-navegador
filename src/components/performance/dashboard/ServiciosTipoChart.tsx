
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface ServiciosTipoChartProps {
  data: { tipo: string; count: number }[];
  isLoading: boolean;
}

// Updated color map with distinct colors from the site palette
const COLOR_MAP = {
  "Foráneo": "#8B5CF6", // Vivid Purple
  "Local": "#00C49F",  // Existing green
  "Reparto": "#F97316"  // Bright Orange
};

const COLORS = Object.values(COLOR_MAP);

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

  // Create proper chart config
  const chartConfig = {};
  chartDataWithPercentage.forEach((item, index) => {
    // Use specific color if available, otherwise fall back to index-based color
    const color = COLOR_MAP[item.tipo] || COLORS[index % COLORS.length];
    chartConfig[`item-${index}`] = { color };
  });

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución por Tipo de Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer 
            config={chartConfig}
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
                {chartDataWithPercentage.map((entry, index) => {
                  // Use specific color for this tipo
                  const color = COLOR_MAP[entry.tipo] || COLORS[index % COLORS.length];
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
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
