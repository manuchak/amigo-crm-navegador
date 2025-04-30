
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface HourData {
  hour: string; // 24-hour format, e.g., "04"
  count: number;
  displayHour: string; // formatted display, e.g., "4 AM"
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
    const hoursMap: Record<string, { count: number, displayHour: string }> = {};
    for (let i = 0; i < 24; i++) {
      const hourString = i.toString().padStart(2, '0');
      hoursMap[hourString] = {
        count: 0,
        displayHour: formatHourDisplay(i)
      };
    }

    console.log(`Processing ${data.length} services for hour distribution`);
    
    // Count services per hour
    data.forEach(service => {
      try {
        if (!service.fecha_hora_cita) {
          return;
        }
        
        // Parse the date string as local time to maintain the original hour
        // This assumes dates are stored with Mexico City timezone (UTC-6)
        let dateStr = service.fecha_hora_cita;
        let serviceDate: Date;
        
        if (typeof dateStr === 'string') {
          // Create a date object without timezone conversion
          // This is important because we want to preserve the original hour as stored
          
          // First try ISO format
          if (dateStr.includes('T') || dateStr.includes(' ')) {
            // Parse the date while preserving local time
            const parts = dateStr.replace('T', ' ').split(' ');
            const datePart = parts[0];
            const timePart = parts[1].split('.')[0]; // Remove milliseconds if any
            
            const [year, month, day] = datePart.includes('-') 
              ? datePart.split('-')
              : datePart.split('/').reverse();
            
            const [hour, minute, second = '00'] = timePart.split(':');
            
            // Create date using local components (no timezone conversion)
            serviceDate = new Date(
              parseInt(year),
              parseInt(month) - 1, // Month is 0-indexed in JS
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second)
            );
          } else {
            // Fallback to standard date parsing
            serviceDate = new Date(dateStr);
          }
        } else if (service.fecha_hora_cita instanceof Date) {
          serviceDate = service.fecha_hora_cita;
        } else {
          console.error('Unrecognized date format:', typeof service.fecha_hora_cita);
          return;
        }
        
        if (!serviceDate || isNaN(serviceDate.getTime())) {
          console.error('Invalid date for service:', service.id_servicio || 'unknown');
          return;
        }

        // Extract hour (0-23)
        const hourNum = serviceDate.getHours();
        const hour = hourNum.toString().padStart(2, '0');
        
        // Log service details for debugging
        if (hourNum === 4) { // Log all services at 4 AM for verification
          console.log(`Found 4 AM service: ${service.id_servicio || service.id || 'unknown'} at ${serviceDate.toISOString()}`);
        }
        
        // Increment the count for this hour
        if (hoursMap[hour]) {
          hoursMap[hour].count += 1;
        }
      } catch (error) {
        console.error("Error processing service:", error);
      }
    });
    
    // Log the distribution for debugging
    console.log('Hour distribution:');
    let totalServices = 0;
    Object.entries(hoursMap).forEach(([hour, data]) => {
      console.log(`Hour ${hour} (${data.displayHour}): ${data.count} services`);
      totalServices += data.count;
    });
    console.log(`Total services counted: ${totalServices} / ${data.length}`);
    
    // Convert to array for chart display and sort by hour
    const result = Object.entries(hoursMap).map(([hour, data]) => ({
      hour,
      count: data.count,
      displayHour: data.displayHour
    }));
    
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
  const peakHour = useMemo(() => {
    if (!hourlyData || hourlyData.length === 0) return null;
    
    // Find the maximum count
    const maxItem = hourlyData.reduce((max, item) => 
      item.count > max.count ? item : max, 
      { hour: '00', count: 0, displayHour: '12 AM' }
    );
    
    console.log(`Peak hour detected: ${maxItem.displayHour} with ${maxItem.count} services`);
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
                domain={[0, peakHour ? Math.ceil(peakHour.count * 1.1) : 10]} 
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
