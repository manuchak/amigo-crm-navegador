
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { pieColors } from "./crmUtils";
import { ChartTooltipContent } from "@/components/ui/chart";

interface ProfilePieChartProps {
  carTypes: { name: string; val: number }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#fff" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ProfilePieChart: React.FC<ProfilePieChartProps> = ({ carTypes }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={carTypes}
        dataKey="val"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        innerRadius={40}
        fill="#8884d8"
        labelLine={false}
        label={renderCustomizedLabel}
      >
        {carTypes.map((entry, idx) => (
          <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
        ))}
      </Pie>
      <Tooltip content={<ChartTooltipContent />} />
      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
    </PieChart>
  </ResponsiveContainer>
);

export default ProfilePieChart;
