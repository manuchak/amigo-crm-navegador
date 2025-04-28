
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { format, parseISO, isWithinInterval, addMonths, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiciosCohortChartProps {
  data?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function ServiciosCohortChart({ data = [], isLoading, dateRange }: ServiciosCohortChartProps) {
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
    const cohorts: Record<string, { name: string, custodios: string[] }> = {};
    
    custodioNames.forEach(name => {
      const firstServiceDate = getFirstServiceDate(name);
      if (!firstServiceDate) return;
      
      const cohortKey = format(startOfMonth(firstServiceDate), 'yyyy-MM');
      
      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = { 
          name: format(startOfMonth(firstServiceDate), 'MMM yyyy', { locale: es }),
          custodios: []
        };
      }
      
      cohorts[cohortKey].custodios.push(name);
    });
    
    // Get relevant months for retention analysis (up to 6 months)
    const firstCohortDate = Object.keys(cohorts).length > 0 
      ? parseISO(Object.keys(cohorts).sort()[0]) 
      : startOfMonth(subMonths(new Date(), 6));
    
    const months = [];
    const currentDate = new Date();
    
    let tempDate = firstCohortDate;
    while (tempDate <= currentDate) {
      months.push(tempDate);
      tempDate = addMonths(tempDate, 1);
    }
    
    // Calculate retention rates for each cohort
    const retentionData = Object.keys(cohorts).map(cohortKey => {
      const cohortDate = parseISO(cohortKey);
      const cohortCustodios = cohorts[cohortKey].custodios;
      
      const result: any = {
        cohort: cohorts[cohortKey].name,
        size: cohortCustodios.length,
      };
      
      // Calculate retention for each month after the cohort
      months.forEach((month, i) => {
        // Skip months before the cohort started
        if (month < cohortDate) return;
        
        // Calculate months since the cohort started
        const monthsAfter = i - months.indexOf(cohortDate);
        if (monthsAfter > 5) return; // Limit to 6 months (0-5)
        
        // Count active custodios in this month
        const activeCustodios = cohortCustodios.filter(name => 
          wasCustodioActiveInMonth(name, month)
        ).length;
        
        // Calculate retention percentage
        const retention = cohortCustodios.length > 0 
          ? Math.round((activeCustodios / cohortCustodios.length) * 100) 
          : 0;
        
        // Add to result using month number as key
        result[`M${monthsAfter}`] = retention;
      });
      
      return result;
    });
    
    // Filter to only show cohorts with complete data for better visualization
    return retentionData.slice(-5); // Show only the last 5 cohorts for clarity
  }, [data, dateRange]);

  // Generate bars for the cohort chart
  const renderBars = () => {
    const months = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];
    const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
    
    return months.map((month, index) => (
      <Bar 
        key={month}
        dataKey={month} 
        name={`Mes ${index}`} 
        fill={colors[index % colors.length]} 
      />
    ));
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Retención por Cohortes</CardTitle>
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
        <CardTitle className="text-lg font-medium">Retención por Cohortes (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cohortData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cohort" />
              <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Retención']}
                labelFormatter={(label) => `Cohorte: ${label}`}
              />
              <Legend />
              {renderBars()}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Cada barra muestra el % de custodios activos N meses después de su primer servicio
        </div>
      </CardContent>
    </Card>
  );
}
