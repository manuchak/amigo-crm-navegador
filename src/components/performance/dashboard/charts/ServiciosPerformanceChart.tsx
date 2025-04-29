
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
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO, eachDayOfInterval, addDays, isValid, isBefore, isAfter } from 'date-fns';
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
    
    if (data.length > 0) {
      // Log a few sample dates to verify data
      const sampleDates = data.slice(0, 5).map(s => s.fecha_hora_cita);
      console.log('Sample service dates:', sampleDates);
    }
    
    // Create a map to group services by day
    const dailyDataMap = new Map();
    
    // First pass: Process all data to collect date range
    const allServiceDates = new Set<string>();
    
    data.forEach(servicio => {
      if (!servicio.fecha_hora_cita) return;
      
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
        
        const dayStr = format(serviceDate, 'yyyy-MM-dd');
        allServiceDates.add(dayStr);
      } catch (error) {
        console.error('Error processing date:', error, servicio.fecha_hora_cita);
      }
    });
    
    console.log(`Found ${allServiceDates.size} unique dates in data`);
    if (allServiceDates.size > 0) {
      console.log('Date range in data:', {
        min: Array.from(allServiceDates).sort()[0],
        max: Array.from(allServiceDates).sort()[allServiceDates.size - 1]
      });
    }
    
    // Generate continuous date range including days with no services
    let allDays: Date[] = [];
    
    if (dateRange.from && dateRange.to) {
      // Use the provided date range
      allDays = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to
      });
    } else if (allServiceDates.size > 0) {
      // Fallback: Use min/max dates from the actual data
      const sortedDates = Array.from(allServiceDates).sort();
      const minDate = parseISO(sortedDates[0]);
      const maxDate = parseISO(sortedDates[sortedDates.length - 1]);
      
      allDays = eachDayOfInterval({
        start: minDate,
        end: maxDate
      });
    } else {
      // Last resort: Use default 90 days
      const today = new Date();
      allDays = eachDayOfInterval({
        start: addDays(today, -89),
        end: today
      });
    }
    
    console.log(`Generated ${allDays.length} days for chart from ${allDays[0].toISOString()} to ${allDays[allDays.length-1].toISOString()}`);
    
    // Initialize map with all days
    allDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      dailyDataMap.set(dayStr, {
        date: dayStr,
        servicios: 0,
        // Add formatted date for display
        displayDate: format(day, 'dd MMM', { locale: es })
      });
    });
    
    // Process all services and count them by day
    data.forEach(servicio => {
      if (!servicio.fecha_hora_cita) return;
      
      try {
        let serviceDate;
        
        // Handle both ISO string and Date object formats
        if (typeof servicio.fecha_hora_cita === 'string') {
          serviceDate = parseISO(servicio.fecha_hora_cita);
        } else if (servicio.fecha_hora_cita instanceof Date) {
          serviceDate = servicio.fecha_hora_cita;
        } else {
          return;
        }
        
        if (!isValid(serviceDate)) return;
        
        const dayStr = format(serviceDate, 'yyyy-MM-dd');
        
        // Only count if it's within our display range
        if (dateRange.from && isBefore(serviceDate, dateRange.from)) return;
        if (dateRange.to && isAfter(serviceDate, dateRange.to)) return;
        
        if (dailyDataMap.has(dayStr)) {
          const dayData = dailyDataMap.get(dayStr);
          dayData.servicios += 1;
        } else {
          // This shouldn't happen if our day generation is working correctly
          console.warn(`Found service for date outside generated range: ${dayStr}`);
          dailyDataMap.set(dayStr, { 
            date: dayStr, 
            servicios: 1,
            displayDate: format(serviceDate, 'dd MMM', { locale: es })
          });
        }
      } catch (error) {
        console.error('Error processing service:', error, servicio);
      }
    });
    
    // Prepare final data array sorted by date
    const result = Array.from(dailyDataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`Chart data prepared with ${result.length} days`);
    
    // Check for specific dates like March and April
    const marchData = result.filter(entry => entry.date.startsWith('2024-03') && entry.servicios > 0);
    const aprilData = result.filter(entry => entry.date.startsWith('2024-04') && entry.servicios > 0);
    
    console.log(`March data with services: ${marchData.length}, April data with services: ${aprilData.length}`);
    
    // Verify March 20 onwards data
    const march20Data = result.filter(entry => 
      (entry.date >= '2024-03-20' && entry.date < '2024-04-01') && entry.servicios > 0
    );
    
    console.log(`Services from March 20-31: ${march20Data.length}`);
    if (march20Data.length > 0) {
      console.log('March 20+ data sample:', march20Data.slice(0, 5));
    }
    
    return result;
  }, [data, dateRange]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Rendimiento de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Rendimiento de Servicios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 10 }}
                interval={"preserveStartEnd"}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'servicios') return [value, 'Servicios'];
                  return [value, name];
                }}
                labelFormatter={(displayDate, entry) => {
                  // Use the original date from the data point for better formatting
                  const dataPoint = entry && entry.length > 0 ? entry[0].payload : null;
                  if (dataPoint && dataPoint.date) {
                    return format(parseISO(dataPoint.date), 'dd MMM yyyy', { locale: es });
                  }
                  return displayDate;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="servicios" 
                stroke="#8B5CF6" 
                name="Servicios"
                activeDot={{ r: 6 }} 
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
