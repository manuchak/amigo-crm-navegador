
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <MetricsChart data={performanceData} isLoading={isLoading} />
      </div>
      <div>
        <ValidationsChart data={performanceData} isLoading={isLoading} />
      </div>
    </div>
  );
}
