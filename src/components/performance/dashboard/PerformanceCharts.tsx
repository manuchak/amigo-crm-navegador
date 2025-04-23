
import React from 'react';
import { MetricsChart } from './charts/MetricsChart';
import { ValidationsChart } from './charts/ValidationsChart';

interface PerformanceChartsProps {
  performanceData?: {
    date: string;
    completionRate: number;
    responseTime: number;
    reliability: number;
    quality: number;
    validations: number;
  }[];
  isLoading: boolean;
}

export function PerformanceCharts({ performanceData, isLoading }: PerformanceChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MetricsChart data={performanceData} isLoading={isLoading} />
      <ValidationsChart data={performanceData} isLoading={isLoading} />
    </div>
  );
}
