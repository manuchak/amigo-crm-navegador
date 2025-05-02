
import React from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, LabelList } from "recharts";
import { useTimeMetrics } from "./crmUtils";
import { Lead } from "@/context/LeadsContext";
import { ChartContainer } from "@/components/ui/chart";

interface StageTimeBarChartProps {
  leads: Lead[];
}

const StageTimeBarChart: React.FC<StageTimeBarChartProps> = ({ leads }) => {
  const data = useTimeMetrics(leads);
  
  const chartConfig = {
    avgDays: { color: "#F59E42" }
  };
  
  // Custom tooltip that doesn't use useChart directly
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-background/95 p-2 border rounded-md shadow-md text-sm">
        <p>{`${payload[0].payload.displayName}: ${payload[0].value.toFixed(1)} días`}</p>
      </div>
    );
  };

  // Transform status names for display
  const transformedData = data.map(item => {
    // Map the internal status keys to display names
    const displayNames: { [key: string]: string } = {
      'nuevo': 'Nuevo',
      'contactado': 'Contactado',
      'calificado': 'Calificado',
      'contratado': 'Contratado'
    };
    
    return {
      ...item,
      displayName: displayNames[item.name] || item.name
    };
  });
  
  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={transformedData} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
          <XAxis 
            dataKey="displayName" 
            angle={-45}
            textAnchor="end"
            height={60}
            fontSize={12}
          />
          <YAxis 
            label={{ value: 'Días promedio', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            allowDecimals={false}
            domain={[0, 'auto']} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="avgDays"
            fill="#F59E42"
            radius={[4, 4, 0, 0]}
          >
            <LabelList 
              dataKey="avgDays" 
              position="top" 
              formatter={(value: number) => value.toFixed(1)} 
              style={{ fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default StageTimeBarChart;
