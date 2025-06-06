
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
  
  // Debug logs to understand what data we're receiving
  useEffect(() => {
    console.log("RetentionChart: Initial data received:", data);
    console.log("RetentionChart: Initial data length:", data?.length);
    
    if (data && data.length > 0) {
      const validCount = data.filter(item => 
        item && item.rate !== null && item.rate !== undefined && !isNaN(item.rate)
      ).length;
      
      console.log("RetentionChart: Valid data points count:", validCount);
    }
  }, [data]);
  
  useEffect(() => {
    if (!data || data.length === 0) {
      console.log("RetentionChart: No data available to filter");
      setFilteredData([]);
      return;
    }
    
    // First filter out any invalid data points (null, undefined, NaN)
    const validData = data.filter(item => 
      item &&
      typeof item.rate === 'number' && 
      !isNaN(item.rate)
    );
    
    console.log(`RetentionChart: Found ${validData.length} valid data points out of ${data.length}`);
    
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
    
    console.log(`RetentionChart: Filtering by period ${period}, start date: ${startDate.toISOString()}`);
    
    // Then filter based on date range
    const dateFiltered = validData.filter(item => {
      try {
        if (!item.month) return false;
        
        // Handle different date formats that might be coming in
        let itemDate;
        if (item.month.includes('-')) {
          const [year, month] = item.month.split('-').map(Number);
          itemDate = new Date(year, month - 1); // month is 0-indexed in JS Date
        } else {
          // Try to parse the date directly
          itemDate = new Date(item.month);
          // If invalid, return false
          if (isNaN(itemDate.getTime())) return false;
        }
        
        return itemDate >= startDate;
      } catch (e) {
        console.error("Error parsing date:", item.month, e);
        return false;
      }
    });
    
    console.log(`RetentionChart: After date filtering, ${dateFiltered.length} points remain`);
    if (dateFiltered.length > 0) {
      console.log("RetentionChart: First filtered data point:", dateFiltered[0]);
    }
    
    setFilteredData(dateFiltered);
  }, [data, period]);

  // Check if we have valid data after filtering
  const hasValidData = useMemo(() => 
    filteredData && filteredData.length > 0
  , [filteredData]);

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
        ) : hasValidData ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
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
            <p className="text-muted-foreground">No hay datos de retención disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
