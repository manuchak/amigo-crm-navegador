
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import PeriodFilter, { PeriodOption } from '../filters/PeriodFilter';
import { subMonths, subYears, startOfYear } from 'date-fns';

interface RetentionChartProps {
  data?: { month: string; rate: number }[];
  isLoading: boolean;
  title?: string;
}

export function RetentionChart({ data = [], isLoading, title = "Tendencia de Retención" }: RetentionChartProps) {
  const [period, setPeriod] = useState<PeriodOption>("6m");
  const [filteredData, setFilteredData] = useState<{ month: string; rate: number }[]>([]);
  
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
        const [year, month] = item.month.split('-').map(Number);
        const itemDate = new Date(year, month - 1); // month is 0-indexed in JS Date
        return itemDate >= startDate;
      } catch (e) {
        console.error("Error parsing date:", item.month);
        return false;
      }
    });
    
    setFilteredData(filtered);
  }, [data, period]);

  // Filter out invalid retention data points for the chart
  const validRetentionData = useMemo(() => 
    filteredData.filter(point => 
      point.rate !== null && 
      point.rate !== undefined && 
      !isNaN(point.rate)
    ),
  [filteredData]);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium">
          {title}
        </CardTitle>
        <PeriodFilter value={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : validRetentionData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={validRetentionData}
                margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
              >
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Retención"]}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Retención"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No hay datos de retención disponibles o los datos contienen valores inválidos (NULL/N/A)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
