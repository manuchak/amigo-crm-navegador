
import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { fetchDriverBehaviorData, fetchClientList } from "../services/driverBehavior/dataService";
import { DriverBehaviorMetricsCards } from './DriverBehaviorMetricsCards';
import { DriverBehaviorTable } from './DriverBehaviorTable';
import { DriverBehaviorChart } from './DriverBehaviorChart';
import { DriverBehaviorFilters } from '../types/driver-behavior.types';
import { DriverBehaviorFiltersPanel } from './DriverBehaviorFiltersPanel';
import { DriverRiskAssessment } from './DriverRiskAssessment';
import { TopDriversPanel } from './TopDriversPanel';
import { CO2EmissionsCard } from './CO2EmissionsCard';
import { ProductivityDashboard } from './productivity/ProductivityDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface DriverBehaviorDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function DriverBehaviorDashboard({ dateRange, comparisonRange }: DriverBehaviorDashboardProps) {
  const [filters, setFilters] = useState<DriverBehaviorFilters>({});
  const queryClient = useQueryClient();

  // Get driver behavior data
  const { data: driverData, isLoading, error } = useQuery({
    queryKey: ['driver-behavior-data', dateRange, filters],
    queryFn: () => fetchDriverBehaviorData(dateRange, filters),
  });

  // Get comparison data if comparison range is provided
  const { data: comparisonData } = useQuery({
    queryKey: ['driver-behavior-comparison-data', comparisonRange, filters],
    queryFn: () => comparisonRange ? fetchDriverBehaviorData(comparisonRange, filters) : null,
    enabled: !!comparisonRange && comparisonRange.from !== null && comparisonRange.to !== null,
  });

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: DriverBehaviorFilters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
  }, []);
  
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-data'] });
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-clients'] });
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-groups'] });
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

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <DriverBehaviorFiltersPanel 
          onFilterChange={handleFilterChange} 
          filters={filters} 
        />
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="h-9 bg-white hover:bg-gray-50 text-gray-700"
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
        <TabsList className="bg-white/70 backdrop-blur-sm border shadow-sm rounded-xl p-1 w-auto inline-flex">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Resumen
          </TabsTrigger>
          <TabsTrigger 
            value="risk" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Riesgo y Conductores
          </TabsTrigger>
          <TabsTrigger 
            value="productivity" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Productividad
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm"
          >
            Detalles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="lg:col-span-2 xl:col-span-3">
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
            filters={filters}
          />
        </TabsContent>
        
        <TabsContent value="details" className="mt-6">
          <DriverBehaviorTable 
            dateRange={dateRange}
            filters={filters}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
