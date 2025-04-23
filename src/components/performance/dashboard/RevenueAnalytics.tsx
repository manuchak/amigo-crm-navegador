
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface RevenueData {
  totalRevenue: number;
  averageRevenue: number;
  byMonth: { month: string; revenue: number }[];
  byService: { service: string; revenue: number }[];
}

interface RevenueAnalyticsProps {
  data?: RevenueData;
  isLoading: boolean;
}

export function RevenueAnalytics({ data, isLoading }: RevenueAnalyticsProps) {
  const COLORS = ['#8B5CF6', '#0EA5E9', '#F97316', '#10B981'];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-0 shadow-md lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            Ingresos por Mes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data?.byMonth} 
                  margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value/1000}k`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                  />
                  <Bar 
                    dataKey="revenue" 
                    name="Ingresos" 
                    fill="#8B5CF6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            Ingresos por Servicio
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                  />
                  <Pie
                    data={data?.byService}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    nameKey="service"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.byService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend layout="vertical" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">Ingresos Totales</p>
              <p className="text-2xl font-semibold">
                {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(data?.totalRevenue || 0)}
              </p>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm">Promedio por Custodio</p>
              <p className="text-2xl font-semibold">
                {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(data?.averageRevenue || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
