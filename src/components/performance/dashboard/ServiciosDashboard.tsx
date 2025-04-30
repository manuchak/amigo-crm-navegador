
import React from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { fetchServiciosData } from '../services/servicios';
import { ServiciosMetricsCards } from './ServiciosMetricsCards';
import { ServiciosPerformanceChart } from './charts/servicios-performance';
import { ServiciosHourDistributionChart } from './charts/ServiciosHourDistributionChart';
import { ServiciosClientesActivos } from './ServiciosClientesActivos';
import { ServiciosAlertas } from './ServiciosAlertas';
import { ServiciosTipoChart } from './ServiciosTipoChart';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';

interface ServiciosDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function ServiciosDashboard({ dateRange, comparisonRange }: ServiciosDashboardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['servicios', dateRange, comparisonRange],
    queryFn: () => fetchServiciosData(dateRange, comparisonRange),
    refetchOnWindowFocus: false,
  });

  // Debug logging for date range
  React.useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      console.log("ServiciosDashboard date range:", {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      });
    } else {
      console.warn("ServiciosDashboard received invalid date range");
    }
  }, [dateRange]);
  
  // Show error toast if fetch fails
  React.useEffect(() => {
    if (isError) {
      toast.error("Error al cargar datos", {
        description: "No se pudieron cargar los datos de servicios. Intente nuevamente."
      });
    }
  }, [isError]);

  if (isError) {
    return (
      <Card className="p-8 text-center border shadow-sm bg-white">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-2 text-gray-800">Error al cargar datos</h3>
          <p className="text-muted-foreground">
            Ocurrió un error al cargar los datos de servicios. Por favor, inténtelo de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando datos de servicios...</p>
      </div>
    );
  }

  // Quick validation check - if we have date range but no data
  if (dateRange?.from && dateRange?.to && (!data || !data.serviciosData || data.serviciosData.length === 0)) {
    return (
      <Card className="p-8 text-center border shadow-sm bg-white">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-2 text-gray-800">Sin datos para el período seleccionado</h3>
          <p className="text-muted-foreground">
            No hay datos de servicios disponibles para el rango de fechas seleccionado. 
            Intente seleccionar otro período.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics cards at the top */}
      <div className="animate-fade-in duration-300">
        <ServiciosMetricsCards 
          data={data} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* Performance chart and type distribution side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-100 duration-300">
        {/* Performance chart taking 2/3 width on large screens */}
        <div className="lg:col-span-2 h-[500px]">
          <ServiciosPerformanceChart 
            data={data?.serviciosData} 
            isLoading={isLoading}
            dateRange={dateRange}
          />
        </div>
        
        {/* Services type chart taking 1/3 width */}
        <div className="h-[500px]">
          <ServiciosTipoChart 
            data={data?.serviciosPorTipo || []} 
            isLoading={isLoading} 
          />
        </div>
      </div>
      
      {/* Hour distribution and clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animate-delay-150 duration-300">
        <div className="h-[420px]">
          <ServiciosHourDistributionChart 
            data={data?.serviciosData}
            isLoading={isLoading}
          />
        </div>
        
        <div className="h-[420px]">
          <ServiciosClientesActivos 
            clientes={data?.serviciosPorCliente || []}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      {/* Alerts section */}
      <div className="animate-fade-in animate-delay-200 duration-300">
        <div className="h-[360px]">
          <ServiciosAlertas 
            alertas={data?.alertas || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
