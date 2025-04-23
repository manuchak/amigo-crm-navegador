
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
  ResponsiveContainer
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-md bg-white/90">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Métricas de Calidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="calidad" stroke="#8B5CF6" name="Calidad" />
                <Line type="monotone" dataKey="comunicacion" stroke="#0EA5E9" name="Comunicación" />
                <Line type="monotone" dataKey="confiabilidad" stroke="#F97316" name="Confiabilidad" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-white/90">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Validaciones por Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="validaciones" stroke="#8B5CF6" name="Validaciones" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
