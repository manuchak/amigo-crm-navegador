
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function PerformanceCharts() {
  const { data: stats } = useQuery({
    queryKey: ['custodio-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custodio_validation_stats')
        .select('*')
        .order('validation_day', { ascending: true })
        .limit(30);

      if (error) throw error;
      return data;
    }
  });

  const chartData = stats?.map(stat => ({
    date: format(new Date(stat.validation_day), 'dd/MM'),
    calidad: Number(stat.avg_call_quality || 0),
    comunicacion: Number(stat.avg_communication || 0),
    confiabilidad: Number(stat.avg_reliability || 0),
    validaciones: Number(stat.validation_count || 0)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="border shadow-sm rounded-xl bg-white/90 backdrop-blur-sm xl:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Métricas de Calidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 10}}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calidad" 
                  stroke="#8B5CF6" 
                  name="Calidad" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="comunicacion" 
                  stroke="#0EA5E9" 
                  name="Comunicación" 
                  strokeWidth={2} 
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="confiabilidad" 
                  stroke="#F97316" 
                  name="Confiabilidad" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm rounded-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            Validaciones por Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 10}}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="validaciones" 
                  stroke="#8B5CF6" 
                  name="Validaciones"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
