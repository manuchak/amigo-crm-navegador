
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiciosMetricData } from '../services/servicios';

interface ServiciosMetricsCardsProps {
  data?: ServiciosMetricData;
  isLoading: boolean;
  filteredData?: any[];
}

export function ServiciosMetricsCards({ 
  data, 
  isLoading,
  filteredData = [] 
}: ServiciosMetricsCardsProps) {
  // Calculate filtered metrics
  const totalFilteredServices = filteredData?.length || 0;
  
  // Calculate total KM for filtered data
  const totalKmFiltered = React.useMemo(() => {
    if (!filteredData?.length) return 0;
    
    return filteredData.reduce((sum, service) => {
      const km = service.km_teorico || service.km_recorridos || 0;
      return sum + parseFloat(km);
    }, 0);
  }, [filteredData]);

  // Calculate active clients based on filtered data
  const activeClientsFiltered = React.useMemo(() => {
    if (!filteredData?.length) return 0;
    
    const uniqueClients = new Set();
    filteredData.forEach(service => {
      if (service.nombre_cliente) {
        uniqueClients.add(service.nombre_cliente);
      }
    });
    
    return uniqueClients.size;
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-100 animate-pulse rounded"></div>
                <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { serviciosMoM, serviciosWoW, kmPromedioMoM } = data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">{totalFilteredServices}</div>
            {serviciosMoM.percentChange !== 0 && (
              <div className={`text-xs ${serviciosMoM.percentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {serviciosMoM.percentChange > 0 ? '↑' : '↓'} {Math.abs(serviciosMoM.percentChange)}% vs mes anterior
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {serviciosWoW.current} servicios esta semana
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">KM Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">{Math.round(totalKmFiltered).toLocaleString()}</div>
            {kmPromedioMoM.percentChange !== 0 && (
              <div className={`text-xs ${kmPromedioMoM.percentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {kmPromedioMoM.percentChange > 0 ? '↑' : '↓'} {Math.abs(kmPromedioMoM.percentChange)}% vs mes anterior
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(totalKmFiltered / Math.max(totalFilteredServices, 1)).toLocaleString()} km promedio
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClientsFiltered}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Clientes con servicios en el período
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.clientesNuevos}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Nuevos este mes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
