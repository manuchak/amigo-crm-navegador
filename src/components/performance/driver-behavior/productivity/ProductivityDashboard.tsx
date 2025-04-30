
import React, { useState, useEffect, useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { toast } from "sonner";
import { Download, RefreshCw } from "lucide-react";
import { 
  fetchProductivityParameters, 
  fetchProductivityAnalysis,
  calculateProductivitySummary, 
  updateAllFuelPrices 
} from "../../services/productivity/productivityService";
import { ProductivityMetricsCards } from "./ProductivityMetricsCards";
import { ProductivityParametersTable } from "./ProductivityParametersTable";
import { ProductivityAnalysisTable } from "./ProductivityAnalysisTable";

interface ProductivityDashboardProps {
  dateRange: DateRange;
  clients: string[];
  selectedClients?: string[];
}

export function ProductivityDashboard({
  dateRange,
  clients,
  selectedClients
}: ProductivityDashboardProps) {
  const [isUpdatingFuelPrices, setIsUpdatingFuelPrices] = useState(false);
  
  // Fetch productivity parameters
  const { 
    data: parameters, 
    isLoading: isLoadingParameters, 
    refetch: refetchParameters 
  } = useQuery({
    queryKey: ['productivity-parameters'],
    queryFn: () => fetchProductivityParameters(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Extract unique driver groups for parameter setup
  const driverGroups = useMemo(() => {
    if (!parameters) return [];
    const groups = new Set<string>();
    parameters.forEach(param => {
      if (param.driver_group) {
        groups.add(param.driver_group);
      }
    });
    return Array.from(groups).sort();
  }, [parameters]);
  
  // Fetch productivity analysis data
  const { 
    data: analysisData, 
    isLoading: isLoadingAnalysis,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['productivity-analysis', dateRange, selectedClients],
    queryFn: () => {
      if (!dateRange.from || !dateRange.to) {
        return Promise.resolve([]);
      }
      
      return fetchProductivityAnalysis(dateRange, {
        client: selectedClients && selectedClients.length === 1 ? selectedClients[0] : undefined
      });
    },
    enabled: !!dateRange.from && !!dateRange.to,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Calculate summary metrics from analysis data
  const summary = useMemo(() => {
    if (!analysisData) return null;
    return calculateProductivitySummary(analysisData);
  }, [analysisData]);
  
  // Filter analysis data based on selected clients
  const filteredAnalysisData = useMemo(() => {
    if (!analysisData) return [];
    if (!selectedClients || selectedClients.length === 0) return analysisData;
    
    return analysisData.filter(item => selectedClients.includes(item.client));
  }, [analysisData, selectedClients]);
  
  // Handle updating fuel prices
  const handleUpdateFuelPrices = async () => {
    try {
      setIsUpdatingFuelPrices(true);
      const result = await updateAllFuelPrices();
      toast.success("Precios de combustible actualizados", {
        description: `Se actualizaron ${result.recordsUpdated} parámetros al precio nacional de $${result.nationalPrice.toFixed(2)}/litro.`
      });
      refetchParameters();
      refetchAnalysis();
    } catch (error) {
      console.error("Error updating fuel prices:", error);
      toast.error("Error al actualizar precios", {
        description: "No se pudieron actualizar los precios de combustible."
      });
    } finally {
      setIsUpdatingFuelPrices(false);
    }
  };
  
  // Handle refreshing data
  const handleRefresh = () => {
    refetchParameters();
    refetchAnalysis();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Análisis de Productividad</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleUpdateFuelPrices}
            disabled={isUpdatingFuelPrices}
          >
            {isUpdatingFuelPrices ? "Actualizando..." : "Actualizar precio combustible"}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Productivity Metrics Summary */}
      <ProductivityMetricsCards 
        data={summary} 
        isLoading={isLoadingAnalysis} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Parameters Management */}
        <div className="lg:col-span-2">
          <ProductivityAnalysisTable 
            data={filteredAnalysisData} 
            isLoading={isLoadingAnalysis} 
          />
        </div>
        
        <div className="lg:col-span-1">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Herramientas</CardTitle>
              <CardDescription>Acciones y exportación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleUpdateFuelPrices}
                disabled={isUpdatingFuelPrices}
              >
                Actualizar precio de combustible
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                disabled={!filteredAnalysisData.length}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar datos
              </Button>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Los datos de productividad se basan en los parámetros definidos. 
                  Para modificarlos, administra los parámetros por cliente y grupo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Productivity Parameters Table */}
      <ProductivityParametersTable 
        parameters={parameters || []} 
        clients={clients}
        driverGroups={driverGroups}
        isLoading={isLoadingParameters}
        onRefresh={refetchParameters}
      />
    </div>
  );
}
