
import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { fetchDriverBehaviorData, fetchClientList } from "../services/driverBehavior/driverBehaviorService";
import { DriverBehaviorMetricsCards } from './DriverBehaviorMetricsCards';
import { DriverBehaviorTable } from './DriverBehaviorTable';
import { DriverBehaviorChart } from './DriverBehaviorChart';
import { DriverBehaviorData, DriverBehaviorFilters } from '../types/driver-behavior.types';
import { Card, CardContent } from '@/components/ui/card';
import { DriverBehaviorFiltersPanel } from './DriverBehaviorFiltersPanel';
import { DriverRiskAssessment } from './DriverRiskAssessment';
import { TopDriversPanel } from './TopDriversPanel';
import { CO2EmissionsCard } from './CO2EmissionsCard';

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
  
  const handleImportComplete = useCallback(() => {
    // Invalidate queries to refresh data after import
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-data'] });
    queryClient.invalidateQueries({ queryKey: ['driver-behavior-clients'] });
  }, [queryClient]);

  if (error) {
    console.error('Error loading driver behavior data:', error);
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error al cargar los datos de comportamiento de conducción</p>
      </div>
    );
  }

  // Log data to help debug the issue
  console.log('Client list in dashboard:', clientList);
  console.log('Current filters:', filters);

  return (
    <div className="space-y-6">
      <DriverBehaviorFiltersPanel 
        clientList={Array.isArray(clientList) ? clientList : []} 
        onFilterChange={handleFilterChange} 
        filters={filters} 
      />
      
      <DriverBehaviorMetricsCards 
        data={driverData} 
        comparisonData={comparisonData}
        isLoading={isLoading} 
      />
      
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
      
      <DriverBehaviorTable 
        dateRange={dateRange}
        filters={filters}
      />
    </div>
  );
}
