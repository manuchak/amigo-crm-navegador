
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import PeriodFilter, { PeriodOption } from '../filters/PeriodFilter';
import { subMonths, subYears, startOfYear } from 'date-fns';

interface RevenueVsCacChartProps {
  data?: Array<{
    month_year: string;
    revenue: number;
    cac: number;
    new_custodios: number;
  }>;
  isLoading: boolean;
}

export function RevenueVsCacChart({ data = [], isLoading }: RevenueVsCacChartProps) {
  const [period, setPeriod] = useState<PeriodOption>("6m");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    // Get current date for calculations
    const now = new Date();
    
    // Calculate start date based on selected period
    let startDate;
    switch (period) {
      case "3m":
        startDate = subMonths(now, 3);
        break;
      case "6m":
        startDate = subMonths(now, 6);
        break;
      case "1y":
        startDate = subMonths(now, 12);
        break;
      case "2y":
        startDate = subYears(now, 2);
        break;
      case "ytd":
        startDate = startOfYear(now);
        break;
      case "all":
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Filter data based on month being after start date
    const filtered = data.filter(item => {
      try {
        const [month, year] = item.month_year.split(' ');
        // Convert month name to number (depends on your data format)
        // This is a simplified approach
        const monthNumber = new Date(`${month} 1, 2000`).getMonth();
        const itemDate = new Date(parseInt(year), monthNumber);
        return itemDate >= startDate;
      } catch (e) {
        console.error("Error parsing date:", item.month_year, e);
        return false;
      }
    });
    
    setFilteredData(filtered);
  }, [data, period]);

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium">
          Ingresos vs Costo de Adquisición
        </CardTitle>
        <PeriodFilter value={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : filteredData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filteredData}
                margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="month_year"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => `$${Math.round(value/1000)}k`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => value}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === "Ingresos" || name === "CAC") {
                      return [formatCurrency(value), name];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Periodo: ${label}`}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  name="Ingresos" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="cac" 
                  name="CAC" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="new_custodios" 
                  name="Nuevos Custodios" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No hay datos disponibles para mostrar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
