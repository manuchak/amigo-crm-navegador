
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
        servicios: 0,
        kmPromedio: 0,
        totalKm: 0,
        duracionPromedio: 0, // in minutes
        totalDuracion: 0,
        serviciosConKm: 0,
        serviciosConDuracion: 0
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
          servicios: 0,
          kmPromedio: 0,
          totalKm: 0,
          duracionPromedio: 0,
          totalDuracion: 0,
          serviciosConKm: 0,
          serviciosConDuracion: 0
        };
        
        // Update counts and totals
        dayData.servicios += 1;
        
        // Handle KM data
        if (servicio.km_recorridos) {
          dayData.totalKm += servicio.km_recorridos;
          dayData.serviciosConKm += 1;
        }
        
        // Handle duration data - parse from interval format
        if (servicio.duracion_servicio) {
          let durationMinutes = 0;
          
          if (typeof servicio.duracion_servicio === 'string') {
            // Extract hours
            const hoursMatch = servicio.duracion_servicio.match(/(\d+)\s*hours?/);
            if (hoursMatch && hoursMatch[1]) {
              durationMinutes += parseInt(hoursMatch[1], 10) * 60;
            }
            
            // Extract minutes
            const minsMatch = servicio.duracion_servicio.match(/(\d+)\s*minutes?/);
            if (minsMatch && minsMatch[1]) {
              durationMinutes += parseInt(minsMatch[1], 10);
            }
          }
          
          dayData.totalDuracion += durationMinutes;
          dayData.serviciosConDuracion += 1;
        }
        
        dailyDataMap.set(dayStr, dayData);
      } catch (error) {
        console.error('Error processing service data:', error, servicio);
      }
    });
    
    // Calculate averages and prepare final data array
    const result = Array.from(dailyDataMap.values()).map(day => ({
      ...day,
      kmPromedio: day.serviciosConKm > 0 ? Math.round(day.totalKm / day.serviciosConKm) : 0,
      duracionPromedio: day.serviciosConDuracion > 0 ? Math.round(day.totalDuracion / day.serviciosConDuracion / 60 * 10) / 10 : 0 // Convert to hours with 1 decimal
    }));
    
    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [data, dateRange]);

  // Process comparison data if available
  const comparisonChartData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0 || !dateRange.from || !dateRange.to) {
      return [];
    }
    
    // Similar processing for comparison data
    // This would need to be implemented based on the structure of your comparison data
    
    return []; // Return processed comparison data here
  }, [comparisonData, dateRange]);

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
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'servicios') return [value, 'Servicios'];
                  if (name === 'kmPromedio') return [value, 'KM Promedio'];
                  if (name === 'duracionPromedio') return [`${value} hrs`, 'Duración Promedio'];
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
                yAxisId="left"
                type="monotone" 
                dataKey="servicios" 
                stroke="#8884d8" 
                name="Servicios"
                activeDot={{ r: 6 }} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="kmPromedio" 
                stroke="#4CAF50" 
                name="KM Promedio" 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="duracionPromedio" 
                stroke="#FF9800" 
                name="Duración Promedio (hrs)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
