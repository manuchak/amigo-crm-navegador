
import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { fetchDriverBehaviorData, fetchClientList } from "../services/driverBehavior/driverBehaviorService";
import { DriverBehaviorMetricsCards } from './DriverBehaviorMetricsCards';
import { DriverBehaviorTable } from './DriverBehaviorTable';
import { DriverBehaviorChart } from './DriverBehaviorChart';
import { DriverBehaviorData, DriverBehaviorFilters } from '../types/driver-behavior.types';
import { DriverBehaviorFiltersPanel } from './DriverBehaviorFiltersPanel';
import { DriverRiskAssessment } from './DriverRiskAssessment';
import { TopDriversPanel } from './TopDriversPanel';
import { CO2EmissionsCard } from './CO2EmissionsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { DownloadIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface DriverBehaviorDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function DriverBehaviorDashboard({ dateRange, comparisonRange }: DriverBehaviorDashboardProps) {
  const [filters, setFilters] = useState<DriverBehaviorFilters>({});
  const queryClient = useQueryClient();

  // Fetch the client list for filtering
  const { data: clientList = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['driver-behavior-clients'],
    queryFn: fetchClientList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch the driver behavior data with applied filters
  const { data: driverData, isLoading, error } = useQuery({
    queryKey: ['driver-behavior-data', dateRange, filters],
    queryFn: () => fetchDriverBehaviorData(dateRange, filters),
  });

  // Fetch comparison data if a comparison range is provided
  const { data: comparisonData } = useQuery({
    queryKey: ['driver-behavior-comparison-data', comparisonRange, filters],
    queryFn: () => comparisonRange ? fetchDriverBehaviorData(comparisonRange, filters) : null,
    enabled: !!comparisonRange && comparisonRange.from !== null && comparisonRange.to !== null,
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: DriverBehaviorFilters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
  };
  
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-data'] });
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-clients'] });
    toast.success("Datos actualizados", {
      description: "Dashboard actualizado con los datos más recientes"
    });
  };

  const downloadTemplate = () => {
    toast.success("Descargando plantilla", {
      description: "La plantilla CSV ha sido descargada"
    });
    // Implement actual download logic here
  };

  if (error) {
    console.error('Error loading driver behavior data:', error);
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error al cargar los datos de comportamiento de conducción</p>
      </div>
    );
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="h-9"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Plantilla
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
