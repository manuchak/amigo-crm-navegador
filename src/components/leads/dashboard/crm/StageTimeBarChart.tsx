
import React from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { useTimeMetrics } from "./crmUtils";
import { Lead } from "@/context/LeadsContext";

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
          tick={{ fontSize: 13, fontWeight: 500, fill: "#334155" }} // smaller
          height={22}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="avgDays" fill="#F59E42" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default StageTimeBarChart;
