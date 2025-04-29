
import { useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { format, parseISO, eachDayOfInterval, addDays, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChartDataPoint {
  date: string;
  servicios: number;
  promedio: number;
  displayDate: string;
}

export function usePerformanceChartData(data: any[] = [], dateRange: DateRange) {
  return useMemo(() => {
    if (!data || data.length === 0) {
      console.warn('Missing or invalid data for ServiciosPerformanceChart');
      return [];
    }
    
    console.log(`Processing ${data.length} services for chart with date range:`, {
      from: dateRange?.from ? dateRange.from.toISOString() : 'undefined',
      to: dateRange?.to ? dateRange.to.toISOString() : 'undefined',
    });
    
    // Generate continuous date range
    let allDays: Date[] = [];
    
    if (dateRange?.from && dateRange?.to) {
      try {
        // Use the provided date range
        allDays = eachDayOfInterval({
          start: dateRange.from,
          end: dateRange.to
        });
        console.log(`Date range from ${format(dateRange.from, 'yyyy-MM-dd')} to ${format(dateRange.to, 'yyyy-MM-dd')}`);
      } catch (error) {
        console.error("Error generating date range:", error);
        // Fallback: Use default 90 days
        const today = new Date();
        allDays = eachDayOfInterval({
          start: addDays(today, -89),
          end: today
        });
      }
    } else {
      // Fallback: Use default 90 days
      const today = new Date();
      allDays = eachDayOfInterval({
        start: addDays(today, -89),
        end: today
      });
    }
    
    // Initialize map with all days
    const dailyDataMap = new Map<string, ChartDataPoint>();
    
    allDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      dailyDataMap.set(dayStr, {
        date: dayStr,
        servicios: 0,
        promedio: 0,
        displayDate: format(day, 'd MMM', { locale: es })
      });
    });
    
    // Process all services and count them by day
    if (data && data.length > 0) {
      data.forEach(servicio => {
        if (!servicio.fecha_hora_cita) {
          return;
        }
        
        try {
          // Parse the service date correctly from ISO string
          const date = servicio.fecha_hora_cita;
          let serviceDate;
          
          if (typeof date === 'string') {
            serviceDate = parseISO(date);
          } else if (date instanceof Date) {
            serviceDate = date;
          } else {
            console.error('Invalid date format:', date);
            return;
          }
          
          if (!isValid(serviceDate)) {
            console.error('Invalid date:', servicio.fecha_hora_cita);
            return;
          }
          
          const dayStr = format(serviceDate, 'yyyy-MM-dd');
          
          // Debug logging for date issues
          const month = serviceDate.getMonth();
          if (month === 2) { // March (0-indexed)
            console.log(`March service: ${dayStr}, ID: ${servicio.id}`);
          } else if (month === 3) { // April (0-indexed)
            console.log(`April service: ${dayStr}, ID: ${servicio.id}`);
          }
          
          // Only count if the day exists in our map (within date range)
          if (dailyDataMap.has(dayStr)) {
            const dayData = dailyDataMap.get(dayStr)!;
            dayData.servicios += 1;
          } else {
            console.warn(`Service date ${dayStr} outside charting range`);
          }
        } catch (error) {
          console.error('Error processing service date:', error, servicio.fecha_hora_cita);
        }
      });
    }
    
    // Log days with data to verify distribution
    let daysWithData = 0;
    dailyDataMap.forEach((value) => {
      if (value.servicios > 0) {
        daysWithData++;
      }
    });
    console.log(`Days with data: ${daysWithData} out of ${allDays.length} days`);
    
    // Log data for specific months to troubleshoot
    const marchData = Array.from(dailyDataMap.entries())
      .filter(([key]) => key.startsWith('2025-03'))
      .map(([key, value]) => ({ date: key, count: value.servicios }));
    
    const aprilData = Array.from(dailyDataMap.entries())
      .filter(([key]) => key.startsWith('2025-04'))
      .map(([key, value]) => ({ date: key, count: value.servicios }));
      
    console.log("March data points:", marchData.length, marchData);
    console.log("April data points:", aprilData.length, aprilData);
    
    // Prepare final data array sorted by date
    const result = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
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
}
