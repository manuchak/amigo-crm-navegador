
import { useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { format, parseISO, eachDayOfInterval, isValid, isSameMonth } from 'date-fns';
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
      console.warn('No data provided for ServiciosPerformanceChart');
      return [];
    }
    
    // Generate continuous date range
    if (!dateRange?.from || !dateRange?.to) {
      console.warn('Invalid date range provided');
      return [];
    }

    console.log(`Processing ${data.length} services for chart from ${dateRange.from.toDateString()} to ${dateRange.to.toDateString()}`);
    
    try {
      // Use the provided date range
      const allDays = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to
      });
      
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
      
      // Log what months are in the date range for debugging
      const uniqueMonths = new Set(allDays.map(date => format(date, 'yyyy-MM')));
      console.log("Months included in chart:", Array.from(uniqueMonths));
      
      // Process all services and count them by day
      data.forEach(servicio => {
        if (!servicio.fecha_hora_cita) {
          return;
        }
        
        try {
          // Parse the service date correctly from ISO string
          let serviceDate;
          
          if (typeof servicio.fecha_hora_cita === 'string') {
            serviceDate = parseISO(servicio.fecha_hora_cita);
          } else if (servicio.fecha_hora_cita instanceof Date) {
            serviceDate = servicio.fecha_hora_cita;
          } else {
            return;
          }
          
          if (!isValid(serviceDate)) {
            return;
          }
          
          const dayStr = format(serviceDate, 'yyyy-MM-dd');
          
          // Only count if the day exists in our map (within date range)
          if (dailyDataMap.has(dayStr)) {
            const dayData = dailyDataMap.get(dayStr)!;
            dayData.servicios += 1;
            
            // Debug April data specifically for troubleshooting
            if (isSameMonth(serviceDate, new Date(2025, 3, 1))) { // April is month 3 (zero-indexed)
              console.log(`Found April service: ${dayStr}, ID: ${servicio.id || 'unknown'}`);
            }
          }
        } catch (error) {
          console.error('Error processing service date:', servicio.fecha_hora_cita);
        }
      });
      
      // Debug: count days with data vs total days
      let daysWithData = 0;
      dailyDataMap.forEach(value => {
        if (value.servicios > 0) daysWithData++;
      });
      console.log(`Days with data: ${daysWithData} out of ${allDays.length}`);
      
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
    } catch (error) {
      console.error("Error generating chart data:", error);
      return [];
    }
  }, [data, dateRange]);
}
