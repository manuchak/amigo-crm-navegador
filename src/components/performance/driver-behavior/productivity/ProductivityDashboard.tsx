
import React from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { DriverBehaviorFilters } from '../../types/driver-behavior.types';
import { fetchProductivityParameters, fetchDriverGroups, fetchClientList } from '../../services/productivity/productivityService';
import { ProductivityMetricsCards } from './ProductivityMetricsCards';
import { ProductivityEfficiencyCards } from './ProductivityEfficiencyCards';
import { DriverRatingTable } from './DriverRatingTable';
import { GroupProductivityCard } from './GroupProductivityCard';
import { ProductivityAnalysisTable } from './ProductivityAnalysisTable';
import { ProductivityParametersDialog } from './ProductivityParametersDialog';
import { ProductivityParametersTable } from './ProductivityParametersTable';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductivityDashboardProps {
  dateRange: DateRange;
  filters?: DriverBehaviorFilters;
}

export function ProductivityDashboard({ dateRange, filters = {} }: ProductivityDashboardProps) {
  const [showParameters, setShowParameters] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');
  
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
    <div className="space-y-8">
      {/* Header with title and client info */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Análisis de Productividad</h2>
          {filters?.selectedClient && (
            <div className="mt-1 flex items-center">
              <Badge variant="outline" className="bg-white">
                Cliente: {filters.selectedClient}
              </Badge>
            </div>
          )}
        </div>
        <Button 
          onClick={() => setShowParameters(true)}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border shadow-sm"
        >
          <Settings className="h-4 w-4" />
          <span>Configurar Parámetros</span>
        </Button>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white shadow-sm border rounded-lg">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="drivers">Conductores</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="parameters">Parámetros</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 animate-fade-in">
          {/* Main Summary Metrics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductivityMetricsCards 
              dateRange={dateRange}
              filters={filters}
            />
          </motion.div>

          {/* Efficiency Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ProductivityEfficiencyCards 
              dateRange={dateRange}
              filters={filters}
            />
          </motion.div>
          
          {/* Analysis Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ProductivityAnalysisTable 
              dateRange={dateRange}
              filters={filters}
            />
          </motion.div>
        </TabsContent>
        
        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-8 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DriverRatingTable 
              dateRange={dateRange}
              filters={filters}
            />
          </motion.div>
        </TabsContent>
        
        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-8 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GroupProductivityCard 
              dateRange={dateRange}
              filters={filters}
            />
          </motion.div>
        </TabsContent>
        
        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-8 animate-fade-in">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ProductivityParametersTable 
              parameters={parameters || []}
              clients={clients}
              driverGroups={groupNames}
              isLoading={isLoadingParameters}
              onRefresh={handleRefreshParameters}
              selectedClient={filters?.selectedClient}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
      
      {/* Parameters Dialog */}
      <ProductivityParametersDialog 
        open={showParameters}
        onClose={() => setShowParameters(false)}
        onSaved={handleRefreshParameters}
        selectedClient={filters?.selectedClient}
        availableGroups={groupNames}
        clientList={clients}
      />
    </div>
  );
}
