
import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
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

  const { data: clientList } = useQuery<string[]>({
    queryKey: ['driver-behavior-clients'],
    queryFn: () => fetchClientList(),
  });

  const { data: driverData, isLoading, error } = useQuery<DriverBehaviorData | null>({
    queryKey: ['driver-behavior-data', dateRange, filters],
    queryFn: () => fetchDriverBehaviorData(dateRange, filters),
  });

  const { data: comparisonData } = useQuery<DriverBehaviorData | null>({
    queryKey: ['driver-behavior-comparison-data', comparisonRange, filters],
    queryFn: () => comparisonRange ? fetchDriverBehaviorData(comparisonRange, filters) : null,
    enabled: !!comparisonRange && comparisonRange.from !== null && comparisonRange.to !== null,
  });

  const handleFilterChange = (newFilters: DriverBehaviorFilters) => {
    setFilters(newFilters);
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
    <div className="space-y-6">
      <DriverBehaviorFiltersPanel 
        clientList={clientList || []} 
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
