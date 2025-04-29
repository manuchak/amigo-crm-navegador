
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DriverScore } from "../types/driver-behavior.types";
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
import { calculateScoreCategory, getScoreColorClass } from "../utils/scoreCalculator";

interface DriverBehaviorChartProps {
  data?: DriverScore[] | null;
  isLoading: boolean;
  dateRange: DateRange;
}

export function DriverBehaviorChart({ data, isLoading, dateRange }: DriverBehaviorChartProps) {
  // Process data for the chart
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Group by driver group and calculate average scores
    const groupedData = data.reduce<Record<string, { score: number, count: number, penaltyPoints: number }>>((acc, item) => {
      if (!acc[item.driver_group]) {
        acc[item.driver_group] = { score: 0, count: 0, penaltyPoints: 0 };
      }
      
      acc[item.driver_group].score += item.score;
      acc[item.driver_group].count += 1;
      acc[item.driver_group].penaltyPoints += item.penalty_points;
      
      return acc;
    }, {});
    
    // Convert to array and calculate averages
    return Object.entries(groupedData).map(([group, stats]) => ({
      name: group,
      score: parseFloat((stats.score / stats.count).toFixed(1)),
      penaltyPoints: stats.penaltyPoints,
      driverCount: stats.count,
      category: calculateScoreCategory(stats.score / stats.count)
    })).sort((a, b) => a.score - b.score); // Sort by score ascending
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
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Puntuación por Grupo</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Puntuación por Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            No hay datos disponibles para el período seleccionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Puntuación por Grupo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]} 
                label={{ 
                  value: 'Puntuación', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip 
                formatter={(value, name) => [value, name === 'score' ? 'Puntuación' : 'Puntos']}
                labelFormatter={(value) => `Grupo: ${value}`}
              />
              <Bar 
                dataKey="score" 
                name="Puntuación" 
                isAnimationActive={false}
                minPointSize={3}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={colorMap[entry.category]}
                  />
                ))}
                <LabelList 
                  dataKey="score" 
                  position="top" 
                  formatter={(value: number) => `${value}`}
                  style={{ fontSize: 12, fill: '#6b7280' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
