
import React from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, LabelList } from "recharts";
import { useTimeMetrics } from "./crmUtils";
import { Lead } from "@/context/LeadsContext";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface StageTimeBarChartProps {
  leads: Lead[];
}

const StageTimeBarChart: React.FC<StageTimeBarChartProps> = ({ leads }) => {
  const data = useTimeMetrics(leads);
  
  const chartConfig = {
    avgDays: { color: "#F59E42" }
  };
  
  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={60}
            fontSize={12}
          />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="avgDays"
            fill="#F59E42"
            radius={[4, 4, 0, 0]}
          >
            <LabelList dataKey="avgDays" position="top" formatter={(value: number) => value.toFixed(1)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default StageTimeBarChart;
