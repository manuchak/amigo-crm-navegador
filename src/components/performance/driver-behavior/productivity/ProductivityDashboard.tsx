
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
import { fetchProductivityParameters, fetchDriverGroups, fetchClientList } from '../../services/productivity/productivityService';
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface ProductivityDashboardProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

export function ProductivityDashboard({ dateRange, filters = {} }: ProductivityDashboardProps) {
  const [showParameters, setShowParameters] = React.useState(false);
  
  // Fetch parameters to pass to components
  const { data: parameters, isLoading: isLoadingParameters, refetch: refetchParameters } = useQuery({
    queryKey: ['productivity-parameters', filters?.selectedClient],
    queryFn: () => fetchProductivityParameters(filters?.selectedClient),
  });

  // Fetch client list explicitly for the parameters dialog
  const { data: clients = [] } = useQuery({
    queryKey: ['productivity-clients-list'],
    queryFn: fetchClientList,
  });

  // Fetch driver groups for the selected client
  const { data: driverGroups = [] } = useQuery({
    queryKey: ['productivity-driver-groups', filters?.selectedClient],
    queryFn: () => fetchDriverGroups(filters?.selectedClient),
    enabled: !!filters?.selectedClient,
  });
  
  const handleRefreshParameters = () => {
    refetchParameters();
  };
  
  // Get group names for the select dropdown - properly handling different data formats
  const groupNames = React.useMemo(() => {
    if (!Array.isArray(driverGroups) || driverGroups.length === 0) {
      return [];
    }

    return driverGroups.map(group => {
      if (typeof group === 'string') {
        return group;
      }
      if (group && typeof group === 'object' && 'name' in group) {
        return (group as { name: string }).name;
      }
      return '';
    }).filter(Boolean);
  }, [driverGroups]);
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Análisis de Productividad</h3>
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 bg-white hover:bg-gray-50 text-gray-700"
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
      
      <div className="grid grid-cols-1 gap-8">
        <Card className="border shadow-sm rounded-xl bg-white/90 backdrop-blur-sm">
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
        availableGroups={groupNames}
        clientList={clients}
      />
      
      {/* Parameters Table */}
      <Card className="border shadow-sm rounded-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Parámetros de Productividad</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductivityParametersTable 
            parameters={parameters || []}
            clients={clients}
            driverGroups={groupNames}
            isLoading={isLoadingParameters}
            onRefresh={handleRefreshParameters}
            selectedClient={filters?.selectedClient}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
