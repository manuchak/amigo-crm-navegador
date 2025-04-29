
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
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiciosPerformanceChartProps {
  data?: any[];
  comparisonData?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function ServiciosPerformanceChart({ data = [], comparisonData, isLoading, dateRange }: ServiciosPerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !dateRange.from || !dateRange.to) {
      console.warn('Missing or invalid data for ServiciosPerformanceChart');
      return [];
    }
    
    // Create a map to group services by day
    const dailyDataMap = new Map();
    
    // Generate all days in the date range to ensure we have entries for days without services
    const allDays = eachDayOfInterval({
      start: startOfMonth(dateRange.from),
      end: endOfMonth(dateRange.to || dateRange.from)
    });
    
    // Initialize map with all days
    allDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      dailyDataMap.set(dayStr, {
        date: dayStr,
        servicios: 0
      });
    });
    
    // Populate with actual data
    data.forEach(servicio => {
      if (!servicio.fecha_hora_cita) return;
      
      try {
        // Check if this service date is within our range
        const serviceDate = parseISO(servicio.fecha_hora_cita);
        
        if (!isWithinInterval(serviceDate, {
          start: startOfMonth(dateRange.from!),
          end: endOfMonth(dateRange.to || dateRange.from!)
        })) {
          return;
        }
        
        const dayStr = format(serviceDate, 'yyyy-MM-dd');
        const dayData = dailyDataMap.get(dayStr) || {
          date: dayStr,
          servicios: 0
        };
        
        // Update counts
        dayData.servicios += 1;
        
        dailyDataMap.set(dayStr, dayData);
      } catch (error) {
        console.error('Error processing service data:', error, servicio);
      }
    });
    
    // Prepare final data array
    const result = Array.from(dailyDataMap.values());
    
    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
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
                stroke="#8884d8" 
                name="Servicios"
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
