
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
      <Card className="border shadow-sm bg-white h-full">
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

  // Custom render for the labels to ensure they don't overflow
  const renderCustomizedLabel = ({ tipo, percentage, cx, cy, midAngle, innerRadius, outerRadius }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className="border shadow-sm bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución por Tipo de Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] mb-2">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataWithPercentage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={85} 
                  innerRadius={50}
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
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                    border: 'none',
                    padding: '8px 12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        {/* FIXED: Move legend to center-bottom with better spacing */}
        <div className="flex justify-center items-center gap-6 mt-4">
          {chartDataWithPercentage.map(entry => (
            <div key={entry.tipo} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLOR_MAP[entry.tipo] || "#CCCCCC" }} 
              />
              <span className="text-xs font-medium">{entry.tipo}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
