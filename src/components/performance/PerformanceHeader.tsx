
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PerformanceHeader() {
  const { data: activeCustodios } = useQuery({
    queryKey: ['active-custodios-count'],
    queryFn: async () => {
      // This is a simplified query - in a real app, you'd get active custodios
      const { count, error } = await supabase
        .from('custodio_validation_stats')
        .select('*', { count: 'exact', head: true })
        .gt('validation_day', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());
      
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Desempeño de Custodios</h1>
        <p className="text-muted-foreground mt-1">
          Análisis detallado del rendimiento y actividad de los custodios
        </p>
      </div>
      
      <Badge variant="outline" className="px-3 py-1.5 text-sm bg-primary/10 border-primary/20 text-primary">
        {activeCustodios !== null && activeCustodios !== undefined 
          ? `${activeCustodios} custodios activos` 
          : "Cargando..."}
      </Badge>
    </div>
  );
}
