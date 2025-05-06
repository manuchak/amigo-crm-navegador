import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DriverScore, DriverBehaviorFilters } from "../types/driver-behavior.types";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";
import { calculateScoreCategory } from "../utils/scoreCalculator";

interface ChartProps {
  data?: DriverScore[] | null;
  isLoading: boolean;
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
}

export function DriverBehaviorChart({ data, isLoading, dateRange, filters }: ChartProps) {
  // Process data for the chart
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Group by driver group and calculate average scores
    const groupedData = data.reduce<Record<string, { score: number, count: number, penaltyPoints: number }>>((acc, item) => {
      const groupName = item.driver_group || 'Sin grupo';
      
      if (!acc[groupName]) {
        acc[groupName] = { score: 0, count: 0, penaltyPoints: 0 };
      }
      
      acc[groupName].score += Number(item.score || 0);
      acc[groupName].count += 1;
      acc[groupName].penaltyPoints += Number(item.penalty_points || 0);
      
      return acc;
    }, {});
    
    // Convert to array and calculate averages
    return Object.entries(groupedData)
      .map(([group, stats]) => ({
        name: group,
        score: parseFloat((stats.score / stats.count).toFixed(1)),
        penaltyPoints: stats.penaltyPoints,
        driverCount: stats.count,
        category: calculateScoreCategory(stats.score / stats.count)
      }))
      .sort((a, b) => b.score - a.score); // Sort by score descending
  }, [data]);
  
  const colorMap: Record<string, string> = {
    excellent: '#22c55e', // green-500
    good: '#10b981',     // emerald-500
    fair: '#f59e0b',     // amber-500  
    poor: '#f97316',     // orange-500
    critical: '#ef4444'  // red-500
  };

  if (isLoading) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Puntuación por Grupo</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="w-full h-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Puntuación por Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 h-64 text-gray-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-gray-300 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            No hay datos disponibles para el período seleccionado
          </div>
        </CardContent>
      </Card>
    );
  }

  const dateRangeText = dateRange.from && dateRange.to 
    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
    : 'Período actual';

  return (
    <Card className="border shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Puntuación por Grupo</CardTitle>
        <p className="text-xs text-muted-foreground">{dateRangeText}</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis 
                domain={[0, 100]} 
                label={{ 
                  value: 'Puntuación', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 12 }
                }}
                tickMargin={8}
              />
              <Tooltip 
                formatter={(value, name) => [value, name === 'score' ? 'Puntuación' : 'Puntos']}
                labelFormatter={(value) => `Grupo: ${value}`}
                contentStyle={{ 
                  borderRadius: '8px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.97)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              />
              <Bar 
                dataKey="score" 
                name="Puntuación" 
                isAnimationActive={true}
                animationDuration={1200}
                minPointSize={3}
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={colorMap[entry.category]}
                    fillOpacity={0.9}
                    strokeWidth={0}
                  />
                ))}
                <LabelList 
                  dataKey="score" 
                  position="top" 
                  formatter={(value: number) => `${value}`}
                  style={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
