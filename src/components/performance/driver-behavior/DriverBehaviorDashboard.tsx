
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { fetchDriverBehaviorData } from "../services/driverBehavior/driverBehaviorService";
import { DriverBehaviorMetricsCards } from './DriverBehaviorMetricsCards';
import { DriverBehaviorTable } from './DriverBehaviorTable';
import { DriverBehaviorChart } from './DriverBehaviorChart';

interface DriverBehaviorDashboardProps {
  dateRange: DateRange;
  comparisonRange?: DateRange;
}

export function DriverBehaviorDashboard({ dateRange, comparisonRange }: DriverBehaviorDashboardProps) {
  const { data: driverData, isLoading, error } = useQuery({
    queryKey: ['driver-behavior-data', dateRange],
    queryFn: () => fetchDriverBehaviorData(dateRange),
  });

  const { data: comparisonData } = useQuery({
    queryKey: ['driver-behavior-comparison-data', comparisonRange],
    queryFn: () => comparisonRange ? fetchDriverBehaviorData(comparisonRange) : null,
    enabled: !!comparisonRange && comparisonRange.from !== null && comparisonRange.to !== null,
  });

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
      <DriverBehaviorMetricsCards 
        data={driverData} 
        comparisonData={comparisonData}
        isLoading={isLoading} 
      />
      
      <DriverBehaviorChart 
        data={driverData?.driverScores} 
        isLoading={isLoading} 
        dateRange={dateRange} 
      />
      
      <DriverBehaviorTable 
        dateRange={dateRange}
      />
    </div>
  );
}
