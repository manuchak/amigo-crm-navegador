
import React from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { useTimeMetrics } from "./crmUtils";
import { Lead } from "@/context/LeadsContext";
import StageNameTick from "./StageNameTick";
import BarValueLabel from "./BarValueLabel";

interface StageTimeBarChartProps {
  leads: Lead[];
}

const StageTimeBarChart: React.FC<StageTimeBarChartProps> = ({ leads }) => (
  <div className="flex-1 bg-white border rounded-xl shadow p-6 flex flex-col min-w-[280px] items-center">
    <div className="font-semibold mb-2">Tiempo en cada etapa</div>
    <ResponsiveContainer width="98%" height={140}>
      <BarChart data={useTimeMetrics(leads)}>
        <XAxis 
          dataKey="name" 
          tick={<StageNameTick />}
          height={32}
        />
        <YAxis />
        <Tooltip
          formatter={(value: any) =>
            typeof value === "number" ? value.toFixed(1) : value
          }
        />
        <Bar
          dataKey="avgDays"
          fill="#F59E42"
          label={<BarValueLabel />}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default StageTimeBarChart;
