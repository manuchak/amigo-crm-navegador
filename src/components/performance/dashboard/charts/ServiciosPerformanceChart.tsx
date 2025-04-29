
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
import { format, parseISO, eachDayOfInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiciosPerformanceChartProps {
  data?: any[];
  comparisonData?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function ServiciosPerformanceChart({ data = [], comparisonData, isLoading, dateRange }: ServiciosPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !dateRange.from) {
      console.warn('Missing or invalid data for ServiciosPerformanceChart');
      return [];
    }
    
    // Create a map to group services by day
    const dailyDataMap = new Map();
    
    // Generate all days in the date range to ensure we have entries for days without services
    let allDays = [];
    if (dateRange.from && dateRange.to) {
      allDays = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to
      });
    } else if (dateRange.from) {
      // If only from date is provided, use 90 days range
      allDays = eachDayOfInterval({
        start: dateRange.from,
        end: addDays(dateRange.from, 90)
      });
    }
    
    // Initialize map with all days in range
    allDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      dailyDataMap.set(dayStr, {
        date: dayStr,
        servicios: 0
      });
    });
    
    console.log(`Processing ${data.length} services for chart with ${allDays.length} days in range`);
    console.log('Date range:', {
      from: dateRange.from.toISOString(),
      to: dateRange.to ? dateRange.to.toISOString() : 'undefined'
    });
    
    // Populate with actual data
    data.forEach(servicio => {
      if (!servicio.fecha_hora_cita) return;
      
      try {
        const serviceDate = parseISO(servicio.fecha_hora_cita);
        const dayStr = format(serviceDate, 'yyyy-MM-dd');
        
        // Debug April dates specifically
        if (dayStr.startsWith('2024-04')) {
          console.log('Found April service:', dayStr, servicio.fecha_hora_cita);
        }
        
        // Add to our map whether it's in our initialized range or not
        if (!dailyDataMap.has(dayStr)) {
          // This might happen if the data contains dates outside our specified range
          console.log(`Service date outside initialized range: ${dayStr}`);
          dailyDataMap.set(dayStr, { date: dayStr, servicios: 1 });
        } else {
          // Update counts for dates within range
          const dayData = dailyDataMap.get(dayStr);
          dayData.servicios += 1;
          dailyDataMap.set(dayStr, dayData);
        }
      } catch (error) {
        console.error('Error processing service data:', error, servicio);
      }
    });
    
    // Prepare final data array sorted by date
    const result = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    console.log(`Chart data prepared with ${result.length} days`);
    console.log('First 5 entries:', result.slice(0, 5));
    console.log('Last 5 entries:', result.slice(-5));
    
    // Specifically check for April entries
    const aprilEntries = result.filter(entry => entry.date.startsWith('2024-04'));
    console.log(`April entries: ${aprilEntries.length}`, aprilEntries);
    
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
                dataKey="date" 
                tickFormatter={(date) => {
                  try {
                    return format(parseISO(date), 'dd MMM', { locale: es });
                  } catch (error) {
                    console.error('Error formatting date:', error, date);
                    return date;
                  }
                }} 
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'servicios') return [value, 'Servicios'];
                  return [value, name];
                }}
                labelFormatter={(date) => {
                  try {
                    return format(parseISO(date), 'dd MMM yyyy', { locale: es });
                  } catch (error) {
                    console.error('Error formatting tooltip date:', error, date);
                    return date;
                  }
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
