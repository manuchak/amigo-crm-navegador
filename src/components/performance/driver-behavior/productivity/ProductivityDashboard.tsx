import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DriverBehaviorFilters, ProductivityParametersTableProps, ProductivityParametersDialogProps } from '../../types/driver-behavior.types';
import { ProductivityMetricsCards } from './ProductivityMetricsCards';
import { ProductivityEfficiencyCards } from './ProductivityEfficiencyCards';
import { DriverRatingTable } from './DriverRatingTable';
import { ProductivityAnalysisTable } from './ProductivityAnalysisTable';
import { ProductivityParametersDialog } from './ProductivityParametersDialog';
import { ProductivityParametersTable } from './ProductivityParametersTable';
import { Button } from '@/components/ui/button';
import { GroupProductivityCard } from './GroupProductivityCard';
import { Users } from 'lucide-react';

// Interface for the component props
export interface ProductivityDashboardProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
  onOpenGroupsManagement?: (client?: string) => void;
}

export function ProductivityDashboard({ 
  dateRange, 
  filters,
  onOpenGroupsManagement
}: ProductivityDashboardProps) {
  const [isParametersDialogOpen, setIsParametersDialogOpen] = useState(false);
  
  // Log for debugging
  useEffect(() => {
    console.log("ProductivityDashboard render:", {
      dateRange,
      filters,
      onOpenGroupsManagement: !!onOpenGroupsManagement
    });
  }, [dateRange, filters, onOpenGroupsManagement]);

  // Get the selected client from filters
  const selectedClient = filters.selectedClient !== 'all' ? filters.selectedClient : undefined;
  
  // Handler for opening the group management panel
  const handleManageGroups = () => {
    console.log("Opening groups management from ProductivityDashboard");
    if (onOpenGroupsManagement) {
      onOpenGroupsManagement(selectedClient);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with client and group info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Análisis de Productividad</h3>
          <p className="text-sm text-muted-foreground">
            {selectedClient 
              ? `Cliente: ${selectedClient}${filters.selectedGroup && filters.selectedGroup !== 'all' ? ` / Grupo: ${filters.selectedGroup}` : ''}`
              : 'Seleccione un cliente para ver análisis detallado'}
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedClient && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManageGroups}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Gestionar Grupos</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsParametersDialogOpen(true)}
              >
                Parámetros
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Main content */}
      {selectedClient ? (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <ProductivityMetricsCards 
            dateRange={dateRange}
            filters={filters}
          />

          {/* Efficiency cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductivityEfficiencyCards 
                dateRange={dateRange}
                filters={filters}
              />
            </div>
            <GroupProductivityCard 
              dateRange={dateRange}
              filters={filters}
            />
          </div>
          
          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DriverRatingTable 
              dateRange={dateRange}
              filters={filters}
            />
            <ProductivityParametersTable 
              client={selectedClient}
              group={filters.selectedGroup !== 'all' ? filters.selectedGroup : undefined}
              onEditParameters={() => setIsParametersDialogOpen(true)}
            />
          </div>
          
          {/* Full width analysis table */}
          <ProductivityAnalysisTable 
            dateRange={dateRange}
            filters={filters}
          />
          
          {/* Parameters dialog */}
          <ProductivityParametersDialog 
            isOpen={isParametersDialogOpen}
            onClose={() => setIsParametersDialogOpen(false)}
            client={selectedClient}
            group={filters.selectedGroup !== 'all' ? filters.selectedGroup : undefined}
          />
        </div>
      ) : (
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Seleccione un cliente</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Para ver el análisis de productividad, seleccione un cliente usando los filtros en la parte superior.
          </p>
        </div>
      )}
    </div>
  );
}
