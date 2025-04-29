
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from 'date-fns';

interface HourData {
  hour: string;
  count: number;
  displayHour: string;
}

interface ServiciosHourDistributionChartProps {
  data?: any[];
  isLoading: boolean;
}

export function ServiciosHourDistributionChart({ data = [], isLoading }: ServiciosHourDistributionChartProps) {
  // Process data to extract hourly distribution
  const hourlyData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Initialize hours (0-23)
    const hours: { [key: string]: number } = {};
    for (let i = 0; i < 24; i++) {
      const hourString = i.toString().padStart(2, '0');
      hours[hourString] = 0;
    }

    // Count services per hour
    data.forEach(service => {
      if (service.fecha_hora_cita) {
        try {
          const date = parseISO(service.fecha_hora_cita);
          const hour = format(date, 'HH');
          if (hours[hour] !== undefined) {
            hours[hour] += 1;
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }
    });
    
    // Convert to array for chart
    return Object.entries(hours).map(([hour, count]) => {
      const hourNum = parseInt(hour, 10);
      // Format for display (12-hour format with am/pm)
      let displayHour;
      if (hourNum === 0) displayHour = '12 AM';
      else if (hourNum === 12) displayHour = '12 PM';
      else if (hourNum < 12) displayHour = `${hourNum} AM`;
      else displayHour = `${hourNum - 12} PM`;
      
      return { hour, count, displayHour };
    });
  }, [data]);
  
  // Find the hour with the most services
  const maxCount = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return 0;
    return Math.max(...hourlyData.map(item => item.count));
  }, [hourlyData]);

  if (isLoading) {
    return (
      <Card className="border shadow-sm bg-white h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Distribución de Servicios por Hora</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 h-[320px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Distribución de Servicios por Hora</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={hourlyData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 30,
            }}
            barSize={10}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="displayHour" 
              tick={{ fontSize: 10 }}
              interval={1}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={[0, maxCount > 0 ? maxCount * 1.1 : 10]} 
              allowDecimals={false}
              tick={{ fontSize: 10 }}
              width={30}
            />
            <Tooltip
              formatter={(value) => [`${value} servicios`, 'Cantidad']}
              contentStyle={{
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                border: 'none',
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#0EA5E9" 
              radius={[10, 10, 0, 0]}
              name="Servicios"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
