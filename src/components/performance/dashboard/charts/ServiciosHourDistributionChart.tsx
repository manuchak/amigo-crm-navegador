
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
  ResponsiveContainer 
} from 'recharts';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
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

    console.log('Hourly distribution data prepared:', hourCounts);
    
    return hourCounts;
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Distribución por Hora del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    count: { color: "#0EA5E9" } // Ocean Blue
  };

  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Distribución por Hora del Día</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]"> {/* Increased height for better visibility */}
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  interval={2} /* Show every 3rd label to avoid crowding */
                  tick={{ fontSize: 10 }}
                  height={40}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Servicios']}
                  labelFormatter={(label) => `Hora: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Servicios" 
                  fill="#0EA5E9"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
