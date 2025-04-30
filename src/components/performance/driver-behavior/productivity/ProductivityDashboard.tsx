import React from 'react';
import { DateRange } from "react-day-picker";
import { ProductivityMetricsCards } from './ProductivityMetricsCards';
import { ProductivityAnalysisTable } from './ProductivityAnalysisTable';
import { ProductivityParametersDialog } from './ProductivityParametersDialog';
import { ProductivityParametersTable } from './ProductivityParametersTable';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { DriverBehaviorFilters } from '../../types/driver-behavior.types';
import { fetchProductivityParameters, fetchDriverGroups } from '../../services/productivity/productivityService';
import { supabase } from "@/integrations/supabase/client";

interface ProductivityDashboardProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

export function ProductivityDashboard({ dateRange, filters = {} }: ProductivityDashboardProps) {
  const [showParameters, setShowParameters] = React.useState(false);
  
  // Fetch parameters, clients, and driver groups to pass to components
  const { data: parameters, isLoading: isLoadingParameters, refetch: refetchParameters } = useQuery({
    queryKey: ['productivity-parameters', filters?.selectedClient],
    queryFn: () => fetchProductivityParameters(filters?.selectedClient),
  });

  // Fetch driver groups for the selected client
  const { data: driverGroups = [] } = useQuery({
    queryKey: ['productivity-driver-groups', filters?.selectedClient],
    queryFn: () => fetchDriverGroups(filters?.selectedClient),
    enabled: !!filters?.selectedClient,
  });

  // Get client list from the filters or fetch it if not available
  const { data: clients = [] } = useQuery({
    queryKey: ['productivity-clients'],
    queryFn: async () => {
      const { data } = await supabase
        .from('driver_productivity_parameters')
        .select('client')
        .order('client');
      
      if (!data) return [];
      return Array.from(new Set(data.map(item => item.client)));
    },
  });
  
  const handleRefreshParameters = () => {
    refetchParameters();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Análisis de Productividad</h3>
        <Button 
          variant="outline" 
          size="sm"
          className="h-9"
          onClick={() => setShowParameters(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar Parámetros
        </Button>
      </div>
      
      <ProductivityMetricsCards 
        dateRange={dateRange}
        filters={filters}
      />
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Análisis por Conductor</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityAnalysisTable 
              dateRange={dateRange}
              filters={filters}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Parameters Dialog */}
      <ProductivityParametersDialog 
        open={showParameters}
        onClose={() => setShowParameters(false)}
        onSaved={handleRefreshParameters}
        selectedClient={filters?.selectedClient}
        availableGroups={driverGroups}
      />
      
      {/* Parameters Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Parámetros de Productividad</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductivityParametersTable 
            parameters={parameters || []}
            clients={clients}
            driverGroups={driverGroups}
            isLoading={isLoadingParameters}
            onRefresh={handleRefreshParameters}
            selectedClient={filters?.selectedClient}
          />
        </CardContent>
      </Card>
    </div>
  );
}
