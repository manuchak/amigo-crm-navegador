
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface HourData {
  hour: string;
  count: number;
  displayHour: string;
  uniqueServices: Set<string>;
}

interface ServiciosHourDistributionChartProps {
  data?: any[];
  isLoading: boolean;
}

export function ServiciosHourDistributionChart({ data = [], isLoading }: ServiciosHourDistributionChartProps) {
  // Process data to extract hourly distribution with unique service IDs
  const hourlyData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Initialize hours (0-23)
    const hoursMap: Record<string, HourData> = {};
    for (let i = 0; i < 24; i++) {
      const hourString = i.toString().padStart(2, '0');
      hoursMap[hourString] = {
        hour: hourString,
        count: 0,
        displayHour: formatHourDisplay(i),
        uniqueServices: new Set<string>()
      };
    }

    console.log(`Processing ${data.length} services for hour distribution`);
    
    // Debug: Log the first few service dates to verify the format
    const sampleServices = data.slice(0, 5);
    console.log('Sample services:', sampleServices.map(s => ({
      id: s.id_servicio || s.id || 'no-id',
      date: s.fecha_hora_cita,
      type: typeof s.fecha_hora_cita
    })));
    
    // Count service IDs per hour
    data.forEach(service => {
      try {
        if (!service.fecha_hora_cita) {
          console.log('Service missing fecha_hora_cita:', service.id_servicio || 'unknown ID');
          return;
        }
        
        // Handle different date formats and types
        let serviceDate: Date;
        let rawDate = service.fecha_hora_cita;
        
        if (typeof rawDate === 'string') {
          // Try to parse with native Date first (better timezone handling)
          serviceDate = new Date(rawDate);
          
          // If invalid, try parseISO as fallback
          if (isNaN(serviceDate.getTime())) {
            serviceDate = parseISO(rawDate);
          }
        } else if (rawDate instanceof Date) {
          serviceDate = rawDate;
        } else {
          console.log('Unrecognized date format:', rawDate);
          return;
        }
        
        if (isNaN(serviceDate.getTime())) {
          console.log('Invalid date for service:', service.id_servicio || 'unknown ID');
          return;
        }
        
        // Extract the hour in 24-hour format and pad with leading zero if needed
        const hourNum = serviceDate.getHours();
        const hour = hourNum.toString().padStart(2, '0');
        
        // Log for debugging
        if (Math.random() < 0.05) { // Only log ~5% of dates to avoid console flood
          console.log(`Service ${service.id_servicio || 'unknown'}: Date=${serviceDate.toISOString()}, Hour=${hour}`);
        }
        
        // Add the service ID to the set for this hour
        const serviceId = service.id_servicio || service.id || `service-${Math.random()}`;
        
        if (hoursMap[hour]) {
          hoursMap[hour].uniqueServices.add(serviceId);
        } else {
          console.error(`Invalid hour extracted: ${hour}`);
        }
      } catch (error) {
        console.error("Error processing service date:", service.fecha_hora_cita, error);
      }
    });
    
    // Debug: Log the counts for each hour
    console.log('Hour distribution:');
    let totalCounted = 0;
    Object.entries(hoursMap).forEach(([hour, data]) => {
      const count = data.uniqueServices.size;
      console.log(`Hour ${hour} (${formatHourDisplay(parseInt(hour))}): ${count} services`);
      totalCounted += count;
    });
    console.log(`Total services counted in hour distribution: ${totalCounted} / ${data.length}`);
    
    // Convert to array for chart display
    const result = Object.values(hoursMap).map(hourData => ({
      hour: hourData.hour,
      displayHour: hourData.displayHour,
      count: hourData.uniqueServices.size
    }));
    
    // Sort by hour for chart display
    return result.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [data]);
  
  // Format hour for display (12-hour format with am/pm)
  function formatHourDisplay(hourNum: number): string {
    if (hourNum === 0) return '12 AM';
    else if (hourNum === 12) return '12 PM';
    else if (hourNum < 12) return `${hourNum} AM`;
    else return `${hourNum - 12} PM`;
  }
  
  // Find the hour with the most services
  const maxCount = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return 0;
    return Math.max(...hourlyData.map(item => item.count));
  }, [hourlyData]);
  
  // Find the peak hour for badge display
  const peakHour = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return null;
    const maxItem = hourlyData.reduce((max, item) => 
      item.count > max.count ? item : max, 
      { hour: '00', count: 0, displayHour: '12 AM' }
    );
    return maxItem;
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Distribución de Servicios por Hora</CardTitle>
          {peakHour && peakHour.count > 0 && (
            <Badge variant="primary">
              Pico: {peakHour.displayHour} ({peakHour.count})
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 h-[320px]">
        {hourlyData.every(item => item.count === 0) ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No hay datos para mostrar en el rango de fechas seleccionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 30,
              }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="displayHour" 
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, maxCount > 0 ? Math.ceil(maxCount * 1.1) : 10]} 
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
                labelFormatter={(hour) => `Hora: ${hour}`}
              />
              <Bar 
                dataKey="count" 
                fill="#0EA5E9" 
                radius={[4, 4, 0, 0]}
                name="Servicios"
                label={{ 
                  position: 'top', 
                  fontSize: 10, 
                  fill: '#666', 
                  formatter: (value: number) => (value > 0 ? value.toString() : '') 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
