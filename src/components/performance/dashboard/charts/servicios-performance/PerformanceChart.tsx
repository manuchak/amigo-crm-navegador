
import React from 'react';
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChartContainer } from '@/components/ui/chart';

interface ChartDataPoint {
  date: string;
  servicios: number;
  promedio: number;
  displayDate: string;
}

interface PerformanceChartProps {
  chartData: ChartDataPoint[];
  average: number;
  yAxisMax: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  chartData, 
  average, 
  yAxisMax 
}) => {
  // Configure chart colors
  const chartConfig = {
    servicios: { color: "#0EA5E9" },
    promedio: { color: "#8B5CF6" }
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData}
          margin={{ top: 15, right: 25, left: 0, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 10 }}
            axisLine={{ stroke: '#e5e5e5' }}
            tickLine={false}
            tickMargin={10}
            minTickGap={15}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, yAxisMax]}
            axisLine={{ stroke: '#e5e5e5' }}
            tickLine={false}
            fontSize={10}
            width={30}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '6px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
              border: 'none',
              padding: '8px 12px',
            }}
            formatter={(value, name) => {
              if (name === 'servicios') return [`${value}`, 'Servicios'];
              if (name === 'promedio') return [`${value}`, 'Promedio (7 días)'];
              return [value, name];
            }}
            labelFormatter={(displayDate) => {
              const matchingData = chartData.find(item => item.displayDate === displayDate);
              if (matchingData) {
                return format(parseISO(matchingData.date), 'dd MMM yyyy', { locale: es });
              }
              return displayDate;
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 5 }}
            fontSize={12}
          />
          <ReferenceLine 
            y={average} 
            stroke="#9b87f5" 
            strokeDasharray="3 3" 
            label={{ 
              value: `Prom: ${average.toFixed(1)}`, 
              fill: '#9b87f5',
              fontSize: 10,
              position: 'right'
            }} 
          />
          <Line 
            type="monotone" 
            dataKey="servicios" 
            stroke="#0EA5E9" 
            name="Servicios"
            strokeWidth={2}
            dot={false} 
            activeDot={{ r: 5, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="promedio" 
            stroke="#8B5CF6" 
            name="Promedio (7 días)"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            activeDot={{ r: 5, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
