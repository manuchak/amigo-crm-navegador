
import React, { useState, useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePerformanceChartData } from './usePerformanceChartData';
import { LoadingState } from './LoadingState';
import { PerformanceChart } from './PerformanceChart';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface ServiciosPerformanceChartProps {
  data?: any[];
  isLoading: boolean;
  dateRange: DateRange;
}

export function ServiciosPerformanceChart({ 
  data = [], 
  isLoading, 
  dateRange 
}: ServiciosPerformanceChartProps) {
  const [clienteFilter, setClienteFilter] = useState<string>("todos");
  const [tipoServicioFilter, setTipoServicioFilter] = useState<string>("todos");
  const [routeFilter, setRouteFilter] = useState<string>("todos");
  
  // Extract unique options for filters
  const clienteOptions = useMemo(() => {
    if (!data?.length) return [];
    const uniqueClientes = new Set<string>();
    
    data.forEach(servicio => {
      if (servicio.nombre_cliente && typeof servicio.nombre_cliente === 'string') {
        uniqueClientes.add(servicio.nombre_cliente);
      }
    });
    
    return Array.from(uniqueClientes).sort();
  }, [data]);
  
  const tipoServicioOptions = useMemo(() => {
    if (!data?.length) return [];
    const uniqueTipos = new Set<string>();
    
    data.forEach(servicio => {
      if (servicio.tipo_servicio && typeof servicio.tipo_servicio === 'string') {
        uniqueTipos.add(servicio.tipo_servicio);
      } else if (servicio.local_foraneo && typeof servicio.local_foraneo === 'string') {
        uniqueTipos.add(servicio.local_foraneo);
      }
    });
    
    return Array.from(uniqueTipos).sort();
  }, [data]);
  
  const routeOptions = useMemo(() => {
    if (!data?.length) return [];
    const uniqueRoutes = new Set<string>();
    
    data.forEach(servicio => {
      if (servicio.ruta && typeof servicio.ruta === 'string') {
        uniqueRoutes.add(servicio.ruta);
      }
    });
    
    return Array.from(uniqueRoutes).sort();
  }, [data]);
  
  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    
    return data.filter(servicio => {
      // Cliente filter
      if (clienteFilter !== "todos" && servicio.nombre_cliente !== clienteFilter) {
        return false;
      }
      
      // Tipo servicio filter (check both tipo_servicio and local_foraneo)
      if (tipoServicioFilter !== "todos") {
        const servicioTipo = servicio.tipo_servicio || servicio.local_foraneo || "";
        if (servicioTipo !== tipoServicioFilter) {
          return false;
        }
      }
      
      // Ruta filter
      if (routeFilter !== "todos" && servicio.ruta !== routeFilter) {
        return false;
      }
      
      return true;
    });
  }, [data, clienteFilter, tipoServicioFilter, routeFilter]);

  // Process chart data using our custom hook
  const chartData = usePerformanceChartData(filteredData, dateRange);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!data?.length) {
    return (
      <Card className="border shadow-sm bg-white h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Rendimiento de Servicios</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[320px]">
          <p className="text-muted-foreground">No hay datos disponibles para el rango seleccionado</p>
        </CardContent>
      </Card>
    );
  }

  // Get min and max values for better Y-axis
  const maxServicios = Math.max(...chartData.map(item => item.servicios), 1);
  const yAxisMax = Math.ceil(maxServicios * 1.1); // Add 10% padding

  // Calculate average for reference line
  const average = chartData.length > 0 
    ? chartData.reduce((sum, item) => sum + item.servicios, 0) / chartData.length
    : 0;

  return (
    <Card className="border shadow-sm bg-white h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Rendimiento de Servicios</CardTitle>
      </CardHeader>
      
      <div className="px-6 pb-2">
        <div className="flex flex-wrap gap-2 md:gap-4">
          <div className="w-full sm:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">Cliente</label>
            <Select 
              value={clienteFilter}
              onValueChange={setClienteFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                <SelectValue placeholder="Seleccione Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="todos">Todos</SelectItem>
                  {clienteOptions.map(cliente => (
                    <SelectItem key={cliente} value={cliente}>{cliente}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">Tipo de Servicio</label>
            <Select 
              value={tipoServicioFilter}
              onValueChange={setTipoServicioFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                <SelectValue placeholder="Seleccione Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="todos">Todos</SelectItem>
                  {tipoServicioOptions.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {routeOptions.length > 0 && (
            <div className="w-full sm:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Ruta</label>
              <Select 
                value={routeFilter}
                onValueChange={setRouteFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Seleccione Ruta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="todos">Todas</SelectItem>
                    {routeOptions.map(ruta => (
                      <SelectItem key={ruta} value={ruta}>{ruta}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-0 pb-4 px-4">
        <div className="h-[320px] w-full">
          <PerformanceChart 
            chartData={chartData}
            average={average}
            yAxisMax={yAxisMax}
          />
        </div>
      </CardContent>
      
      <div className="px-6 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          {filteredData.length} servicios {clienteFilter !== "todos" ? `para ${clienteFilter}` : "en total"}
          {tipoServicioFilter !== "todos" ? `, tipo ${tipoServicioFilter}` : ""}
          {routeFilter !== "todos" ? `, ruta ${routeFilter}` : ""}
        </p>
      </div>
    </Card>
  );
}
