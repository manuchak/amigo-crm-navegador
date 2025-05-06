
import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { DriverBehaviorChart } from './DriverBehaviorChart';
import { DriverBehaviorMetricsCards } from './DriverBehaviorMetricsCards';
import { DriverBehaviorTable } from './DriverBehaviorTable';
import { DriverBehaviorFiltersPanel } from './DriverBehaviorFiltersPanel';
import { DriverRiskAssessment } from './DriverRiskAssessment';
import { CO2EmissionsCard } from './CO2EmissionsCard';
import { TopDriversPanel } from './TopDriversPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DriverBehaviorFilters } from '../types/driver-behavior.types';
import { ProductivityDashboard } from './productivity/ProductivityDashboard';

interface DriverBehaviorDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
  onOpenGroupsManagement?: (client?: string) => void;
}

export function DriverBehaviorDashboard({ 
  dateRange,
  comparisonRange,
  onOpenGroupsManagement
}: DriverBehaviorDashboardProps) {
  const [activeTab, setActiveTab] = useState('resumen');
  const [filters, setFilters] = useState<DriverBehaviorFilters>({});
  
  // Manejar cambios en los filtros
  const handleFilterChange = (newFilters: DriverBehaviorFilters) => {
    setFilters(newFilters);
  };
  
  // Log para depuración
  useEffect(() => {
    console.log('DriverBehaviorDashboard render', { 
      dateRange, 
      comparisonRange,
      onOpenGroupsManagement: !!onOpenGroupsManagement,
      filters 
    });
  }, [dateRange, comparisonRange, onOpenGroupsManagement, filters]);

  return (
    <div className="space-y-6">
      {/* Filtros para comportamiento de conducción */}
      <DriverBehaviorFiltersPanel 
        onFilterChange={handleFilterChange} 
        activeTab={activeTab}
        filters={filters}
        onManageGroups={onOpenGroupsManagement}
      />
      
      {/* Tabs para las diferentes vistas de comportamiento de conducción */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-background/70 border shadow-sm rounded-xl p-1.5">
          <TabsTrigger value="resumen" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="productividad" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2">
            Productividad
          </TabsTrigger>
          <TabsTrigger value="riesgo" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2">
            Evaluación de Riesgo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen" className="space-y-6">
          <DriverBehaviorMetricsCards 
            dateRange={dateRange}
            comparisonRange={comparisonRange}
            filters={filters}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DriverBehaviorChart 
                dateRange={dateRange}
                filters={filters}
              />
            </div>
            <CO2EmissionsCard 
              dateRange={dateRange}
              filters={filters}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DriverBehaviorTable 
                dateRange={dateRange}
                filters={filters}
              />
            </div>
            <TopDriversPanel 
              dateRange={dateRange}
              filters={filters}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="productividad" className="space-y-6">
          <ProductivityDashboard 
            dateRange={dateRange} 
            filters={filters} 
            onOpenGroupsManagement={onOpenGroupsManagement}
          />
        </TabsContent>
        
        <TabsContent value="riesgo" className="space-y-6">
          <DriverRiskAssessment 
            dateRange={dateRange}
            filters={filters}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
