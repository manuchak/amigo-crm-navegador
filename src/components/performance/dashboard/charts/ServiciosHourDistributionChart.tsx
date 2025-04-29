
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { parseISO } from 'date-fns';
import { ChartContainer } from "@/components/ui/chart";

interface ServiciosHourDistributionChartProps {
  data?: any[];
  isLoading: boolean;
}

export function ServiciosHourDistributionChart({ data = [], isLoading }: ServiciosHourDistributionChartProps) {
  const hourlyData = useMemo(() => {
    if (!data || data.length === 0) {
      console.warn('Missing or invalid data for ServiciosHourDistributionChart');
      return [];
    }

    // Initialize hourly buckets (0-23)
    const hourCounts = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      label: `${i.toString().padStart(2, '0')}:00`
    }));

    // Count services by hour
    data.forEach(servicio => {
      if (!servicio.fecha_hora_cita) return;
      
      try {
        const serviceDate = parseISO(servicio.fecha_hora_cita);
        const hour = serviceDate.getHours();
        
        hourCounts[hour].count++;
      } catch (error) {
        console.error('Error processing service hour data:', error, servicio);
      }
    });
    
    return hourCounts;
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución por Hora del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    count: { color: "#0EA5E9" }
  };

  // Find peak hours for highlighting
  const maxCount = Math.max(...hourlyData.map(item => item.count));
  
  return (
    <Card className="border-0 shadow-sm w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución por Hora del Día</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 5, left: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  interval={2}
                  tick={{ fontSize: 10 }}
                  tickMargin={10}
                  axisLine={{ stroke: '#e5e5e5' }}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#e5e5e5' }}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Servicios']}
                  labelFormatter={(label) => `Hora: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Bar 
                  dataKey="count" 
                  name="Servicios" 
                >
                  {hourlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count === maxCount ? '#8B5CF6' : '#0EA5E9'} 
                      fillOpacity={entry.count / maxCount * 0.9 + 0.1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
