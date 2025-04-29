
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface ServiciosTipoChartProps {
  data: { tipo: string; count: number }[];
  isLoading: boolean;
}

// Colores para las categorías específicas
const COLOR_MAP = {
  "Foraneo": "#0088FE",
  "Local": "#00C49F",
  "Reparto": "#FFBB28",
  "Otro": "#FF8042"
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
  COLORS.forEach((color, index) => {
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
                  // Usar color específico si está en el mapa, de lo contrario usar el índice
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
