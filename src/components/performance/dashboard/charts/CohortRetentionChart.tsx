
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { format, parseISO, isWithinInterval, addMonths, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface CohortRetentionChartProps {
  data?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function CohortRetentionChart({ data = [], isLoading, dateRange }: CohortRetentionChartProps) {
  const cohortData = useMemo(() => {
    if (!data || data.length === 0 || !dateRange.from) return [];
    
    // Function to get first service date for each custodio
    const getFirstServiceDate = (custodioName: string) => {
      const custodioServices = data.filter(s => s.nombre_custodio === custodioName && s.fecha_hora_cita);
      if (custodioServices.length === 0) return null;
      
      // Sort by date and get the earliest
      custodioServices.sort((a, b) => 
        new Date(a.fecha_hora_cita).getTime() - new Date(b.fecha_hora_cita).getTime()
      );
      
      return parseISO(custodioServices[0].fecha_hora_cita);
    };
    
    // Function to check if custodio was active in a specific month
    const wasCustodioActiveInMonth = (custodioName: string, month: Date) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      return data.some(s => 
        s.nombre_custodio === custodioName && 
        s.fecha_hora_cita && 
        isWithinInterval(parseISO(s.fecha_hora_cita), { start: monthStart, end: monthEnd })
      );
    };
    
    // Get all unique custodio names
    const custodioNames = Array.from(new Set(
      data
        .filter(s => s.nombre_custodio)
        .map(s => s.nombre_custodio)
    ));
    
    // Group custodios by their first service month (cohort)
    const cohorts: Record<string, { name: string, custodios: string[], size: number }> = {};
    
    custodioNames.forEach(name => {
      const firstServiceDate = getFirstServiceDate(name);
      if (!firstServiceDate) return;
      
      const cohortKey = format(startOfMonth(firstServiceDate), 'yyyy-MM');
      
      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = { 
          name: format(startOfMonth(firstServiceDate), 'MMM yyyy', { locale: es }),
          custodios: [],
          size: 0
        };
      }
      
      cohorts[cohortKey].custodios.push(name);
      cohorts[cohortKey].size += 1;
    });
    
    // Get months for analysis (current and previous 11 months)
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      months.push(startOfMonth(subMonths(currentDate, i)));
    }
    
    // Format the data for the table
    const formattedData = Object.keys(cohorts)
      .sort()
      .map(cohortKey => {
        const cohort = cohorts[cohortKey];
        const cohortDate = parseISO(cohortKey);
        const result: any = {
          cohort: cohort.name,
          size: cohort.size,
        };
        
        // Calculate retention for each month
        months.forEach(month => {
          // Skip future months relative to the cohort
          if (month < cohortDate) return;
          
          // Calculate month index for column name
          const monthIndex = months.findIndex(m => 
            m.getMonth() === month.getMonth() && 
            m.getFullYear() === month.getFullYear()
          );
          
          if (monthIndex === -1) return;
          
          // Count active custodios in this month
          const activeCustodios = cohort.custodios.filter(name => 
            wasCustodioActiveInMonth(name, month)
          ).length;
          
          // Calculate retention percentage
          const retention = cohort.custodios.length > 0 
            ? Math.round((activeCustodios / cohort.custodios.length) * 100) 
            : 0;
          
          // Add to result as percentage
          result[`M${monthIndex}`] = retention;
        });
        
        return result;
      })
      .filter(row => Object.keys(row).length > 2) // Filter out cohorts with no retention data
      .slice(-12); // Show only the last 12 cohorts
      
    return formattedData;
  }, [data, dateRange]);

  // Generate column headers for the months
  const monthHeaders = useMemo(() => {
    const headers = [];
    if (!dateRange.from) return headers;
    
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(currentDate, i);
      headers.push({
        key: `M${11-i}`,
        label: format(month, 'MMM', { locale: es }),
      });
    }
    
    return headers;
  }, [dateRange]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Análisis de Cohorte</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Análisis de Cohorte - Retención de Custodios (%)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left bg-muted/50 font-medium">Cohorte</th>
                <th className="py-2 px-4 text-center bg-muted/50 font-medium">Custodios</th>
                {monthHeaders.map((header) => (
                  <th key={header.key} className="py-2 px-4 text-center bg-muted/50 font-medium">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.length === 0 ? (
                <tr>
                  <td colSpan={monthHeaders.length + 2} className="py-4 text-center text-muted-foreground">
                    No hay datos de cohorte disponibles para el período seleccionado
                  </td>
                </tr>
              ) : (
                cohortData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-muted/20" : ""}>
                    <td className="py-2 px-4 font-medium">{row.cohort}</td>
                    <td className="py-2 px-4 text-center">{row.size}</td>
                    {monthHeaders.map((header) => {
                      const value = row[header.key];
                      // Determine color based on retention percentage
                      const getColorClass = (value: number) => {
                        if (value === undefined) return "bg-muted/20";
                        if (value >= 80) return "bg-green-100";
                        if (value >= 60) return "bg-green-50";
                        if (value >= 40) return "bg-yellow-50";
                        if (value >= 20) return "bg-orange-50";
                        return "bg-red-50";
                      };
                      
                      return (
                        <td 
                          key={header.key} 
                          className={`py-2 px-4 text-center ${getColorClass(value)}`}
                        >
                          {value !== undefined ? `${value}%` : "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-muted-foreground mt-4 text-center">
          Cada celda muestra el % de custodios activos en ese mes respecto al total de la cohorte inicial
        </div>
      </CardContent>
    </Card>
  );
}
