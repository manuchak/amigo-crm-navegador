
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
    
    // Debug: Log a sample of services to verify data format
    const sampleServices = data.slice(0, 5);
    console.log('Sample services:', sampleServices.map(s => ({
      id: s.id_servicio || s.id || 'no-id',
      date: s.fecha_hora_cita,
      isDateObject: s.fecha_hora_cita instanceof Date
    })));
    
    // Count service IDs per hour
    data.forEach(service => {
      try {
        if (!service.fecha_hora_cita) {
          console.log('Service missing fecha_hora_cita:', service.id_servicio || 'unknown ID');
          return;
        }
        
        // Extract date and handle timezone correctly
        let dateObj: Date | null = null;
        
        if (typeof service.fecha_hora_cita === 'string') {
          // Try to create a date object from the string
          dateObj = new Date(service.fecha_hora_cita);
          
          // If invalid, try parseISO
          if (isNaN(dateObj.getTime())) {
            try {
              dateObj = parseISO(service.fecha_hora_cita);
            } catch (error) {
              console.error('Error parsing date string:', service.fecha_hora_cita);
              return;
            }
          }
        } else if (service.fecha_hora_cita instanceof Date) {
          dateObj = service.fecha_hora_cita;
        } else {
          console.log('Unrecognized date format:', typeof service.fecha_hora_cita);
          return;
        }
        
        if (!dateObj || isNaN(dateObj.getTime())) {
          console.error('Invalid date for service:', service.id_servicio || 'unknown');
          return;
        }

        // Get the hour in 24-hour format and pad with leading zero if needed
        const hourNum = dateObj.getHours();
        const hour = hourNum.toString().padStart(2, '0');
        
        // Log every 20th service for debugging (to avoid console flood)
        if (Math.random() < 0.05) {
          console.log(`Service ${service.id_servicio || service.id || 'unknown'} at hour ${hour} (${formatHourDisplay(hourNum)}): ${dateObj.toISOString()}`);
        }
        
        // Get a unique ID for this service
        const serviceId = service.id_servicio || service.id || `service-${Math.random()}`;
        
        // Add the service to the appropriate hour bucket
        if (hoursMap[hour]) {
          hoursMap[hour].uniqueServices.add(serviceId);
        } else {
          console.error(`Invalid hour extracted: ${hour}`);
        }
      } catch (error) {
        console.error("Error processing service:", error);
      }
    });
    
    // Log the distribution for debugging
    console.log('Hour distribution:');
    let totalServices = 0;
    Object.entries(hoursMap).forEach(([hour, data]) => {
      const count = data.uniqueServices.size;
      console.log(`Hour ${hour} (${formatHourDisplay(parseInt(hour))}): ${count} services`);
      totalServices += count;
    });
    console.log(`Total services counted: ${totalServices} / ${data.length}`);
    
    // Convert to array for chart display
    const result = Object.values(hoursMap).map(hourData => ({
      hour: hourData.hour,
      displayHour: hourData.displayHour,
      count: hourData.uniqueServices.size
    }));
    
    // Sort by hour
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
