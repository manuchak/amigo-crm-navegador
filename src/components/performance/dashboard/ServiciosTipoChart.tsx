
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ServiciosTipoProps {
  data: any[];
  isLoading: boolean;
}

const COLORS = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#6366F1'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ServiciosTipoChart({ data, isLoading }: ServiciosTipoProps) {
  // Process data to focus on local/foráneo distribution
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const localForaneoCount = {
      "Local": 0,
      "Foraneo": 0,
      "Sin especificar": 0
    };

    // Count by local_foraneo field
    data.forEach(item => {
      if (item.local_foraneo) {
        if (item.local_foraneo.toLowerCase() === 'local') {
          localForaneoCount["Local"] += 1;
        } else if (item.local_foraneo.toLowerCase() === 'foraneo') {
          localForaneoCount["Foraneo"] += 1;
        } else {
          localForaneoCount["Sin especificar"] += 1;
        }
      } else {
        localForaneoCount["Sin especificar"] += 1;
      }
    });

    // Convert to array format for chart
    return Object.entries(localForaneoCount)
      .map(([tipo, count]) => ({ tipo, count }))
      .filter(item => item.count > 0);
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border shadow-sm bg-white h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Servicios por Tipo</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 h-[320px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  // Make sure we have valid data
  const displayData = chartData?.length > 0 
    ? chartData 
    : [{ tipo: 'Sin datos', count: 1 }];
  
  // Calculate total for percentage
  const total = displayData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="border shadow-sm bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Servicios Local/Foráneo</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="tipo"
            >
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, name: any, props: any) => {
                const percent = ((value / total) * 100).toFixed(1);
                return [`${value} (${percent}%)`, props.payload.tipo];
              }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              formatter={(value, entry, index) => {
                const item = displayData[index];
                return `${item.tipo}: ${item.count}`;
              }}
              wrapperStyle={{ fontSize: 12, paddingLeft: 20 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
