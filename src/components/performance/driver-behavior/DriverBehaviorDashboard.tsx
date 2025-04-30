
import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { fetchDriverBehaviorData, fetchClientList } from "../services/driverBehavior/dataService";
import { DriverBehaviorMetricsCards } from './DriverBehaviorMetricsCards';
import { DriverBehaviorTable } from './DriverBehaviorTable';
import { DriverBehaviorChart } from './DriverBehaviorChart';
import { DriverBehaviorData, DriverBehaviorFilters } from '../types/driver-behavior.types';
import { DriverBehaviorFiltersPanel } from './DriverBehaviorFiltersPanel';
import { DriverRiskAssessment } from './DriverRiskAssessment';
import { TopDriversPanel } from './TopDriversPanel';
import { CO2EmissionsCard } from './CO2EmissionsCard';
import { ProductivityDashboard } from './productivity/ProductivityDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DriverBehaviorDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function DriverBehaviorDashboard({ dateRange, comparisonRange }: DriverBehaviorDashboardProps) {
  const [filters, setFilters] = useState<DriverBehaviorFilters>({});
  const queryClient = useQueryClient();

  // Obtener la lista de clientes para el filtrado
  const { data: clientList = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['driver-behavior-clients'],
    queryFn: fetchClientList,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  // Obtener los datos de comportamiento del conductor con filtros aplicados
  const { data: driverData, isLoading, error } = useQuery({
    queryKey: ['driver-behavior-data', dateRange, filters],
    queryFn: () => fetchDriverBehaviorData(dateRange, filters),
  });

  // Obtener datos de comparación si se proporciona un rango de comparación
  const { data: comparisonData } = useQuery({
    queryKey: ['driver-behavior-comparison-data', comparisonRange, filters],
    queryFn: () => comparisonRange ? fetchDriverBehaviorData(comparisonRange, filters) : null,
    enabled: !!comparisonRange && comparisonRange.from !== null && comparisonRange.to !== null,
  });

  // Manejar cambios de filtro
  const handleFilterChange = useCallback((newFilters: DriverBehaviorFilters) => {
    console.log('Aplicando filtros:', newFilters);
    setFilters(newFilters);
  }, []);
  
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-data'] });
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-clients'] });
    toast.success("Datos actualizados", {
      description: "Dashboard actualizado con los datos más recientes"
    });
  };

  if (error) {
    console.error('Error loading driver behavior data:', error);
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error al cargar los datos de comportamiento de conducción</p>
      </div>
    );
  }

  // Información de debug importante para verificar fechas
  console.log('DateRange in dashboard:', dateRange);
  if (driverData) {
    console.log(`Datos cargados: ${driverData.driverScores?.length || 0} registros de conductores`);
    if (driverData.driverScores && driverData.driverScores.length > 0) {
      console.log('Muestra de fechas:', {
        start: new Date(driverData.driverScores[0].start_date).toLocaleDateString(),
        end: new Date(driverData.driverScores[0].end_date).toLocaleDateString()
      });
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <DriverBehaviorFiltersPanel 
          clientList={Array.isArray(clientList) ? clientList : []} 
          onFilterChange={handleFilterChange} 
          filters={filters} 
        />
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="h-9"
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>
      
      <DriverBehaviorMetricsCards 
        data={driverData} 
        comparisonData={comparisonData}
        isLoading={isLoading} 
      />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="risk">Riesgo y Conductores</TabsTrigger>
          <TabsTrigger value="productivity">Productividad</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DriverBehaviorChart 
                data={driverData?.driverScores} 
                isLoading={isLoading} 
                dateRange={dateRange} 
              />
            </div>
            <div>
              <CO2EmissionsCard 
                data={driverData} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="risk" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DriverRiskAssessment 
              riskData={driverData?.riskAssessment} 
              isLoading={isLoading} 
            />
            <TopDriversPanel 
              data={driverData?.driverPerformance} 
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="productivity" className="mt-6">
          <ProductivityDashboard 
            dateRange={dateRange}
            clients={Array.isArray(clientList) ? clientList : []}
            selectedClients={filters.selectedClients}
          />
        </TabsContent>
        
        <TabsContent value="details" className="mt-6">
          <DriverBehaviorTable 
            dateRange={dateRange}
            filters={filters}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
