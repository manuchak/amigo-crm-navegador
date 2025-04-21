
import React from "react";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

interface MonthlyLineChartProps {
  data: { name: string; Nuevos: number; Calificados: number }[];
}

const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({ data }) => (
  <Card className="w-full bg-white shadow-sm">
    <CardHeader className="pb-2">
      <div className="flex gap-2 items-center">
        <LayoutDashboard className="w-4 h-4 text-secondary" />
        <CardTitle className="text-base">Rendimiento mensual onboarding de leads</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="pt-0 pb-6">
      <div style={{ height: "250px" }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 13, fontWeight: 500, fill: "#334155" }}
              height={22}
            />
            <YAxis />
            <Tooltip />
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
      </div>
    </CardContent>
  </Card>
);

export default MonthlyLineChart;
