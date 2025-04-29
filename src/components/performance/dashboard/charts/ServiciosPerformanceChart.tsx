
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format, parseISO, eachDayOfInterval, addDays, isValid, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiciosPerformanceChartProps {
  data?: any[];
  comparisonData?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function ServiciosPerformanceChart({ data = [], comparisonData, isLoading, dateRange }: ServiciosPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      console.warn('Missing or invalid data for ServiciosPerformanceChart');
      return [];
    }
    
    // Debug log to see what data we're working with
    console.log(`Processing ${data.length} services for chart with date range:`, {
      from: dateRange.from ? dateRange.from.toISOString() : 'undefined',
      to: dateRange.to ? dateRange.to.toISOString() : 'undefined'
    });
    
    // FIX 3: Generate continuous date range including days with no services
    let allDays: Date[] = [];
    
    if (dateRange.from && dateRange.to) {
      // Use the provided date range
      allDays = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to
      });
      
      // Log the first and last day to verify the range is correctly set
      console.log(`Date range from ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`);
    } else {
      // Fallback: Use default 90 days
      const today = new Date();
      allDays = eachDayOfInterval({
        start: addDays(today, -89),
        end: today
      });
    }
    
    console.log(`Generated ${allDays.length} days for chart from ${format(allDays[0], 'yyyy-MM-dd')} to ${format(allDays[allDays.length-1], 'yyyy-MM-dd')}`);
    
    // Initialize map with all days
    const dailyDataMap = new Map();
    
    allDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      dailyDataMap.set(dayStr, {
        date: dayStr,
        servicios: 0,
        // Add formatted date for display
        displayDate: format(day, 'd MMM', { locale: es })
      });
    });
    
    // Process all services and count them by day
    data.forEach(servicio => {
      if (!servicio.fecha_hora_cita) {
        console.log("Skipping service with missing fecha_hora_cita");
        return;
      }
      
      try {
        let serviceDate;
        
        // Handle both ISO string and Date object formats
        if (typeof servicio.fecha_hora_cita === 'string') {
          serviceDate = parseISO(servicio.fecha_hora_cita);
        } else if (servicio.fecha_hora_cita instanceof Date) {
          serviceDate = servicio.fecha_hora_cita;
        } else {
          console.error('Unsupported date format:', servicio.fecha_hora_cita);
          return;
        }
        
        if (!isValid(serviceDate)) {
          console.error('Invalid date:', servicio.fecha_hora_cita);
          return;
        }
        
        // Debug log for March 20+ data
        if (serviceDate >= parseISO('2024-03-20')) {
          console.log(`Found service after March 20: ${format(serviceDate, 'yyyy-MM-dd')}`);
        }
        
        const dayStr = format(serviceDate, 'yyyy-MM-dd');
        
        if (dailyDataMap.has(dayStr)) {
          const dayData = dailyDataMap.get(dayStr);
          dayData.servicios += 1;
        } else {
          console.log(`Service date ${dayStr} not in range ${format(allDays[0], 'yyyy-MM-dd')} to ${format(allDays[allDays.length-1], 'yyyy-MM-dd')}`);
        }
      } catch (error) {
        console.error('Error processing service date:', error, servicio.fecha_hora_cita);
      }
    });
    
    // Log days with data to verify distribution
    let daysWithData = 0;
    dailyDataMap.forEach((value, key) => {
      if (value.servicios > 0) {
        daysWithData++;
      }
    });
    console.log(`Days with data: ${daysWithData} out of ${allDays.length} days`);
    
    // Prepare final data array sorted by date
    const result = Array.from(dailyDataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Add 7-day moving average
    const windowSize = 7;
    for (let i = 0; i < result.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
        sum += result[j].servicios;
        count++;
      }
      
      result[i].promedio = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
    }
    
    return result;
  }, [data, dateRange]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Rendimiento de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Get min and max values for better Y-axis
  const maxServicios = Math.max(...chartData.map(item => item.servicios), 0);
  const yAxisMax = Math.ceil(maxServicios * 1.1); // Add 10% padding

  // Calculate average for reference line
  const average = chartData.length > 0 
    ? chartData.reduce((sum, item) => sum + item.servicios, 0) / chartData.length
    : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Rendimiento de Servicios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                tickMargin={10}
                axisLine={{ stroke: '#e5e5e5' }}
              />
              <YAxis 
                domain={[0, yAxisMax]}
                axisLine={{ stroke: '#e5e5e5' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: 'none' 
                }}
                formatter={(value, name) => {
                  if (name === 'servicios') return [`${value}`, 'Servicios'];
                  if (name === 'promedio') return [`${value}`, 'Promedio (7 días)'];
                  return [value, name];
                }}
                labelFormatter={(displayDate) => {
                  const matchingData = chartData.find(item => item.displayDate === displayDate);
                  if (matchingData) {
                    return format(parseISO(matchingData.date), 'dd MMM yyyy', { locale: es });
                  }
                  return displayDate;
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={40}
                iconType="circle"
                iconSize={8}
              />
              <ReferenceLine 
                y={average} 
                stroke="#9b87f5" 
                strokeDasharray="3 3" 
                label={{ 
                  value: `Promedio: ${average.toFixed(1)}`, 
                  fill: '#9b87f5',
                  fontSize: 11,
                  position: 'right'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="servicios" 
                stroke="#0EA5E9" 
                name="Servicios"
                strokeWidth={2}
                dot={false} 
                activeDot={{ r: 6, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="promedio" 
                stroke="#8B5CF6" 
                name="Promedio (7 días)"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
