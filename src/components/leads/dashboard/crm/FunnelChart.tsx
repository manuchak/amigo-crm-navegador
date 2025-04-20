
import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from "recharts";
import { Gauge } from "lucide-react";
import { statusTextColor } from "./crmUtils";
import { STAGES } from "./crmUtils";

interface FunnelChartProps {
  byStage: { key: string; label: string; value: number; color: string }[];
}

const FunnelChart: React.FC<FunnelChartProps> = ({ byStage }) => (
  <div className="bg-white border rounded-xl shadow flex flex-col px-4 py-4 min-w-[300px] w-[350px] max-w-[420px] items-center">
    <div className="font-semibold text-primary mb-2 flex gap-2 items-center">
      <Gauge className="w-5 h-5 text-primary" /> Embudo de lead
    </div>
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={byStage}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 13, fontWeight: 500, fill: "#334155" }} // smaller
          height={22}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value">
          {byStage.map((entry, idx) => (
            <Cell key={entry.key} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <div className="text-xs text-slate-400 text-center mt-1">Visualiza cuántos leads hay en cada etapa</div>
  </div>
);
export default FunnelChart;
