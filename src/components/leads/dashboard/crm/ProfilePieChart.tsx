
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { pieColors } from "./crmUtils";
import { ChartContainer } from "@/components/ui/chart";

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

const ProfilePieChart: React.FC<ProfilePieChartProps> = ({ carTypes }) => {
  const chartConfig = Object.fromEntries(
    carTypes.map((entry, idx) => [entry.name, { color: pieColors[idx % pieColors.length] }])
  );

  // Custom tooltip that doesn't use useChart directly
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-background/95 p-2 border rounded-md shadow-md text-sm">
        <p>{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  };

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
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
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ProfilePieChart;
