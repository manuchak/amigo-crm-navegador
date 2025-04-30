
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TagIcon } from "lucide-react";

interface ServiciosTipoChartProps {
  data: any[];
  isLoading: boolean;
}

export function ServiciosTipoChart({ data = [], isLoading }: ServiciosTipoChartProps) {
  // Process data to count local, foraneo, and unspecified services
  const processedData = React.useMemo(() => {
    const counts = {
      local: 0,
      foraneo: 0,
      unspecified: 0
    };

    data.forEach(item => {
      const localForaneo = item.local_foraneo?.toLowerCase();
      
      if (localForaneo === 'local') {
        counts.local++;
      } else if (localForaneo === 'foraneo' || localForaneo === 'foráneo') {
        counts.foraneo++;
      } else {
        counts.unspecified++;
      }
    });

    const result = [
      { name: 'Local', value: counts.local, color: '#4f46e5' },
      { name: 'Foráneo', value: counts.foraneo, color: '#10b981' }
    ];

    // Only add unspecified if there are any
    if (counts.unspecified > 0) {
      result.push({ name: 'Sin especificar', value: counts.unspecified, color: '#94a3b8' });
    }

    return result;
  }, [data]);

  const totalServicios = processedData.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-blue-500" />
            Servicios por Tipo (Local/Foráneo)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="w-full max-w-md space-y-4">
            <div className="h-40 w-40 rounded-full bg-gray-100 animate-pulse mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalServicios === 0) {
    return (
      <Card className="border-0 shadow-sm h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-blue-500" />
            Servicios por Tipo (Local/Foráneo)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center text-muted-foreground">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <TagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Servicios por Tipo (Local/Foráneo)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[400px]">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} (${((value / totalServicios) * 100).toFixed(1)}%)`, name]}
                labelFormatter={() => ''}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-medium">{totalServicios} servicios</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
