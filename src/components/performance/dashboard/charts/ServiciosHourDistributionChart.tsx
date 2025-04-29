
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
      console.log('No data available for hour distribution chart');
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: 0,
        label: `${i}`
      }));
    }

    console.log(`Processing ${data.length} services for hour distribution`);

    // Initialize hourly buckets (0-23)
    const hourCounts = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      label: `${i}`
    }));

    // Count services by hour
    data.forEach(servicio => {
      if (!servicio.fecha_hora_cita) return;
      
      try {
        // Parse ISO dates properly to ensure timezone handling
        const date = servicio.fecha_hora_cita;
        let serviceDate;
        
        if (typeof date === 'string') {
          serviceDate = parseISO(date);
        } else if (date instanceof Date) {
          serviceDate = date;
        } else {
          console.error('Invalid date format:', date);
          return;
        }
        
        if (isNaN(serviceDate.getTime())) {
          console.error('Invalid date value:', date);
          return;
        }
        
        const hour = serviceDate.getHours();
        
        if (hour >= 0 && hour < 24) {
          hourCounts[hour].count++;
        }
      } catch (error) {
        console.error('Error processing service hour:', error, servicio.fecha_hora_cita);
      }
    });

    // Log data for debugging
    console.log('Hourly distribution data:', 
      hourCounts.filter(h => h.count > 0).map(h => `Hour ${h.hour}: ${h.count} services`).join(', ')
    );
    
    return hourCounts;
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border shadow-sm bg-white h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución por Hora del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Find max count for better visualization
  const maxCount = Math.max(...hourlyData.map(item => item.count));
  
  // Special chart config to highlight peak hours
  const chartConfig = {
    count: { color: "#0EA5E9" }
  };

  return (
    <Card className="border shadow-sm bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución por Hora del Día</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={hourlyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                barCategoryGap={1}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => `${value}`}
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: '#e5e5e5' }}
                  tickLine={false}
                />
                <YAxis 
                  width={30}
                  axisLine={{ stroke: '#e5e5e5' }}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Servicios']}
                  labelFormatter={(hour) => `Hora ${hour}:00`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                    border: 'none',
                    padding: '8px 12px',
                  }}
                />
                <Bar 
                  dataKey="count" 
                  name="Servicios"
                  radius={[2, 2, 0, 0]}
                >
                  {hourlyData.map((entry, index) => {
                    // Special highlight for peak hours
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.count === maxCount ? '#8B5CF6' : '#0EA5E9'} 
                        fillOpacity={entry.count > 0 ? 0.85 + (entry.count / maxCount * 0.15) : 0.5}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
