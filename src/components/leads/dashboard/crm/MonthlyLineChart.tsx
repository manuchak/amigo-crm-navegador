
import React from "react";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface MonthlyLineChartProps {
  data: { name: string; Nuevos: number; Calificados: number }[];
}

const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({ data }) => {
  const chartConfig = {
    Nuevos: { color: "#8B5CF6" },
    Calificados: { color: "#33C3F0" }
  };

  // Custom tooltip that doesn't use useChart directly
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-background/95 p-2 border rounded-md shadow-md text-sm">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 13, fontWeight: 500, fill: "#334155" }}
            height={22}
          />
          <YAxis allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Nuevos" 
            stroke="#8B5CF6" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
          />
          <Line 
            type="monotone" 
            dataKey="Calificados" 
            stroke="#33C3F0" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default MonthlyLineChart;
