
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface ServiciosTipoChartProps {
  data: { tipo: string; count: number }[];
  isLoading: boolean;
}

// Color map with Apple-inspired colors for each service type
const COLOR_MAP = {
  "Foráneo": "#8B5CF6", // Vivid Purple
  "Local": "#0EA5E9",   // Ocean Blue  
  "Reparto": "#F97316"  // Bright Orange
};

export function ServiciosTipoChart({ data = [], isLoading }: ServiciosTipoChartProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución por Tipo de Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
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

  // Create proper chart config with distinct colors
  const chartConfig = {};
  chartDataWithPercentage.forEach((item) => {
    // Use color from our map or default gray
    const color = COLOR_MAP[item.tipo] || "#CCCCCC";
    chartConfig[item.tipo] = { color };
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución por Tipo de Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataWithPercentage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, percentage }) => `${percentage}%`}
                  outerRadius={90}
                  innerRadius={50} // Add a donut hole
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="tipo"
                  paddingAngle={2}
                >
                  {chartDataWithPercentage.map((entry) => {
                    // Use specific color for this tipo
                    const color = COLOR_MAP[entry.tipo] || "#CCCCCC";
                    return <Cell key={`cell-${entry.tipo}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, props.payload.tipo]}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
