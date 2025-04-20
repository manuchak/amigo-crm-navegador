
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { pieColors } from "./crmUtils";
import { Lead } from "@/context/LeadsContext";

interface ProfilePieChartProps {
  carTypes: { name: string; val: number }[];
}

const ProfilePieChart: React.FC<ProfilePieChartProps> = ({ carTypes }) => (
  <div className="flex-1 bg-white border rounded-xl shadow p-6 flex flex-col min-w-[280px] items-center">
    <div className="font-semibold mb-2">Distribución perfiles</div>
    <ResponsiveContainer width="99%" height={160}>
      <PieChart>
        <Pie
          data={carTypes}
          dataKey="val"
          nameKey="name"
          cy="50%"
          outerRadius={60}
          innerRadius={35}
          fill="#8884d8"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
          {carTypes.map((entry, idx) => (
            <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default ProfilePieChart;
