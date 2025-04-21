
import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface FunnelChartProps {
  byStage: { key: string; label: string; value: number; color: string }[];
}

const FunnelChart: React.FC<FunnelChartProps> = ({ byStage }) => {
  const chartConfig = Object.fromEntries(
    byStage.map((entry) => [entry.key, { color: entry.color }])
  );

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={byStage} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 13, fontWeight: 500, fill: "#334155" }}
            height={22}
          />
          <YAxis allowDecimals={false} />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {byStage.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default FunnelChart;
