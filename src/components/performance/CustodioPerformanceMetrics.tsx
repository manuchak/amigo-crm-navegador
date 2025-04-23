
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Award, Gauge } from "lucide-react";

export function CustodioPerformanceMetrics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['custodio-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custodio_validation_stats')
        .select('*')
        .order('validation_day', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data;
    }
  });

  const metrics = [
    {
      title: "Validaciones Totales",
      value: stats?.reduce((acc, curr) => acc + Number(curr.validation_count || 0), 0) || 0,
      icon: Users,
      color: "bg-violet-50 text-violet-600"
    },
    {
      title: "Promedio de Calidad",
      value: stats?.reduce((acc, curr) => acc + Number(curr.avg_call_quality || 0), 0) / (stats?.length || 1),
      icon: Gauge,
      color: "bg-emerald-50 text-emerald-600",
      format: (value: number) => `${value.toFixed(1)}/5`
    },
    {
      title: "Promedio de Comunicación",
      value: stats?.reduce((acc, curr) => acc + Number(curr.avg_communication || 0), 0) / (stats?.length || 1),
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600",
      format: (value: number) => `${value.toFixed(1)}/5`
    },
    {
      title: "Promedio de Confiabilidad",
      value: stats?.reduce((acc, curr) => acc + Number(curr.avg_reliability || 0), 0) / (stats?.length || 1),
      icon: Award,
      color: "bg-amber-50 text-amber-600",
      format: (value: number) => `${value.toFixed(1)}/5`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, i) => (
        <Card key={i} className="border-0 shadow-md bg-white/90">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`${metric.color} p-3 rounded-xl`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {isLoading ? "..." : (metric.format ? metric.format(metric.value) : metric.value)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
