
import React from "react";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { LayoutDashboard } from "lucide-react";

interface MonthlyLineChartProps {
  data: { name: string; Nuevos: number; Calificados: number }[];
}

const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({ data }) => (
  <div className="bg-white border rounded-xl shadow px-6 py-5 w-full flex flex-col">
    <div className="flex gap-2 items-center mb-2">
      <LayoutDashboard className="w-4 h-4 text-secondary" />
      <span className="font-semibold">Rendimiento mensual onboarding de leads</span>
    </div>
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 13, fontWeight: 500, fill: "#334155" }} // smaller
          height={22}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Nuevos" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Calificados" stroke="#33C3F0" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default MonthlyLineChart;
